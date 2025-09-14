import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      twitterId?: string;
      username?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    twitterId?: string;
    userId?: string;
    username?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
  }
}
