# Eodash Command Line Interface

## Commands

* Dev

* Build

* Preview

## Options

|Option                     | Description                                                |   
|---                        | ---                                                        |
|-v, --version              | output the current version                                 |     
|--publicDir `<path>`       | path to statically served assets folder                    |   
|--no-publicDir             | stop serving static assets                                 |   
| --outDir `<path>`         | minified output folder                                     |   
| -e, --entryPoint `<path>` | file exporting `createEodash`                              |   
| -w, --widgets `<path>`    | folder that contains vue components as internal widgets    |   
|--cacheDir `<path>`         | cache folder                                               |   
| -r, --runtime `<path>`    | file exporting eodash client runtime config                |   
| -b, --base `<path>`        | base public path                                           |   
| -p, --port `<port>`        | serving  port                                              |   
| -o, --open               | open default browser when the server starts                |   
| -c, --config `<path>`      | path to eodash server and build configuration file         |   
| --host `[IP address]`      | specify which IP addresses the server should listen on     |   
| -l, --lib                | builds eodash as a web component library                   |   
|  --no-lib                | builds eodash as an SPA                                    |   
| --no-host                | do not expose server to the network                        |   
-----------------------------------------------------------------------------------------

## Configuration 

eodash.config.js and `defineConfig` from `@eodash/eodash/config`