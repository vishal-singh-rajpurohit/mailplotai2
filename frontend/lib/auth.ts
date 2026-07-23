import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import MicrosoftEntraIDProvider from "next-auth/providers/microsoft-entra-id";
import CredentialsProvider from "next-auth/providers/credentials";

const authProviders = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "google-dummy-id",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-dummy-secret",
    authorization: {
      url: "https://accounts.google.com/o/oauth2/v2/auth",
      params: {
        access_type: "offline",
        prompt: "consent",
        scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
      },
    },
    token: "https://oauth2.googleapis.com/token",
    userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
  }),
  MicrosoftEntraIDProvider({
    clientId: process.env.MICROSOFT_CLIENT_ID || "microsoft-dummy-id",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "microsoft-dummy-secret",
    // tenantId: process.env.MICROSOFT_TENANT_ID || "common",
    authorization: {
      url: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || "common"}/oauth2/v2.0/authorize`,
      params: {
        scope: "openid email profile offline_access https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send",
      },
    },
    token: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || "common"}/oauth2/v2.0/token`,
    userinfo: "https://graph.microsoft.com/oidc/userinfo",
  }),
  CredentialsProvider({
    id: "credentials",
    name: "Demo Account",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "demo_user@inboxpilot.ai" },
      name: { label: "Name", type: "text", placeholder: "Demo User" },
    },
    async authorize(credentials) {
      if (!credentials) return null;

      const email = (credentials.email as string) || "demo_user@inboxpilot.ai";
      const name = (credentials.name as string) || "Demo User";

      try {
        const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        // Replaced axios with Edge-compatible native fetch
        const res = await fetch(`${backendUrl}/api/v1/auth/oauth-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            name: name,
            image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
            provider: "demo",
            provider_account_id: `demo-${uuid_hash(email)}`,
            access_token: "demo_access_token",
            refresh_token: "demo_refresh_token",
            token_expires_at: new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
          }),
        });

        if (!res.ok) {
          console.error("Backend auth failed status:", res.status);
          return null;
        }

        const data = await res.json();

        if (data && data.access_token) {
          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            image: data.user.image,
            backendToken: data.access_token,
            preferredLanguage: data.user.preferred_language,
            provider: "demo"
          };
        }
        return null;
      } catch (e) {
        console.error("Credentials authorize failed:", e);
        return null;
      }
    }
  })
];

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: authProviders,
  ...({
    httpOptions: {
      timeout: 30000,
    },
  } as any),
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign-in execution
      if (account && user) {
        token.provider = account.provider === "credentials" ? (user as any).provider || "demo" : account.provider;

        token.providerAccountId = account.providerAccountId;

        if (account.provider === "credentials") {
          const credUser = user as any;
          token.backendToken = credUser.backendToken;
          token.userId = credUser.id;
          token.preferredLanguage = credUser.preferredLanguage;
        } else {
          // OAuth Provider Flow
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expiresAt = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000;

          try {
            const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            // Replaced axios with Edge-compatible native fetch
            const res = await fetch(`${backendUrl}/api/v1/auth/oauth-login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                image: user.image,
                provider: account.provider,
                provider_account_id: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                token_expires_at: account.expires_at ? new Date(account.expires_at * 1000).toISOString() : null,
              }),
            });

            if (!res.ok) {
              throw new Error(`Backend sync HTTP error: ${res.status}`);
            }

            const data = await res.json();
            token.backendToken = data.access_token;
            token.userId = data.user.id;
            token.preferredLanguage = data.user.preferred_language;
          } catch (e) {
            console.error("Syncing OAuth user with backend failed:", e);
            // Flag the token error so your application UI/middleware knows the sync failed
            token.error = "BackendSyncError";
          }
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.accessToken = token.backendToken;
        session.userId = token.userId;
        session.provider = token.provider;
        session.preferredLanguage = token.preferredLanguage;
        session.error = token.error; // Expose error to client-side or middleware
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-nextauth-secret-key-123456",
});

// Helper for generating deterministic string-based ids
function uuid_hash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash).toString(16);
}