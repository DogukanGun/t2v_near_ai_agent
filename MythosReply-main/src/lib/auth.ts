import type { NextAuthOptions, Account } from "next-auth";
import type { JWT } from "next-auth/jwt";
import TwitterProvider from "next-auth/providers/twitter";

// Debug environment variables
console.log('🔍 Environment variables check:');
console.log('📍 TWITTER_CLIENT_ID:', process.env.TWITTER_CLIENT_ID ? 'SET' : 'MISSING');
console.log('📍 TWITTER_CLIENT_SECRET:', process.env.TWITTER_CLIENT_SECRET ? 'SET' : 'MISSING');
console.log('📍 NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING');
console.log('📍 NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? 'SET' : 'MISSING');

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      version: "2.0",
      authorization: { params: { scope: "tweet.read users.read tweet.write offline.access" } },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log('🔍 JWT Callback - Account:', account);
      console.log('🔍 JWT Callback - Profile:', profile);
      
      if (account?.provider === "twitter") {
        token.twitterId = account.providerAccountId;
        // Try to get username from profile data
        if (profile) {
          token.username = (profile as any).data?.username || (profile as any).username;
          console.log('📍 JWT Callback - Username from profile:', token.username);
        }
      }
      if (typeof token.sub === "string") token.userId = token.sub;

      if (account) {
        const a = account as Account & { access_token?: string; refresh_token?: string; expires_at?: number };
        if (a.access_token) token.accessToken = a.access_token;
        if (a.refresh_token) token.refreshToken = a.refresh_token;
        if (typeof a.expires_at === "number") token.accessTokenExpiresAt = a.expires_at * 1000;
      }

      return token as JWT & {
        twitterId?: string;
        userId?: string;
        username?: string;
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpiresAt?: number;
      };
    },
    async session({ session, token }) {
      const t = token as JWT & { twitterId?: string; userId?: string; username?: string; accessToken?: string };
      if (session.user) {
        session.user.twitterId = typeof t.twitterId === "string" ? t.twitterId : undefined;
        session.user.username = typeof t.username === "string" ? t.username : undefined;
        session.user.id = typeof t.userId === "string" ? t.userId : (typeof token.sub === "string" ? token.sub : undefined);
      }
      // Include access token in session for API calls
      (session as any).accessToken = t.accessToken;
      console.log('📍 Session Callback - Final session user:', session.user);
      console.log('🔑 Session Callback - Access token present:', !!t.accessToken);
      return session;
    },
  },
};
