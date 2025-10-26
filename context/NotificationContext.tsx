import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { EventSubscription } from "expo-modules-core";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotificationData {
  id: string;
  title: string;
  body: string;
  date: Date;
  data?: any;
  isUrgent?: boolean;
  read: boolean;
}

interface NotificationContextType {
  expoPushToken: string | null;
  notifications: NotificationData[];
  error: Error | null;
  markAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<EventSubscription>();
  const responseListener = useRef<EventSubscription>();

  // Load stored notifications on mount
  useEffect(() => {
    loadStoredNotifications();
  }, []);

  const loadStoredNotifications = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem('@notifications');
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        // Convert date strings back to Date objects
        const notificationsWithDates = parsedNotifications.map((n: any) => ({
          ...n,
          date: new Date(n.date)
        }));
        setNotifications(notificationsWithDates);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const saveNotifications = async (newNotifications: NotificationData[]) => {
    try {
      await AsyncStorage.setItem('@notifications', JSON.stringify(newNotifications));
    } catch (error) {
      console.error("Error saving notifications:", error);
    }
  };

  // Use useCallback to ensure addNotification has access to latest state
  const addNotification = useCallback(async (notification: Notifications.Notification) => {
    // Create a truly unique ID using timestamp and random string
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newNotification: NotificationData = {
      id: notification.request.identifier || uniqueId,
      title: notification.request.content.title || "New Notification",
      body: notification.request.content.body || "",
      date: new Date(),
      data: notification.request.content.data,
      isUrgent: notification.request.content.data?.urgent || false,
      read: false
    };
    
    // Use functional update to get the latest state
    setNotifications(prevNotifications => {
      // Check for duplicates using the latest state
      const isDuplicate = prevNotifications.some(n => n.id === newNotification.id);
      if (isDuplicate) {
        return prevNotifications;
      }
      
      const updatedNotifications = [newNotification, ...prevNotifications];
      // Save to storage
      saveNotifications(updatedNotifications);
      return updatedNotifications;
    });
  }, []);

  const markAsRead = async (id: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    await AsyncStorage.removeItem('@notifications');
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => setExpoPushToken(token),
      (error) => setError(error)
    );
  }, []);

  useEffect(() => {
    // Configure how notifications are handled when app is in foreground/background/quit
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      }),
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification Received: ", notification);
        addNotification(notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "Notification Response: ",
          JSON.stringify(response, null, 2),
          JSON.stringify(response.notification.request.content.data, null, 2)
        );
        const url = response.notification.request.content.data?.url;
        if (url) {
          // Navigate to the provided URL
          router.push(url);
        }
      });

    // Handle notifications that were received when the app was in background
    Notifications.getPresentedNotificationsAsync().then((presentedNotifications) => {
      if (presentedNotifications && presentedNotifications.length > 0) {
        presentedNotifications.forEach(notification => {
          addNotification(notification);
        });
      }
    });

    // Handle notifications that were used to open the app
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response && response.notification) {
        addNotification(response.notification);
        const url = response.notification.request.content.data?.url;
        if (url) {
          router.push(url);
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [addNotification]); // Add addNotification to dependency array

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notifications, error, markAsRead, clearAllNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};