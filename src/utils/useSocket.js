import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

export default function useSocket(userId, onNotification) {
  useEffect(() => {
    if (!userId) return;
    const socket = io(SOCKET_URL, {
      query: { userId },
      transports: ['websocket'],
    });
    socket.on('connect', () => {
      socket.emit('join', userId);
    });
    socket.on('notification', (data) => {
      if (onNotification) onNotification(data);
    });
    return () => {
      socket.disconnect();
    };
  }, [userId, onNotification]);
}
