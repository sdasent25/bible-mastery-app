import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  // intercept any attempt to go to Stripe checkout
  if (url.href.includes("checkout.stripe.com")) {
    url.pathname = "/upgrade"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/:path*"],
}
