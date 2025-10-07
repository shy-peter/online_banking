import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { Query, ID } from 'appwrite';
import { useAuth } from './AuthContext';
import type { Notification, NotificationContextType } from '../types/appwrite';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => n.isRead !== 'true').length;

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const fetchNotifications = async (): Promise<void> => {
    if (!user) return;

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        [
          Query.equal('userId', user.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(50)
        ]
      );
      setNotifications(response.documents as Notification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const addNotification = async (notificationData: Omit<Notification, '$id' | '$createdAt' | '$updatedAt'>): Promise<void> => {
    if (!user) return;

    try {
      const notification = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        ID.unique(),
        {
          ...notificationData,
          userId: user.$id,
          isRead: 'false',
          createdAt: new Date().toISOString()
        },
        [
          `read("user:${user.$id}")`,
          `update("user:${user.$id}")`,
          `delete("user:${user.$id}")`
        ]
      );

      setNotifications(prev => [notification as Notification, ...prev]);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        notificationId,
        {
          isRead: 'true',
          updatedAt: new Date().toISOString()
        }
      );

      setNotifications(prev =>
        prev.map(notification =>
          notification.$id === notificationId
            ? { ...notification, isRead: 'true' }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    if (!user) return;

    try {
      const unreadNotifications = notifications.filter(n => n.isRead !== 'true');
      
      // Update all unread notifications in parallel
      await Promise.all(
        unreadNotifications.map(notification =>
          databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            notification.$id,
            {
              isRead: 'true',
              updatedAt: new Date().toISOString()
            }
          )
        )
      );

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: 'true' }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearNotification = async (notificationId: string): Promise<void> => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        notificationId
      );

      setNotifications(prev =>
        prev.filter(notification => notification.$id !== notificationId)
      );
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };

  const clearAllNotifications = async (): Promise<void> => {
    if (!user) return;

    try {
      // Delete all notifications for the user
      await Promise.all(
        notifications.map(notification =>
          databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            notification.$id
          )
        )
      );

      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
