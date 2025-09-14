export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*"] // change to your protected routes
};
