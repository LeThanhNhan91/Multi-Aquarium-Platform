import { authApi } from "@/services/authApi";
import { categoryApi } from "@/services/categoryApi";
import { productApi } from "@/services/productApi";
import { userApi } from "@/services/userApi";
import { orderApi } from "@/services/orderApi";
import { storeApi } from "@/services/storeApi";
import { Middleware } from "@reduxjs/toolkit";

export const apiMiddlewares: Middleware[] = [
  authApi.middleware,
  productApi.middleware,
  userApi.middleware,
  categoryApi.middleware,
  orderApi.middleware,
  storeApi.middleware,
];
