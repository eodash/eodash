
declare module "@eox/pages-theme-eox/config" {
  import type { RawConfigExports,Config } from "vitepress";
  const baseConfig: (brand: string) => Promise<RawConfigExports<Config>>;
  export default baseConfig;
}
