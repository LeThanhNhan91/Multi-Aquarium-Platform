import { authApi } from "@/services/authApi";
import { productApi } from "@/services/productApi";
import { Middleware } from "@reduxjs/toolkit";

export const apiMiddlewares: Middleware[] = [
  authApi.middleware,
  productApi.middleware,
];
