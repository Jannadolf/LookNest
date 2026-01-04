import WebSocketClient from './WebSocketClient';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = new WebSocketClient('ws://localhost:5000'); // Correct backend port
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};