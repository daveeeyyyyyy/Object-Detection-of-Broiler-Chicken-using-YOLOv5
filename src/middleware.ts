import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  const isLoggedIn = req.cookies.get("isLoggedIn");
  const lastPin = req.cookies.get("lastPin");

  if (isLoggedIn?.value == "true" && lastPin) {
    url.pathname = "/";
    return NextResponse.rewrite(url);
  } else {
    url.pathname = "/pin";
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: ["/", "/pin"],
};
