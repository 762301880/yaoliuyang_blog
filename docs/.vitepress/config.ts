import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

// ========================
// ✅ 自动分组 + 折叠
// ========================
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

// ========================
// ✅ sidebar
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

    ignoreDeadLinks: true,

    markdown: {
        lineNumbers: true,

        // ========================
        // 🚀 核心：解析阶段拦截（不会再炸）
        // ========================
        config(md) {

            md.core.ruler.before('normalize', 'fix-code-lang', (state) => {
                state.tokens.forEach(token => {
                    if (token.type === 'fence') {

                        let lang = (token.info || '').trim().toLowerCase()

                        // 👉 映射
                        if (langMap[lang]) {
                            token.info = langMap[lang]
                        } else if (lang.includes('+')) {
                            token.info = lang.split('+')[0]
                        }

                        // 👉 白名单过滤
                        if (!safeLangs.includes(token.info)) {
                            token.info = 'text'
                        }
                    }
                })
            })
        },

        // ========================
        // 🚀 兜底（防极端情况）
        // ========================
        async highlight(code, lang) {

            lang = (lang || '').toLowerCase()

            if (langMap[lang]) {
                lang = langMap[lang]
            } else if (lang.includes('+')) {
                lang = lang.split('+')[0]
            }

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
                return `<pre><code>${code}</code></pre>`
            }
        }
    },

    themeConfig: {
        sidebar: groupSidebar(rawSidebar)
    }
})