import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

// ✅ 自动分组 + 折叠（不需要 index.md）
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

    // 👇 强制关闭 shiki 高亮，彻底解决所有语言注册报错
    markdown: {
        lineNumbers: true,
        shiki: false, // 👈 关键：彻底禁用报错根源
    },

    themeConfig: {
        sidebar: groupSidebar(rawSidebar)
    }
})