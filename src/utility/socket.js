
import { API } from "./consts";
import { getToken } from "./index";

let activeCloseSocket = null;

export function connectNotificationSocket(onMessage) {
  let socket = null;
  let reconnectTimer = null;
  let closed = false;

  function connect() {
    const token = getToken();

    if (closed || !token) return;

    const wsURL = API.replace(/^http/, "ws").replace(/\/+$/, "");
    const currentSocket = new WebSocket(
      `${wsURL}/notifications/ws?token=${encodeURIComponent(token)}`,
    );

    socket = currentSocket;

    currentSocket.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch (error) {
        console.error("Invalid notification message:", error);
      }
    };

    currentSocket.onclose = (event) => {
      if (socket === currentSocket) {
        socket = null;
      }

      if (closed || event.code === 1008) return;

      reconnectTimer = setTimeout(connect, 3000);
    };

    currentSocket.onerror = () => {
      currentSocket.close();
    };
  }

  connect();

  const closeSocket = () => {
    closed = true;
    clearTimeout(reconnectTimer);
    reconnectTimer = null;

    if (socket) {
      const currentSocket = socket;
      socket = null;
      currentSocket.close(1000, "Connection closed");
    }

    if (activeCloseSocket === closeSocket) {
      activeCloseSocket = null;
    }
  };

  activeCloseSocket = closeSocket;

  return closeSocket;
}

export function closeNotificationSocket() {
  if (activeCloseSocket) {
    activeCloseSocket();
  }
}
