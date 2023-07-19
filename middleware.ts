import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({
    req,
    res,
  });

  // Supabase 클라이언트를 이용해 현재 세션을 가져옴
  // 이는 사용자가 로그인했는지 확인하는데 사용
  await supabase.auth.getSession();
  return res;
}
