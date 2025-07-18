import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '../hooks/use-toast';
import { EventEmitter } from 'events';

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  markRead: (id: string) => void;
  events: EventEmitter; // for local listeners
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  const events = new EventEmitter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Use environment variable for socket URL
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const socket: Socket = io(`${socketUrl}/notifications`, {
      query: { userId: JSON.parse(atob(token.split('.')[1])).sub },
      transports: ['websocket'],
    });

    socket.on('notification', (notif: Notification) => {
      setNotifications(prev => [notif, ...prev]);
      toast({
        title: notif.title,
        description: notif.message,
        variant: notif.priority === 'HIGH' ? 'destructive' : undefined,
      });
      events.emit('new', notif);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const markRead = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, markRead, events }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('NotificationContext missing');
  return ctx;
}; 