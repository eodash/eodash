// Stub for the `user:config` specifier. The real app aliases it to the user's
// entry config (or treeshakes the import away when absent). App-flow tests
// inject config via the `config` prop, so `useEodashRuntime` short-circuits
// before reaching the `user:config` branch — this exists only so Vite's
// import-analysis can resolve the specifier at transform time. Never executed.
export default null;
