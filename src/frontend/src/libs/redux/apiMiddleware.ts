import { authApi } from "@/services/authApi";
import { categoryApi } from "@/services/categoryApi";
import { productApi } from "@/services/productApi";
import { userApi } from "@/services/userApi";
import { orderApi } from "@/services/orderApi";
import { storeApi } from "@/services/storeApi";
import { fishInstanceApi } from "@/services/fishInstanceApi";
import { chatApi } from "@/services/chatApi";
import { reviewApi } from "@/services/reviewApi";
import { postApi } from "@/services/postApi";
import { Middleware } from "@reduxjs/toolkit";

export const apiMiddlewares: Middleware[] = [
  authApi.middleware,
  productApi.middleware,
  userApi.middleware,
  categoryApi.middleware,
  orderApi.middleware,
  storeApi.middleware,
  fishInstanceApi.middleware,
  chatApi.middleware,
  reviewApi.middleware,
  postApi.middleware,
];
