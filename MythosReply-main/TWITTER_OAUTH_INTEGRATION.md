# Modular Twitter OAuth Integration for Next.js App Router

This guide provides a complete, drop-in Twitter OAuth solution for Next.js App Router projects.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install next-auth
```

### 2. Environment Variables
Add to your `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-character-secret
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
```

### 3. Twitter App Configuration
In your Twitter Developer Portal:
- **App Type**: Web App, Automated App or Bot
- **OAuth 2.0 Settings**:
  - Callback URL: `http://localhost:3000/api/auth/callback/twitter`
  - Scopes: `tweet.read`, `users.read`, `tweet.write`, `offline.access`

## 📁 File Structure

Copy these files to your project:

```
src/
├── lib/
│   └── auth.ts                    # NextAuth configuration
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts       # NextAuth API route
│   ├── auth/
│   │   └── signin/
│   │       └── page.tsx           # Sign-in page
│   ├── providers.tsx              # Session provider
│   └── layout.tsx                 # Updated with providers
├── components/
│   └── TwitterConnectButton.tsx   # Reusable connect button
├── types/
│   └── next-auth.d.ts            # TypeScript declarations
└── middleware.ts                  # Route protection
```

## 🔧 Core Components

### Authentication Configuration (`src/lib/auth.ts`)
```typescript
import type { NextAuthOptions, Account } from "next-auth";
import type { JWT } from "next-auth/jwt";
import TwitterProvider from "next-auth/providers/twitter";

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
    async jwt({ token, account }) {
      if (account?.provider === "twitter") token.twitterId = account.providerAccountId;
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
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpiresAt?: number;
      };
    },
    async session({ session, token }) {
      const t = token as JWT & { twitterId?: string; userId?: string };
      if (session.user) {
        session.user.twitterId = typeof t.twitterId === "string" ? t.twitterId : undefined;
        session.user.id = typeof t.userId === "string" ? t.userId : (typeof token.sub === "string" ? token.sub : undefined);
      }
      return session;
    },
  },
};
```

### Reusable Connect Button (`src/components/TwitterConnectButton.tsx`)
```typescript
"use client";
import { signIn, signOut, useSession } from "next-auth/react";

interface TwitterConnectButtonProps {
  callbackUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function TwitterConnectButton({ 
  callbackUrl = "/app", 
  className = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200",
  children 
}: TwitterConnectButtonProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <button disabled className={`${className} opacity-50 cursor-not-allowed`}>Loading...</button>;
  }

  if (session?.user?.twitterId) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Connected as @{session.user.twitterId}</span>
        <button onClick={() => signOut()} className="text-red-600 hover:text-red-700 text-sm underline">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => signIn("twitter", { callbackUrl })} className={className}>
      {children || "Connect X"}
    </button>
  );
}
```

## 🔒 Protected Routes

The middleware automatically protects routes matching the patterns in `middleware.ts`:

```typescript
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*"] // Change to your protected routes
};
```

## 🎯 Usage Examples

### In Your Landing Page
```typescript
import TwitterConnectButton from "@/components/TwitterConnectButton";

export default function HomePage() {
  return (
    <div>
      <h1>My App</h1>
      <TwitterConnectButton callbackUrl="/dashboard">
        Get Started with X
      </TwitterConnectButton>
    </div>
  );
}
```

### In Protected Pages
```typescript
"use client";
import { useSession } from "next-auth/react";
import TwitterConnectButton from "@/components/TwitterConnectButton";

export default function DashboardPage() {
  const { data: session } = useSession();
  
  if (!session) {
    return <TwitterConnectButton />;
  }
  
  return (
    <div>
      <h1>Welcome, @{session.user.twitterId}</h1>
      {/* Your protected content */}
    </div>
  );
}
```

### Manual Sign-in Trigger
```typescript
import { signIn } from "next-auth/react";

// Trigger anywhere in your app
<button onClick={() => signIn("twitter", { callbackUrl: "/app" })}>
  Connect X Account
</button>
```

## 🔧 Customization

### Custom Sign-in Page
Modify `src/app/auth/signin/page.tsx` to match your design:

```typescript
"use client";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <button onClick={() => signIn("twitter", { callbackUrl: "/app" })}>
        Connect X
      </button>
    </div>
  );
}
```

### Route Protection
Update `middleware.ts` to protect your specific routes:

```typescript
export const config = {
  matcher: [
    "/dashboard/:path*",  // Protect all dashboard routes
    "/app/:path*",       // Protect all app routes
    "/admin/:path*"      // Protect admin routes
  ]
};
```

## 🧪 Testing

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Connect X" - should redirect to Twitter OAuth
4. After authorization, you'll be redirected back with session data
5. Visit protected routes to test middleware protection

## 🚨 Security Notes

- Always use HTTPS in production
- Keep your `NEXTAUTH_SECRET` secure and random (32+ characters)
- Store Twitter credentials securely
- Review and limit OAuth scopes as needed

## 🔄 Token Management

Access tokens are automatically stored in the JWT. To use them for API calls:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Access token is available in the JWT callback
  // You'll need to extend the session callback to include it
  const accessToken = session?.accessToken;
  
  // Use accessToken for Twitter API calls
}
```

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Twitter API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
