import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import notificationReducer from "./notifications/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
