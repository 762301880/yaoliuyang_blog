import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

// ========================
// ✅ 自动分组 + 折叠
// ========================
function groupSidebar(sidebar: any[]) {
    const result: any[] = []

    sidebar.forEach(item => {
        // 已经是分组
        if (item.items && item.items.length) {
            result.push({
                ...item,
                collapsed: true
            })
            return
        }

        // 普通页面
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

// ========================
// ✅ 原始 sidebar
// ========================
const rawSidebar = generateSidebar({
    documentRootPath: 'docs'
})

// ========================
// ✅ 语言映射
// ========================
const langMap: Record<string, string> = {
    mysql: 'sql',
    postgres: 'sql',
    shell: 'bash',
    sh: 'bash',
    zsh: 'bash',
    env: 'bash',
    ini: 'bash',
    conf: 'bash',
    nginx: 'bash',
    docker: 'dockerfile',
    yml: 'yaml',
    'php+html': 'php'
}

// ========================
// ✅ 安全语言白名单
// ========================
const safeLangs = [
    'js','ts','html','css','json',
    'bash','sql','php','vue',
    'yaml','markdown','text','txt'
]

// ========================
// ✅ 导出配置
// ========================
export default defineConfig({

    title: "姚留洋的技术博客",

    // 忽略死链
    ignoreDeadLinks: true,

    markdown: {
        lineNumbers: true,

        // ========================
        // 🚀 终极兜底（关键）
        // ========================
        async highlight(code, lang) {

            lang = (lang || '').toLowerCase()

            // 👉 映射
            if (langMap[lang]) {
                lang = langMap[lang]
            } else if (lang.includes('+')) {
                lang = lang.split('+')[0]
            }

            // 👉 白名单过滤
            if (!safeLangs.includes(lang)) {
                lang = 'text'
            }

            try {
                const { getHighlighter } = await import('shiki')

                const highlighter = await getHighlighter({
                    themes: ['nord'],
                    langs: safeLangs
                })

                return highlighter.codeToHtml(code, { lang })
            } catch (e) {
                // 💥 最后一层保险（永不失败）
                return `<pre><code>${code}</code></pre>`
            }
        },

        // ========================
        // ✅ fence 预处理（可选增强）
        // ========================
        config(md) {
            const fence = md.renderer.rules.fence!

            md.renderer.rules.fence = (tokens, idx, options, env, self) => {
                const token = tokens[idx]

                let lang = (token.info || '').trim().toLowerCase()

                // 👉 映射
                if (langMap[lang]) {
                    token.info = langMap[lang]
                } else if (lang.includes('+')) {
                    token.info = lang.split('+')[0]
                }

                // 👉 白名单
                if (!safeLangs.includes(token.info)) {
                    token.info = 'text'
                }

                try {
                    return fence(tokens, idx, options, env, self)
                } catch (e) {
                    token.info = 'text'
                    return fence(tokens, idx, options, env, self)
                }
            }
        }
    },

    themeConfig: {
        sidebar: groupSidebar(rawSidebar)
    }
})