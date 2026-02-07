import { authApi } from "@/services/authApi";
import { AuthResponse, AuthState } from "@/types/auth.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
  // Listen for the authApi output to automatically update the state.
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.user;
          state.token = payload.token;
          state.isAuthenticated = true;
        },
      )
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.user;
          state.token = payload.token;
          state.isAuthenticated = true;
        },
      );
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
