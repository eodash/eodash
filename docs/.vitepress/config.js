import { defineConfig } from 'vitepress'
import typedocSidebar from '../api/typedoc-sidebar.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Eodash",
  description: "Earth Observation Dashboard",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Get Started', link: '/get-started' },
      { text: 'API', link: '/api/' }

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
        items: typedocSidebar,
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/eodash/eodash' }
    ]
  }
})
