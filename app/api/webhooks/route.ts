import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { stripe } from "@/libs/stripe";
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
} from "@/libs/supabaseAdmin";

// 처리할 Stripe 이벤트의 타입을 지정
const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "price.created",
  "price.updated",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

/** 웹훅 요청을 처리하는 함수 */
export async function POST(request: Request) {
  const body = await request.text(); // 요청 바디(body)를 읽음
  const sig = headers().get("Stripe-Signature"); // Stripe-Signature 헤더 값을 가져옴

  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET; // Stripe 웹훅 시크릿 키를 가져옵니다.
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) return;

    // Stripe 라이브러리를 사용하여 Stripe 이벤트를 생성
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);

    // 에러가 발생한 경우 400 상태 코드와 에러 메시지를 반환
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 처리할 이벤트 타입인지 확인
  if (relevantEvents.has(event.type)) {
    try {
      // 이벤트 타입에 따라 해당 이벤트를 처리하는 로직을 실행
      switch (event.type) {
        case "product.created":
        case "product.updated":
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case "price.created":
        case "price.updated":
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === "customer.subscription.created"
          );
          break;
        case "checkout.session.completed":
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === "subscription") {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
          }
          break;
        default:
          throw new Error("Unhandled relevant event!");
      }
    } catch (error) {
      console.log(error);
      // 처리 중 에러가 발생한 경우 400 상태 코드와 에러 메시지를 반환
      return new NextResponse(
        'Webhook error: "Webhook handler failed. View logs."',
        { status: 400 }
      );
    }
  }

  // 성공적으로 처리된 경우 200 상태 코드와 JSON 응답을 반환
  return NextResponse.json({ received: true }, { status: 200 });
}
