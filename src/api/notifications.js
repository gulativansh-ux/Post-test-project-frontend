
import { requestSend } from "../utility";

export function getNotifications() {
  return requestSend("/notifications");
}

export function markNotificationRead(notificationId) {
  return requestSend(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}
