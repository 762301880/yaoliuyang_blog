import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

// ✅ 自动分组 + 折叠
function groupSidebar(sidebar: any[]) {
    const result: any[] = []

    sidebar.forEach(item => {
        // 1️⃣ 已经是分组
        if (item.items && item.items.length) {
            result.push({
                ...item,
                collapsed: true
            })
            return
        }

        // 2️⃣ 普通页面
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

        // ✅ 限定合法语言（防 Cloudflare 构建炸）
        languages: ['sql', 'bash', 'yaml', 'dockerfile', 'ts', 'js', 'json', 'html', 'css'],

        config(md) {
            // ✅ 语言映射表
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

            // ✅ 在 parse 阶段提前修正语言（关键）
            const originalParse = md.parse

            md.parse = function (src, env) {
                const tokens = originalParse.call(this, src, env)

                for (const token of tokens) {
                    if (token.type === 'fence') {
                        let lang = (token.info || '').trim().toLowerCase()

                        // 映射语言
                        if (langMap[lang]) {
                            token.info = langMap[lang]
                            continue
                        }

                        // ✅ 兜底：未知语言直接变 text（彻底防炸）
                        if (
                            lang &&
                            ![
                                'sql','bash','yaml','dockerfile',
                                'ts','js','json','html','css',
                                'vue','md','markdown','text'
                            ].includes(lang)
                        ) {
                            token.info = 'text'
                        }
                    }
                }

                return tokens
            }

            // ✅ SSR 安全 fence fallback（防极端情况）
            const defaultFence =
                md.renderer.rules.fence ||
                ((tokens, idx, options, env, self) =>
                    self.renderToken(tokens, idx, options))

            md.renderer.rules.fence = (...args) => {
                try {
                    return defaultFence(...args)
                } catch (e) {
                    const [tokens, idx] = args
                    tokens[idx].info = 'text'
                    return defaultFence(...args)
                }
            }
        }
    },

    themeConfig: {
        sidebar: groupSidebar(rawSidebar)
    }
})