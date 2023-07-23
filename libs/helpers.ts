import { Price } from "@/types";

/** 사이트 URL을 가져오는 함수 */
export const getURL = () => {
  // 운영 환경(production environment)에서 사이트 URL을 가져오기 위해 process.env.NEXT_PUBLIC_SITE_URL을 확인
  // 설정되어 있지 않으면 Vercel에서 자동으로 설정된 NEXT_PUBLIC_VERCEL_URL을 사용
  // 이 두 값이 모두 없는 경우에는 "http://localhost:3000/"를 기본 URL로 사용
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // 운영 환경에서 설정한 사이트 URL
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Vercel에서 자동 설정한 URL
    "http://localhost:3000/";

  // 만약 URL에 "http"가 포함되어 있지 않다면 "https://"를 추가 (localhost는 예외)
  url = url.includes("http") ? url : `https://${url}`;

  // URL의 끝에 '/'가 포함되어 있지 않다면 '/'를 추가
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;

  return url;
};

/** 주어진 URL로 데이터를 POST하는 함수 */
export const postData = async ({
  url,
  data,
}: {
  url: string;
  data?: { price: Price };
}) => {
  console.log("posting,", url, data);

  // fetch를 사용하여 주어진 URL로 POST 요청을 보냄
  const res: Response = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

  // 응답이 성공적이지 않으면 에러를 던짐
  if (!res.ok) {
    console.log("Error in postData", { url, data, res });

    throw Error(res.statusText);
  }

  // JSON 형식으로 응답 데이터를 반환.
  return res.json();
};

/** 주어진 숫자(초)를 기준으로 한 날짜와 시간을 반환하는 함수 */
export const toDateTime = (secs: number) => {
  var t = new Date("1970-01-01T00:30:00Z"); // 유닉스 시간(1970년 1월 1일 0시 30분 00초)을 기준
  t.setSeconds(secs);
  return t;
};
