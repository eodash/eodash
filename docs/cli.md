# Eodash Command Line Interface
eodash CLI is powered by [Vite](https://vite.dev), providing an optimized development experience and producing minified ESM bundles for production. 
<script setup>
    const options = {
        "-v, --version": ["output the current version"],
        "--publicDir <path> ": ["path to statically served assets folder", "/public"],
        "--no-publicDir": ["do not serve static assets"],
        "--outDir <path>": ["sets the minified output folder",".eodash/dist"],
        "-e, --entryPoint <path>": ["file exporting `createEodash` ","src/main.js"],
        "-w, --widgets <path>": ["folder that contains vue components as internal widgets","src/widgets"],
        "--cacheDir <path>": ["set cache folder",".eodash/cache"],
        "-r, --runtime <path>": ["file exporting eodash client runtime config","src/runtime.js"],
        "-b, --base <path>": ["base public path","/"],
        "-p, --port <port>": ["serving  port"],
        "-o, --open": ["open default browser when the server starts","false"],  
        "-c, --config <path>": ["path to eodash server and build configuration file ","eodash.config.js"],
        "--host [IP address]": ["specify which IP addresses the server should listen on","false"],
        "--no-host": ["do not expose server to the network"],
        "-l, --lib": ["builds and serves eodash as a web component","false"],
        "--no-lib": ["builds and serves eodash as an SPA"]
    }
    const devOptions = Object.keys(options).filter(opt => opt !==  "--outDir <path>");
    const buildOptions =  Object.keys(options).filter(opt => !["--cacheDir <path>","-b, --base <path>", "-p, --port <port>","-o, --open", "--host [IP address]","--no-host"].includes(opt));
    const preiewOptions = Object.keys(options).filter(opt => ["-v, --version", "-b, --base <path>","-p, --port <port>","-o, --open","--host [IP address]","--no-host"].includes(opt))

</script>

## dev
Starts vite's dev server.

### usage
```bash
eodash dev
```
### options
<table>
  <tr>
    <th>Option</th>
    <th>Description</th>
    <th>Default</th>
  </tr>
  <tr v-for="opt in devOptions" >
    <td>{{opt}}</td>
    <td>{{ options[opt][0]}}</td>
    <td>{{ options[opt]?.[1] ?? '--'}}</td>
  </tr>
</table>

## build
Builds eodash for production

### usage
```bash
eodash build
```
### options
<table>
  <tr>
    <th>Option</th>
    <th>Description</th>
    <th>Default</th>
  </tr>
  <tr v-for="opt in buildOptions" >
    <td>{{opt}}</td>
    <td>{{ options[opt][0]}}</td>
    <td>{{ options[opt]?.[1] ?? '--'}}</td>
  </tr>
</table>

## preview
Locally preview the production build. This is not intended to be used for production.

### usage
```bash
eodash preview
```
### options
<table>
  <tr>
    <th>Option</th>
    <th>Description</th>
    <th>Default</th>

  </tr>
  <tr v-for="opt in preiewOptions" >
    <td>{{opt}}</td>
    <td>{{ options[opt][0]}}</td>
    <td>{{ options[opt]?.[1] ?? '--'}}</td>
  </tr>
</table>

## Configuration 
While running the eodash command line, it automatically tries to locate a configuration file named `eodash.config.js` from the root folder of your project. You can also explicitly specify a config file to use with the `--config` or `-c` CLI option (resolved relative to your projects root folder). You can also override the configuration values using the CLI options. refer to the [API](api/bin/types/interfaces/EodashConfig.html) to learn more:

### `eodash.config.js` Basic Example
```js
export default {
    lib: false,
    dev: {
        port: 3333,
        open: true
    }
    ...
}
```

### Integrate your IDE’s intellisense 
with eodash’s TypeScript typings using jsdoc hints

```js
/** @type {import("@eodash/eodash/config").EodashConfig} */
export default {
    ...
}
```
Or using the `defineConfig` helper funtion

```js
import { defineConfig } from "@eodash/eodash/config"
export default defineConfig({
    ...
})
```