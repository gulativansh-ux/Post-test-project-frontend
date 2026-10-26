import { requestSend } from "../utility";

export function getJobDetail(jobId) {
  return requestSend(`/fetch-job-detail?requested_job_id=${jobId}`);
}