import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";

const instance = Axios.create();

export const axios = setupCache(instance, { cacheTakeover: false });

export default axios;
