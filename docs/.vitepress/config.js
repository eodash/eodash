import { defineConfig } from 'vitepress'
import typedocSidebar from '../api/typedoc-sidebar.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "eodash",
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.includes('-')
      }
    }
  },
  description: "Earth Observation Ecosystem",
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
          { text: 'What is eodash', link: '/what-is-eodash' },
          { text: 'Get Started', link: '/get-started' }
        ]
      },
      {
        text: 'Guide',
        items: [
          { text: 'Instantiating Eodash', link: '/instantiation' },
          {
            text: 'Widgets', link: '/widgets/',
            items: [
              { text: 'Web Component Widgets', link: '/widgets/webcomponent-widgets' },
              { text: 'Internal Widgets', link: '/widgets/internal-widgets' },
            ]
          },
          { text: 'Branding', link: '/branding' },
          { text: 'Eodash Store', link: '/eodash-store' },
          { text: 'CLI', link: '/cli' },
          { text: 'SPA vs Web Component', link: '/spa-vs-webcomponent' },
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
