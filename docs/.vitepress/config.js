import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Eodash",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Get Started', link: '/get-started' }
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is Eodash', link: '/what-is-eodash' },
          { text: 'Get Started', link: '/get-started' }
        ]
      },
      {
        text: 'Guide',
        items: [
          { text: 'Best Practices', link: '/best-practices' },
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'Eodash Config', link: '/eodash-config' },
          { text: 'Eodash Store', link: '/eodash-store' }
        ]
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
