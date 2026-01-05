
import DefaultTheme from 'vitepress/theme'
import mediumZoom from 'medium-zoom'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import './index.css'

export default {
    extends: DefaultTheme,
    setup() {
        const route = useRoute()
        const initZoom = () => {
            // 对 .vp-doc 区域内的所有图片启用缩放
            // 排除链接图片和特定排除类名的图片
            mediumZoom('.vp-doc img:not(.no-zoom)', {
                background: 'var(--vp-c-bg)',
                margin: 24
            })
        }

        onMounted(() => {
            initZoom()
        })

        watch(
            () => route.path,
            () => nextTick(() => initZoom())
        )
    }
}
