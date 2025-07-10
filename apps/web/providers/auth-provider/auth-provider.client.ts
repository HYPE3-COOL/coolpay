"use client";

import type { AuthProvider } from "@refinedev/core";
import Cookies from "js-cookie";

// Hardcoded credentials (replace with your own or connect to backend)
const HARDCODED_USER = {
  name: "Admin User",
  email: "admin@hype3.cool",
  username: "admin",
  password: "pictta",
  roles: ["admin"],
  avatar: "https://i.pravatar.cc/150?img=1",
};

export const authProviderClient: AuthProvider = {
  login: async ({ email, password, remember }) => {
    
    // Accept login if username/email and password match the hardcoded user
    const isValid =
      (email && email === HARDCODED_USER.email) &&
      password === HARDCODED_USER.password;

    if (isValid) {
      // Don't store password in cookie
      const { password, ...userWithoutPassword } = HARDCODED_USER;
      Cookies.set("auth", JSON.stringify(userWithoutPassword), {
        expires: 30, // 30 days
        path: "/",
      });
      return {
        success: true,
        redirectTo: "/dashboard",
      };
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username/email or password",
      },
    };
  },
  logout: async () => {
    Cookies.remove("auth", { path: "/" });
    return {
      success: true,
      redirectTo: "/dashboard/login",
    };
  },
  check: async () => {
    const auth = Cookies.get("auth");
    if (auth) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      logout: true,
      redirectTo: "/dashboard/login",
    };
  },
  getPermissions: async () => {
    const auth = Cookies.get("auth");
    if (auth) {
      const parsedUser = JSON.parse(auth);
      return parsedUser.roles;
    }
    return null;
  },
  getIdentity: async () => {
    const auth = Cookies.get("auth");
    if (auth) {
      const parsedUser = JSON.parse(auth);
      return parsedUser;
    }
    return null;
  },
  onError: async (error) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
};
