import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";

import { loading } from "@/store/states";

const instance = Axios.create();
export const axios = setupCache(instance, { cacheTakeover: false });

function installLoadingInterceptors() {
  const reqId = axios.interceptors.request.use((config) => {
    loading.activeLoads++;
    return config;
  });

  const resId = axios.interceptors.response.use(
    (response) => {
      loading.activeLoads = Math.max(0, loading.activeLoads - 1);
      return response;
    },
    (error) => {
      loading.activeLoads = Math.max(0, loading.activeLoads - 1);
      return Promise.reject(error);
    },
  );

  return () => {
    axios.interceptors.request.eject(reqId);
    axios.interceptors.response.eject(resId);
  };
}

const dispose = installLoadingInterceptors();

if (import.meta.hot) {
  import.meta.hot.dispose(() => dispose());
}

export default axios;
