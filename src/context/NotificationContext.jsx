
import { createContext, useContext, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [jobRefreshVersion, setJobRefreshVersion] = useState(0);

  function notifyJobUpdated(notification) {
    if (notification.job_id != null) {
      setJobRefreshVersion((version) => version + 1);
    }
  }

  return (
    <NotificationContext.Provider
      value={{ jobRefreshVersion, notifyJobUpdated }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
