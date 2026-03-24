import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

// ✅ 自动分组 + 折叠（不需要 index.md）
function groupSidebar(sidebar: any[]) {
    const result: any[] = []

    sidebar.forEach(item => {
        // 1️⃣ 已经是分组（有 items）
        if (item.items && item.items.length) {
            result.push({
                ...item,
                collapsed: true
            })
            return
        }

        // 2️⃣ 普通页面（有 link）
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

// 原始 sidebar
const rawSidebar = generateSidebar({
    documentRootPath: 'docs'
})

export default defineConfig({
    title: "姚留洋的技术博客",

    markdown: {
        lineNumbers: true,

        // ✅ 在“高亮阶段”修正语言（关键）
        highlight(code, lang) {
            const langMap: Record<string, string> = {
                'mysql': 'sql',
                'postgres': 'sql',
                'shell': 'bash',
                'sh': 'bash',
                'zsh': 'bash',
                'env': 'bash',
                'ini': 'bash',
                'conf': 'bash',
                'nginx': 'bash',
                'docker': 'dockerfile',
                'yml': 'yaml',
                'php+html': 'php'
            }

            lang = (lang || '').toLowerCase()

            if (langMap[lang]) {
                lang = langMap[lang]
            }

            try {
                return `<pre><code class="language-${lang}">${code}</code></pre>`
            } catch (e) {
                return `<pre><code>${code}</code></pre>`
            }
        }
    },

    themeConfig: {
        sidebar: groupSidebar(rawSidebar)
    }
})