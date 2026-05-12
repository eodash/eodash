import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";

import { loading } from "@/store/states";

const instance = Axios.create();
export const axios = setupCache(instance, { cacheTakeover: false });

axios.interceptors.request.use((config) => {
  loading.activeLoads++;
  return config;
});

axios.interceptors.response.use(
  (response) => {
    loading.activeLoads--;
    return response;
  },
  (error) => {
    loading.activeLoads--;
    return Promise.reject(error);
  },
);

export default axios;
