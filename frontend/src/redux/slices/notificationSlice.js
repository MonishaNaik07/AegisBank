import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    notificationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    notificationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchNotificationsSuccess: (state, action) => {
      state.loading = false;
      state.notifications = action.payload;
    },
    markNotificationAsReadSuccess: (state, action) => {
      state.loading = false;
      const index = state.notifications.findIndex(n => n._id === action.payload._id);
      if (index !== -1) {
        state.notifications[index].isRead = true;
      }
    },
    markAllNotificationsAsReadSuccess: (state) => {
      state.loading = false;
      state.notifications.forEach(n => {
        n.isRead = true;
      });
    },
    clearNotificationState: (state) => {
      state.notifications = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  notificationStart,
  notificationFailure,
  fetchNotificationsSuccess,
  markNotificationAsReadSuccess,
  markAllNotificationsAsReadSuccess,
  clearNotificationState,
} = notificationSlice.actions;

export default notificationSlice.reducer;
