import { ref } from "vue";

/**
 * The list of job result from the server
 * {job_start_datetime: string, job_end_datetime: string,status: string}
 *  @type {import("vue").Ref<import("./types").AsyncJob[]>}
 **/
export const jobs = ref([]);
/**
 * The list of jobs results from the server for the compare map
 * @type {import("vue").Ref<import("./types").AsyncJob[]>}
 */
export const compareJobs = ref([]);
