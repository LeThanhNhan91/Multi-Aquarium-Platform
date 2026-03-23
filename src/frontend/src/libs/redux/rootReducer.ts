import { authApi } from "@/services/authApi";
import { combineReducers, Action } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import cartReducer from "./features/cartSlice";
import { logout } from "./features/authSlice";
import { productApi } from "@/services/productApi";
import { userApi } from "@/services/userApi";
import { categoryApi } from "@/services/categoryApi";
import { orderApi } from "@/services/orderApi";
import { storeApi } from "@/services/storeApi";
import { fishInstanceApi } from "@/services/fishInstanceApi";
import { chatApi } from "@/services/chatApi";
import { reviewApi } from "@/services/reviewApi";
import { postApi } from "@/services/postApi";
import { cartApi } from "@/services/cartApi";

const appReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,

  [authApi.reducerPath]: authApi.reducer,
  [productApi.reducerPath]: productApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [categoryApi.reducerPath]: categoryApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer,
  [storeApi.reducerPath]: storeApi.reducer,
  [fishInstanceApi.reducerPath]: fishInstanceApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [reviewApi.reducerPath]: reviewApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
});

export const rootReducer = (state: any, action: any) => {
  if (action.type === logout.type) {
    state = undefined;
  }

  return appReducer(state, action);
};
