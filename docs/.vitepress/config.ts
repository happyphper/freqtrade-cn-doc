
import { defineConfig } from 'vitepress'

export default defineConfig({
    title: "Freqtrade 中文文档",
    description: "Freqtrade 官方文档中文镜像",
    head: [['icon', { type: 'image/svg+xml', href: '/freqtrade-logo.svg' }]], // Placeholder logo

    lastUpdated: true,
    cleanUrls: true,
    ignoreDeadLinks: true,

    themeConfig: {
        logo: 'https://raw.githubusercontent.com/freqtrade/freqtrade/develop/docs/images/logo.png', // Direct link to repo asset or local if copied

        nav: [
            { text: '首页', link: '/' },
            { text: 'GitHub', link: 'https://github.com/freqtrade/freqtrade' }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/freqtrade/freqtrade' },
            { icon: 'telegram', link: 'https://t.me/+2mTQbAaN0hkyYjA1' }
        ],

        search: {
            provider: 'local'
        }
    },

    locales: {
        root: {
            label: '简体中文',
            lang: 'zh-CN',
            link: '/zh/',
            themeConfig: {
                nav: [
                ],
                sidebar: getSidebar('/zh/'),
                docFooter: {
                    prev: '上一页',
                    next: '下一页'
                },
                lastUpdatedText: '最后更新于',
                outlineTitle: '本页内容',
                editLink: {
                    pattern: 'https://github.com/freqtrade/freqtrade/edit/develop/docs/:path',
                    text: '在 GitHub 上编辑此页'
                }
            }
        },
        en: {
            label: 'English',
            lang: 'en-US',
            link: '/en/',
            themeConfig: {
                nav: [
                ],
                sidebar: getSidebar('/en/'),
                docFooter: {
                    prev: 'Previous page',
                    next: 'Next page'
                },
                lastUpdatedText: 'Last updated',
                outlineTitle: 'On this page',
            }
        }
    }
})

function getSidebar(base: string) {
    const isZh = base === '/zh/'

    return [
        { text: isZh ? '首页' : 'Home', link: `${base}index` },
        { text: isZh ? 'Docker 快速入手' : 'Quickstart with Docker', link: `${base}docker_quickstart` },
        {
            text: isZh ? '安装' : 'Installation',
            collapsed: false,
            items: [
                { text: isZh ? 'Linux/MacOS/树莓派' : 'Linux/MacOS/Raspberry', link: `${base}installation` },
                { text: isZh ? 'Windows' : 'Windows', link: `${base}windows_installation` },
            ]
        },
        { text: isZh ? 'Freqtrade 基础' : 'Freqtrade Basics', link: `${base}bot-basics` },
        { text: isZh ? '配置' : 'Configuration', link: `${base}configuration` },
        { text: isZh ? '策略快速入门' : 'Strategy Quickstart', link: `${base}strategy-101` },
        { text: isZh ? '策略自定义' : 'Strategy Customization', link: `${base}strategy-customization` },
        { text: isZh ? '策略回调函数' : 'Strategy Callbacks', link: `${base}strategy-callbacks` },
        { text: isZh ? '止损' : 'Stoploss', link: `${base}stoploss` },
        { text: isZh ? '插件' : 'Plugins', link: `${base}plugins` },
        { text: isZh ? '启动机器人' : 'Start the bot', link: `${base}bot-usage` },
        {
            text: isZh ? '控制机器人' : 'Control the bot',
            collapsed: false,
            items: [
                { text: isZh ? 'Telegram' : 'Telegram', link: `${base}telegram-usage` },
                { text: isZh ? 'freqUI' : 'freqUI', link: `${base}freq-ui` },
                { text: isZh ? 'REST API' : 'REST API', link: `${base}rest-api` },
                { text: isZh ? 'Web Hook' : 'Web Hook', link: `${base}webhook-config` },
            ]
        },
        { text: isZh ? '数据下载' : 'Data Downloading', link: `${base}data-download` },
        { text: isZh ? '回测' : 'Backtesting', link: `${base}backtesting` },
        { text: isZh ? '超参数优化' : 'Hyperopt', link: `${base}hyperopt` },
        {
            text: isZh ? 'FreqAI' : 'FreqAI',
            collapsed: true,
            items: [
                { text: isZh ? '简介' : 'Introduction', link: `${base}freqai` },
                { text: isZh ? '配置' : 'Configuration', link: `${base}freqai-configuration` },
                { text: isZh ? '参数表' : 'Parameter table', link: `${base}freqai-parameter-table` },
                { text: isZh ? '特征工程' : 'Feature engineering', link: `${base}freqai-feature-engineering` },
                { text: isZh ? '运行 FreqAI' : 'Running FreqAI', link: `${base}freqai-running` },
                { text: isZh ? '强化学习' : 'Reinforcement Learning', link: `${base}freqai-reinforcement-learning` },
                { text: isZh ? '开发者指南' : 'Developer guide', link: `${base}freqai-developers` },
            ]
        },
        { text: isZh ? '做空 / 杠杆' : 'Short / Leverage', link: `${base}leverage` },
        { text: isZh ? '子命令工具' : 'Utility Sub-commands', link: `${base}utils` },
        { text: isZh ? '绘图' : 'Plotting', link: `${base}plotting` },
        { text: isZh ? '交易所特定说明' : 'Exchange-specific Notes', link: `${base}exchanges` },
        {
            text: isZh ? '数据分析' : 'Data Analysis',
            collapsed: true,
            items: [
                { text: isZh ? 'Jupyter Notebooks' : 'Jupyter Notebooks', link: `${base}data-analysis` },
                { text: isZh ? '策略分析' : 'Strategy analysis', link: `${base}strategy_analysis_example` },
                { text: isZh ? '回测分析' : 'Backtest analysis', link: `${base}advanced-backtesting` },
            ]
        },
        {
            text: isZh ? '高级主题' : 'Advanced Topics',
            collapsed: true,
            items: [
                { text: isZh ? '高级安装后任务' : 'Advanced Post-installation Tasks', link: `${base}advanced-setup` },
                { text: isZh ? '交易对象 (Trade Object)' : 'Trade Object', link: `${base}trade-object` },
                { text: isZh ? '前瞻分析' : 'Lookahead analysis', link: `${base}lookahead-analysis` },
                { text: isZh ? '递归分析' : 'Recursive analysis', link: `${base}recursive-analysis` },
                { text: isZh ? '高级策略' : 'Advanced Strategy', link: `${base}strategy-advanced` },
                { text: isZh ? '高级超参数优化' : 'Advanced Hyperopt', link: `${base}advanced-hyperopt` },
                { text: isZh ? '订单流 (Orderflow)' : 'Orderflow', link: `${base}advanced-orderflow` },
                { text: isZh ? '生产者/消费者模式' : 'Producer/Consumer mode', link: `${base}producer-consumer` },
                { text: isZh ? 'SQL 速查表' : 'SQL Cheat-sheet', link: `${base}sql_cheatsheet` },
            ]
        },
        { text: isZh ? '常见问题' : 'FAQ', link: `${base}faq` },
        { text: isZh ? '策略迁移' : 'Strategy migration', link: `${base}strategy_migration` },
        { text: isZh ? '更新 Freqtrade' : 'Updating Freqtrade', link: `${base}updating` },
        { text: isZh ? '弃用功能' : 'Deprecated Features', link: `${base}deprecated` },
        { text: isZh ? '贡献者指南' : 'Contributors Guide', link: `${base}developer` },
    ]
}
