import { authApi } from "@/services/authApi";
import { productApi } from "@/services/productApi";
import { userApi } from "@/services/userApi";
import { Middleware } from "@reduxjs/toolkit";

export const apiMiddlewares: Middleware[] = [
  authApi.middleware,
  productApi.middleware,
  userApi.middleware,
];
