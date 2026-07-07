import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type NotificationType = "success" | "warning" | "info" | "error";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type NotificationState = {
  items: AppNotification[];
  socketConnected: boolean;
};

const initialState: NotificationState = {
  items: [],
  socketConnected: false,
};

type AddNotificationPayload = Omit<AppNotification, "id" | "read">;

const createNotificationId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: {
      reducer: (state, action: PayloadAction<AppNotification>) => {
        state.items.unshift(action.payload);

        if (state.items.length > 50) {
          state.items = state.items.slice(0, 50);
        }
      },

      prepare: (payload: AddNotificationPayload) => ({
        payload: {
          ...payload,
          id: createNotificationId(),
          read: false,
        },
      }),
    },

    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(
        (item) => item.id === action.payload,
      );

      if (notification) {
        notification.read = true;
      }
    },

    markAllNotificationsAsRead: (state) => {
      state.items.forEach((notification) => {
        notification.read = true;
      });
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.items = [];
    },

    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
  },
});

export const {
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  setSocketConnected,
} = notificationSlice.actions;

export default notificationSlice.reducer;
