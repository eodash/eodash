/** `env` is added by bundlers, so it is not on the standard `ImportMeta`. */
interface ImportMetaEnv {
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env?: ImportMetaEnv;
}
