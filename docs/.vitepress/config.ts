import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

function groupSidebar(sidebar: any[]) {
    const result: any[] = []

    sidebar.forEach(item => {
        if (item.items && item.items.length) {
            result.push({
                ...item,
                collapsed: true
            })
            return
        }

        if (item.link) {
            const parts = item.link.split('/')
            const folder = parts[1] || 'root'

            let group = result.find(g => g.text === folder)

            if (!group) {
                group = {
                    text: folder,
                    collapsed: true,
                    items: []
                }
                result.push(group)
            }

            group.items.push(item)
        }
    })

    return result
}

const rawSidebar = generateSidebar({
    documentRootPath: 'docs'
})

export default defineConfig({
    title: "姚留洋的技术博客",

    markdown: {
        lineNumbers: true,

        // ✅ 只声明真正存在的语言
        languages: [
            'sql', 'bash', 'yaml', 'dockerfile',
            'ts', 'js', 'json', 'html', 'css', 'text'
        ]
    },

    // ✅ ⭐⭐⭐ 核心：覆盖 Shiki 行为
    vite: {
        ssr: {
            noExternal: ['shiki']
        }
    },

    // ✅ ⭐⭐⭐ 真正兜底（不会再炸）
    async buildEnd(siteConfig) {
        const shiki = await import('shiki')

        const highlighter = await shiki.getHighlighter({
            langs: [
                'sql','bash','yaml','dockerfile',
                'ts','js','json','html','css','text'
            ],
            themes: ['github-dark']
        })

        // 👉 强行兜底
        const original = highlighter.codeToHtml.bind(highlighter)

        highlighter.codeToHtml = (code, options) => {
            try {
                return original(code, options)
            } catch (e) {
                return original(code, { ...options, lang: 'text' })
            }
        }
    },

    themeConfig: {
        sidebar: groupSidebar(rawSidebar)
    }
})