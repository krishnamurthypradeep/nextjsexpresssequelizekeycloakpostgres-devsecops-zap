export { default } from "next-auth/middleware";

export const config = {
  matcher: [ "/home/:path*",
    "/products/:path*",
    "/settings/:path*"],
};
