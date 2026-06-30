import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice.js';
import accountReducer from './slices/accountSlice.js';
import notificationReducer from './slices/notificationSlice.js';

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  account: accountReducer,
  notification: notificationReducer,
});

// Configure persistence (only persist auth slice)
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'], // do not persist accounts or notifications to prevent stale financial data
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
