import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getSongsByUserId = async (): Promise<Song[]> => {
  // createServerComponentClient 함수를 사용하여 Supabase 클라이언트를 생성합니다.
  // 이 함수에는 쿠키를 인자로 제공합니다.
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  // 생성된 Supabase 클라이언트를 이용하여 현재 인증 세션을 가져옴
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  // 세션 에러 핸들링
  if (sessionError) {
    console.log(sessionError.message);
    return [];
  }

  // "songs" 테이블에서 사용자 ID가 일치하는 모든 노래 정보를 생성일자 내림차순으로 가져옴
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", sessionData?.session?.user.id)
    .order("created_at", { ascending: false });

  // 노래 데이터 에러 핸들링
  if (error) {
    console.log(error.message);
  }

  // 노래 데이터 만약 노래 정보를 없으면 빈 배열을 반환
  return (data as any) || [];
};

export default getSongsByUserId;
