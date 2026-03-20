import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

// ✅ 自动分组 + 折叠
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

// ✅ 原始 sidebar
const rawSidebar = generateSidebar({
    documentRootPath: 'docs'
})

export default defineConfig({
    title: "姚留洋的技术博客",

    markdown: {
        lineNumbers: true,

        config(md) {
            const fence = md.renderer.rules.fence!

            md.renderer.rules.fence = (tokens, idx, options, env, self) => {
                const token = tokens[idx]

                let lang = (token.info || '').trim().toLowerCase()

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

                // ✅ 映射
                if (langMap[lang]) {
                    token.info = langMap[lang]
                }
                // ✅ 处理 php+html / vue+ts
                else if (lang.includes('+')) {
                    token.info = lang.split('+')[0]
                }

                // ✅ 安全语言白名单（防止 shiki 报错）
                const safeLangs = [
                    'js','ts','html','css','json',
                    'bash','sql','php','vue',
                    'yaml','markdown','text','txt'
                ]

                if (!safeLangs.includes(token.info)) {
                    token.info = 'text'
                }

                try {
                    return fence(tokens, idx, options, env, self)
                } catch (e) {
                    // 💥 最后一层保险
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