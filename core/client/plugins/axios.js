import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";

import { loading } from "@/store/states";

const instance = Axios.create();
export const axios = setupCache(instance, { cacheTakeover: false });

let activeRequests = 0;

axios.interceptors.request.use((config) => {
  activeRequests++;
  loading.value = true;
  return config;
});

axios.interceptors.response.use(
  (response) => {
    activeRequests--;
    if (activeRequests === 0) {
      loading.value = false;
    }
    return response;
  },
  (error) => {
    activeRequests--;
    if (activeRequests === 0) {
      loading.value = false;
    }
    return Promise.reject(error);
  },
);

export default axios;
