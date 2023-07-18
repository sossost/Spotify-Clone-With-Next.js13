"use client";

import AuthModal from "@/components/AuthModal";
import UploadModal from "@/components/UploadModal";
import { useEffect, useState } from "react";

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AuthModal />
      <UploadModal />
    </>
  );
};

export default ModalProvider;

/* 서버 사이드 렌더링(SSR) 또는 정적 사이트 생성(SSG)과 같은
서버에서 렌더링하는 상황에서 문제가 발생할 수 있는 상황을 방지.
ex) 클라이언트 측에서만 사용 가능한 window나 document와 같은 객체를 사용하는 경우에 해당
서버에서 렌더링하는 동안 이런 객체들은 존재하지 않으므로, 컴포넌트가 마운트되었는지를 확인하고
클라이언트 측에서만 코드를 실행 */
