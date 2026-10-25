import { requestSend } from "../utility";


export function getPendingJobRequest() {
  return requestSend("/check-pending-request");
}

export function fullFillJob(id, isAccepted) {
    return requestSend(`/fullfill-request?request_id=${id}&isAccepted=${isAccepted}`, { 
        method: "POST" 
    });
}

export function fetchJobs(){
    return requestSend("/fetch-jobs")
}