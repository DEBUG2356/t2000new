import { NextResponse, type NextRequest } from "next/server";

// English lives at the root (/paris/...), other languages under /fr, /es, /de, /sk, /it —
// exactly like the original tickets2000.com. Internally every page sits under app/[lang].
const PREFIXED = /^\/(fr|es|de|sk|it)(\/|$)/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /en/... is not a public URL: send it to the unprefixed English address
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  // trailing slashes -> canonical form
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, "");
    return NextResponse.redirect(url, 308);
  }
  if (PREFIXED.test(pathname)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|admin|_next|storage|media|brand|images|assets|favicon.ico|robots.txt|sitemap.xml|icon|apple-icon|.*\\.[a-z0-9]+$).*)"],
};
