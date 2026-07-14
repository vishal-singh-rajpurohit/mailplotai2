import axios from "axios";
import { getSession } from "next-auth/react";

const isServer = typeof window === "undefined";
const baseURL = isServer
  ? process.env.BACKEND_API_URL || "http://backend:8000"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  let token: string | undefined;

  if (isServer) {
    // On the server, we import 'auth' from our auth config
    try {
      const { auth } = await import("@/lib/auth");
      const session = await auth();
      token = (session as any)?.accessToken;
    } catch (e) {
      console.error("Failed to load server auth session in api client", e);
    }
  } else {
    // In the browser, we use getSession from next-auth/react
    const session = await getSession();
    token = (session as any)?.accessToken;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
