// 필요한 모듈과 타입을 가져옵니다.
import { Song } from "@/types";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const useGetSongById = (id?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [song, setSong] = useState<Song | undefined>(undefined);

  const { supabaseClient } = useSessionContext();

  // useEffect를 이용해 컴포넌트가 렌더링될 때와 id가 변경될 때마다 실행되는 부수효과를 정의합니다.
  useEffect(() => {
    if (!id) return;

    setIsLoading(true);

    const fetchSong = async () => {
      const { data, error } = await supabaseClient
        .from("songs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setIsLoading(false);
        toast.error(error.message);
      }

      setSong(data as Song);
      setIsLoading(false);
    };

    fetchSong();
  }, [id, supabaseClient]);

  /* useMemo를 이용하여 isLoading과 song을 메모이제이션 하여
    컴포넌트가 리렌더링될 때마다 불필요한 연산을 줄임 */
  return useMemo(() => ({ isLoading, song }), [isLoading, song]);
};

export default useGetSongById;
