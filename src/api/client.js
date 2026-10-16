import { requestSend } from "../utility";

export function getClients() {
  return requestSend("/clients");
}