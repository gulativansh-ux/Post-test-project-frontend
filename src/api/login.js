import { requestSend } from "../utility/index";

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function login(email, password) {
  return requestSend("/auth", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
