# 生产者/消费者模式 (Producer / Consumer mode)

freqtrade 提供了一种机制，通过消息 websocket，一个实例（也称为 `消费者 (consumer)`）可以监听来自上游 freqtrade 实例（也称为 `生产者 (producer)`）的消息。主要包括 `analyzed_df` 和 `whitelist` 消息。这允许在多个机器人中重复使用为交易对计算的指标（和信号），而无需多次计算它们。

有关为您的消息 websocket 设置 `api_server` 配置的信息，请参阅 Rest API 文档中的 [Message Websocket](rest-api.md#message-websocket)（这将是您的生产者）。

::: info
我们强烈建议将 `ws_token` 设置为仅为您自己知道的随机字符串，以避免未经授权访问您的机器人。
:::

## 配置 (Configuration)

通过在消费者的配置文件中添加 `external_message_consumer` 部分来启用订阅实例。

```json
{
    //...
   "external_message_consumer": {
        "enabled": true,
        "producers": [
            {
                "name": "default", // 可以是您喜欢的任何名称，默认为 "default"
                "host": "127.0.0.1", // 来自生产者 api_server 配置的主机
                "port": 8080, // 来自生产者 api_server 配置的端口
                "secure": false, // 使用安全的 websockets 连接，默认为 false
                "ws_token": "sercet_Ws_t0ken" // 来自生产者 api_server 配置的 ws_token
            }
        ],
        // 以下配置是可选的，通常不要求设置
        // "wait_timeout": 300,
        // "ping_timeout": 10,
        // "sleep_time": 10,
        // "remove_entry_exit_signals": false,
        // "message_size_limit": 8
    }
    //...
}
```

| 参数 | 描述 |
|------------|-------------|
| `enabled` | **必填。** 启用消费者模式。如果设置为 false，此部分中的所有其他设置将被忽略。<br>*默认为 `false`。*<br> **数据类型:** boolean (布尔值) 。
| `producers` | **必填。** 生产者列表 <br> **数据类型:** Array (数组)。
| `producers.name` | **必填。** 此生产者的名称。如果使用了多个生产者，此名称必须在调用 `get_producer_pairs()` 和 `get_producer_df()` 时使用。<br> **数据类型:** string (字符串)
| `producers.host` | **必填。** 生产者的主机名或 IP 地址。<br> **数据类型:** string (字符串)
| `producers.port` | **必填。** 与上述主机匹配的端口。<br>*默认为 `8080`。*<br> **数据类型:** Integer (整数)
| `producers.secure` | **可选。** 在 websockets 连接中使用 ssl。默认为 False。<br> **数据类型:** boolean (布尔值)
| `producers.ws_token` | **必填。** 生产者上配置的 `ws_token`。<br> **数据类型:** string (字符串)
| | **可选设置**
| `wait_timeout` | 如果未收到消息，直到我们再次 ping 的超时时间。 <br>*默认为 `300`。*<br> **数据类型:** Integer (整数) - 单位为秒。
| `ping_timeout` | Ping 超时时间 <br>*默认为 `10`。*<br> **数据类型:** Integer (整数) - 单位为秒。
| `sleep_time` | 重试连接前的休眠时间。<br>*默认为 `10`。*<br> **数据类型:** Integer (整数) - 单位为秒。
| `remove_entry_exit_signals` | 收到数据帧时从数据帧中删除信号列（将它们设置为 0）。<br>*默认为 `false`。*<br> **数据类型:** Boolean (布尔值)。
| `initial_candle_limit` | 期望从生产者获得的初始 K 线数量。<br>*默认为 `1500`。*<br> **数据类型:** Integer (整数) - K 线数量。
| `message_size_limit` | 每条消息的大小限制<br>*默认为 `8`。*<br> **数据类型:** Integer (整数) - 单位为 MB (兆字节)。

追随者实例（follower instance）不再（或不仅）在 `populate_indicators()` 中计算指标，而是监听指向生产者实例消息的连接（在高级配置中可以是多个生产者实例），并请求生产者针对活动白名单中的每个交易对最新分析的数据帧。

然后，消费者实例将拥有分析后数据帧的完整副本，而无需自己进行计算。

## 示例 (Examples)

### 示例 - 生产者策略 (Producer Strategy)

一个具有多个指标的简单策略。策略本身不需要特殊考虑。

```py
class ProducerStrategy(IStrategy):
    #...
    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        以标准的 freqtrade 方式计算指标，然后可以广播到其他实例
        """
        dataframe['rsi'] = ta.RSI(dataframe)
        bollinger = qtpylib.bollinger_bands(qtpylib.typical_price(dataframe), window=20, stds=2)
        dataframe['bb_lowerband'] = bollinger['lower']
        dataframe['bb_middleband'] = bollinger['mid']
        dataframe['bb_upperband'] = bollinger['upper']
        dataframe['tema'] = ta.TEMA(dataframe, timeperiod=9)

        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        填充给定数据帧的入场信号
        """
        dataframe.loc[
            (
                (qtpylib.crossed_above(dataframe['rsi'], self.buy_rsi.value)) &
                (dataframe['tema'] <= dataframe['bb_middleband']) &
                (dataframe['tema'] > dataframe['tema'].shift(1)) &
                (dataframe['volume'] > 0)
            ),
            'enter_long'] = 1

        return dataframe
```

::: tip FreqAI
您可以使用此模式在强大的机器上设置 [FreqAI](freqai.md)，同时在像树莓派这样简单的机器上运行消费者，它们可以以不同的方式解读生产者产生的信号。
:::

### 示例 - 消费者策略 (Consumer Strategy)

一个逻辑等效的策略，它本身不计算任何指标，但将拥有相同的分析后数据帧，可以根据生产者中计算的指标做出交易决策。在此示例中，消费者具有相同的入场准则，但这并非必须。消费者可以使用不同的逻辑来入场/离场交易，仅使用指定的指标。

```py
class ConsumerStrategy(IStrategy):
    #...
    process_only_new_candles = False # 消费者模式必须设置为 False

    _columns_to_expect = ['rsi_default', 'tema_default', 'bb_middleband_default']

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        使用 websocket api 从另一个 freqtrade 实例获取预先填充的指标。
        使用 `self.dp.get_producer_df(pair)` 获取数据帧
        """
        pair = metadata['pair']
        timeframe = self.timeframe

        producer_pairs = self.dp.get_producer_pairs()
        # 您可以通过以下方式指定从哪个生产者获取交易对：
        # self.dp.get_producer_pairs("my_other_producer")

        # 此函数返回分析后的数据帧，以及它是什么时候被分析的
        producer_dataframe, _ = self.dp.get_producer_df(pair)
        # 如果生产者提供了其他数据，您也可以获取：
        # self.dp.get_producer_df(
        #   pair,
        #   timeframe="1h",
        #   candle_type=CandleType.SPOT,
        #   producer_name="my_other_producer"
        # )

        if not producer_dataframe.empty:
            # 如果您打算直接传递生产者的入场/离场信号，
            # 请指定 ffill=False，否则会产生意外结果
            merged_dataframe = merge_informative_pair(dataframe, producer_dataframe,
                                                      timeframe, timeframe,
                                                      append_timeframe=False,
                                                      suffix="default")
            return merged_dataframe
        else:
            dataframe[self._columns_to_expect] = 0

        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        填充给定数据帧的入场信号
        """
        # 使用就像我们自己计算出来的一样的数据帧列
        dataframe.loc[
            (
                (qtpylib.crossed_above(dataframe['rsi_default'], self.buy_rsi.value)) &
                (dataframe['tema_default'] <= dataframe['bb_middleband_default']) &
                (dataframe['tema_default'] > dataframe['tema_default'].shift(1)) &
                (dataframe['volume'] > 0)
            ),
            'enter_long'] = 1

        return dataframe
```

::: tip 使用上游信号
通过设置 `remove_entry_exit_signals=false`，您还可以直接使用生产者的信号。它们应该可以作为 `enter_long_default`（假设使用了 `suffix="default"`）获得，并且可以直接用作任一信号，或作为附加指标。
:::