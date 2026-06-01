import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";

import { loading } from "@/store/states";

const instance = Axios.create();
export const axios = setupCache(instance, { cacheTakeover: false });

let activeRequests = 0;

function installLoadingInterceptors() {
  const reqId = axios.interceptors.request.use((config) => {
    activeRequests++;
    loading.value = true;
    return config;
  });

  const resId = axios.interceptors.response.use(
    (response) => {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0) loading.value = false;
      return response;
    },
    (error) => {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0) loading.value = false;
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
