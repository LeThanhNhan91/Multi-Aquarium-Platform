import { authApi } from "@/services/authApi";
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import { logout } from "./features/authSlice";
import { productApi } from "@/services/productApi";
import { userApi } from "@/services/userApi";
import { categoryApi } from "@/services/categoryApi";
import { orderApi } from "@/services/orderApi";

const appReducer = combineReducers({
  auth: authReducer,

  [authApi.reducerPath]: authApi.reducer,
  [productApi.reducerPath]: productApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [categoryApi.reducerPath]: categoryApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer,
});

export const rootReducer = (state: any, action: any) => {
  if (action.type === logout.type) {
    state = undefined;
  }

  return appReducer(state, action);
};
