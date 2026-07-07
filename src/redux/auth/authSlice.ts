import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../lib/api";
import type { ApiResponse, User } from "../../types";

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
};

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: User;
};

const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem("user");

    return storedUser ? (JSON.parse(storedUser) as User) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const storedToken = localStorage.getItem("token");

const initialState: AuthState = {
  user: getStoredUser(),
  token: storedToken,
  loading: Boolean(storedToken),
  initialized: !storedToken,
  error: null,
};

const getErrorMessage = (error: unknown): string => {
  const apiError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  return (
    apiError.response?.data?.message ||
    apiError.message ||
    "Something went wrong"
  );
};

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", {
      email,
      password,
    });

    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const loadMe = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/loadMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<User>>("/auth/me");

      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.initialized = true;
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.initialized = true;
        state.error = null;

        localStorage.setItem("token", action.payload.token);

        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.initialized = true;
        state.error = action.payload || "Login failed";

        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })

      .addCase(loadMe.pending, (state) => {
        state.loading = true;
      })

      .addCase(loadMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.initialized = true;
        state.error = null;

        localStorage.setItem("user", JSON.stringify(action.payload));
      })

      .addCase(loadMe.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.initialized = true;
        state.error = action.payload || "Authentication failed";

        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
  },
});

export const { logoutUser, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
