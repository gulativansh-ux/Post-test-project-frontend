
import { requestSend } from "../utility/index";
import { closeNotificationSocket } from "../utility/socket";

export function logout() {
  closeNotificationSocket();
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function login(email, password) {
  return requestSend("/auth", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
