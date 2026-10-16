
import { requestSend } from "../utility";

export function createJobRequest(body) {
  return requestSend("/job-requests", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
