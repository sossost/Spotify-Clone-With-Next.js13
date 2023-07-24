import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/libs/stripe";
import { getURL } from "@/libs/helpers";
import { createOrRetrieveCustomer } from "@/libs/supabaseAdmin";

/** POST 메소드로 요청이 들어왔을 때 처리하는 함수 */
export async function POST() {
  try {
    const supabase = createRouteHandlerClient({
      cookies,
    });

    // 현재 사용자 정보를 가져옴
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 사용자 정보가 없는 경우 에러를 던짐
    if (!user) throw Error("Could not get user");

    // Stripe의 고객 정보를 생성하거나 기존 고객을 가져옴
    const customer = await createOrRetrieveCustomer({
      uuid: user.id || "",
      email: user.email || "",
    });

    // 고객 정보가 없는 경우 에러를 던짐
    if (!customer) throw Error("Could not get customer");

    // Stripe의 빌링 포털 세션을 생성
    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${getURL()}/account`, // 빌링 포털에서 세션이 끝난 후 이동할 URL
    });

    // 생성된 빌링 포털 세션의 URL을 JSON 형태로 반환
    return NextResponse.json({ url });
  } catch (err: any) {
    // 에러가 발생한 경우 콘솔에 에러를 출력하고 내부 오류로 응답
    console.log(err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
