export { auth as default } from "./lib/auth";

// ignore these URL patterns for the middleware (non API routes and static files)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
