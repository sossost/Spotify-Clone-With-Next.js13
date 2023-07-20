import { useEffect, useState } from "react";

/** 실시간 서치 디바운스 처리해주는 커스텀 훅  입력값 타입 제네릭으로 받음 */
function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 입력된 value를 지정된 delay 이후에 debouncedValue에 업데이트
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay || 500); // delay 값 없으면 0.5초로 설정

    // cleanup 함수로 setTimeout을 해제합니다.
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
