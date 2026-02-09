import { authApi } from "@/services/authApi";
import { AuthState, LoginResponse } from "@/types/auth.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { tokenCookies } from "@/utils/cookies";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      // Clear cookies instead of localStorage
      tokenCookies.clearTokens();
    },
    setCredentials: (state, action: PayloadAction<LoginResponse>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      // User info can be decoded from token if needed
      state.user = {
        id: "",
        fullName: action.payload.fullName,
        email: "",
        role: "",
      };
    },
  },
  // Listen for the authApi output to automatically update the state.
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        state.isAuthenticated = true;
        state.user = {
          id: "",
          fullName: payload.fullName,
          email: "",
          role: "",
        };
      },
    );
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
