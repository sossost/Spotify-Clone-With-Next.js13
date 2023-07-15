import { Subscription, UserDetails } from "@/types";
import { User } from "@supabase/auth-helpers-nextjs";
import {
  useSessionContext,
  useUser as useSupaUser,
} from "@supabase/auth-helpers-react";
import { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
};

// 사용자 컨텍스트를 생성. 초기값은 undefined
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}

// 사용자 컨텍스트 프로바이더 컴포넌트를 생성
export const MyUserContextProvider = (props: Props) => {
  // 세션 컨텍스트와 사용자 정보를 가져옴
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase,
  } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;
  // 사용자 상세 정보와 구독 정보를 관리하는 state를 생성
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // 사용자 상세 정보와 구독 정보를 서버에서 가져오는 함수 정의
  const getUserDetails = () => supabase.from("users").select("*").single();
  const getSubscription = () =>
    supabase
      .from("subscriptions")
      .select("*,prices(*,products(*))")
      .in("status", ["trialing", "active"])
      .single();

  // 사용자 정보가 변경되거나 로딩 상태가 변경될 때마다 실행되는 useEffect
  useEffect(() => {
    // 사용자 정보가 있고, 데이터가 로딩 중이 아니며, 상세 정보와 구독 정보가 없을 때
    if (user && !isLoadingData && !userDetails && !subscription) {
      setIsLoadingData(true);

      // 상세 정보와 구독 정보를 가져옴 allSettled로 처리
      Promise.allSettled([getUserDetails(), getSubscription()]).then(
        (results) => {
          const userDetailsPromise = results[0];
          const subscriptionPromise = results[1];

          if (userDetailsPromise.status === "fulfilled") {
            setUserDetails(userDetailsPromise.value.data as UserDetails);
          }

          if (subscriptionPromise.status === "fulfilled") {
            setSubscription(subscriptionPromise.value.data as Subscription);
          }

          setIsLoadingData(false);
        }
      );
    } else if (!user && !isLoadingUser && !isLoadingData) {
      // 사용자 정보가 없고, 로딩 중이 아니면 상세 정보와 구독 정보를 초기화
      setUserDetails(null);
      setSubscription(null);
    }
  }, [user, isLoadingUser]);

  // 컨텍스트에 제공될 값을 정의
  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription,
  };

  // 컨텍스트 프로바이더 컴포넌트를 반환합니다.
  return <UserContext.Provider value={value} {...props} />;
};

// 컨텍스트를 사용하는 훅을 생성합니다.
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a MyUserContextProvider");
  }
  return context;
};
