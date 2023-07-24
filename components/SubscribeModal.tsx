"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";

import useSubscribeModal from "@/hooks/useSubscribeModal";
import { useUser } from "@/hooks/useUser";
import { postData } from "@/libs/helpers";
import { getStripe } from "@/libs/stripeClient";
import { Price, ProductWithPrice } from "@/types";

import Modal from "./Modal";
import Button from "./Button";

interface SubscribeModalProps {
  products: ProductWithPrice[];
}

/** Price 객체를 통화 형식으로 포맷하는 함수 */
const formatPrice = (price: Price) => {
  const priceString = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: 0,
  }).format((price?.unit_amount || 0) / 100);

  return priceString;
};

// 구독 모달 컴포넌트
const SubscribeModal: React.FC<SubscribeModalProps> = ({ products }) => {
  const subscribeModal = useSubscribeModal();
  const { user, isLoading, subscription } = useUser();

  const [priceIdLoading, setPriceIdLoading] = useState<string | undefined>();

  const onChange = (open: boolean) => {
    if (!open) {
      subscribeModal.onClose();
    }
  };

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    if (!user) {
      setPriceIdLoading(undefined);
      return toast.error("Must be logged in");
    }

    if (subscription) {
      setPriceIdLoading(undefined);
      return toast("Already subscribed");
    }

    try {
      // Stripe의 checkout 세션을 생성하는 API를 호출
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price },
      });

      // Stripe 설정을 가져와서 checkout 페이지로 이동
      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      return toast.error((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  let content = <div className="text-center">No products available.</div>;

  if (products.length) {
    content = (
      <div>
        {products.map((product) => {
          if (!product.prices?.length) {
            return <div key={product.id}>No prices available</div>;
          }

          return product.prices.map((price) => (
            <Button
              key={price.id}
              onClick={() => handleCheckout(price)}
              disabled={isLoading || price.id === priceIdLoading}
              className="mb-4"
            >
              {`Subscribe for ${formatPrice(price)} a ${price.interval}`}
            </Button>
          ));
        })}
      </div>
    );
  }

  if (subscription) {
    content = <div className="text-center">Already subscribed.</div>;
  }

  return (
    <Modal
      title="Only for premium users"
      description="Listen to music with Spotify Premium"
      isOpen={subscribeModal.isOpen}
      onChange={onChange}
    >
      {content}
    </Modal>
  );
};

export default SubscribeModal;
