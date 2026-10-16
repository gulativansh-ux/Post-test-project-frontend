import { requestSend } from "../utility";

export function getRecruiters() {
  return requestSend("/recruiters");
}