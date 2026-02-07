import { authApi } from "@/services/authApi";
import { Middleware } from "@reduxjs/toolkit";

export const apiMiddlewares: Middleware[] = [authApi.middleware];
