// Supabase의 인증 헬퍼를 사용하여 클라이언트 객체를 생성합니다.
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/libs/stripe";
import { getURL } from "@/libs/helpers";
import { createOrRetrieveCustomer } from "@/libs/supabaseAdmin";

/** POST 메소드로 요청이 들어왔을 때 처리하는 함수 */
export async function POST(request: Request) {
  // 요청에서 가격, 수량 및 메타데이터를 가져옴
  const { price, quantity = 1, metadata = {} } = await request.json();

  try {
    // Supabase 클라이언트를 생성
    const supabase = createRouteHandlerClient({
      cookies,
    });

    // 현재 사용자 정보를 가져옴
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Stripe의 고객 정보를 생성하거나 기존 고객을 가져옴
    const customer = await createOrRetrieveCustomer({
      uuid: user?.id || "",
      email: user?.email || "",
    });

    // Stripe 체크아웃 세션을 생성
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer,
      line_items: [
        {
          price: price.id,
          quantity,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      subscription_data: {
        trial_from_plan: true,
        metadata,
      },
      success_url: `${getURL()}/account`, // 결제 성공 시 이동할 URL
      cancel_url: `${getURL()}/`, // 결제 취소 시 이동할 URL
    });

    // 생성된 세션의 ID를 JSON 형태로 반환
    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    // 에러가 발생한 경우 콘솔에 에러를 출력하고 내부 오류로 응답
    console.log(err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
