import { ENV } from "../config/env";
import type {
  InfoItem,
  InfoResponse,
  MergedItem,
  // PathItem,
  // PathResponse,
  // PointItem,
  // PointResponse,
  Position,
} from "../type/geoTypes";

// 데이터 페칭
async function fetchData<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errorText = res.text();
      throw new Error(`HTTP Error : ${res.status} ${errorText}`);
    }
    const data: T = await res.json();
    return data;
  } catch (err) {
    if (err instanceof Error) console.log(err);
    return null;
  }
}

// 둘레길 상세 정보 아이템
export async function fetchInfoItems(): Promise<InfoItem[]> {
  const url = `${ENV.SODATA_URL}/${ENV.SODATA_KEY}/json/viewGil/1/100`;
  const infoRes: InfoResponse | null = await fetchData<InfoResponse>(url);
  if (!infoRes) throw new Error("둘레길 정보를 가져오지 못했습니다.");
  return infoRes.viewGil.row;
}

// 둘레길 선형 좌표
// export async function fetchPathItems(): Promise<PathItem[]> {
//   const url = `${ENV.SODATA_URL}/${ENV.SODATA_KEY}/json/SdeDoDreamWay01LW/1/100`;
//   const pathRes: PathResponse | null = await fetchData<PathResponse>(url);
//   if (!pathRes) throw new Error("둘레길 선형 좌표를 가져오지 못했습니다.");
//   return pathRes.SdeDoDreamWay01LW.row;
// }

// 둘레길 점형 좌표
// export async function fetchPointItems(): Promise<PointItem[]> {
//   const url = `${ENV.SODATA_URL}/${ENV.SODATA_KEY}/json/SdeDoDreamWay01PW/1/200`;
//   const pointRes: PointResponse | null = await fetchData<PointResponse>(url);
//   if (!pointRes) throw new Error("둘레길 점형 좌표를 가져오지 못했습니다.");
//   return pointRes.SdeDoDreamWay01PW.row;
// }

// 둘레길 이름으로 좌표 얻어오기
function getPositionByName(name: string): Promise<Position> {
  return new Promise((resolve, reject) => {
    const places = new kakao.maps.services.Places();

    places.keywordSearch(name, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        resolve({ lat: Number(result[0].y), lng: Number(result[0].x) });
      } else {
        reject(new Error("좌표를 찾을 수 없습니다."));
      }
    });
  });
}

// 비동기 딜레이
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 캐시 데이터 검증
// JSON.parse 결과를 `as MergedItem[]` 로 단언하면 타입스크립트는 통과하지만
// 실제 구조가 다를 때 마커 좌표가 조용히 비어버린다. 그래서 런타임에 확인한다.
function isValidMergedItem(item: unknown): item is MergedItem {
  if (typeof item !== "object" || item === null) return false;
  const candidate = item as Partial<MergedItem>;
  return (
    typeof candidate.ROAD_NO === "number" &&
    typeof candidate.position === "object" &&
    candidate.position !== null &&
    Number.isFinite(candidate.position.lat) &&
    Number.isFinite(candidate.position.lng)
  );
}

// 캐시 문자열을 파싱하고 검증한다. 하나라도 어긋나면 null 을 반환한다.
function parseCache(raw: string): MergedItem[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    if (!parsed.every(isValidMergedItem)) return null;
    return parsed;
  } catch {
    return null;
  }
}

// 둘레길 상세 정보에 위도, 경도 주입
export async function fetchMergedItems(): Promise<MergedItem[]> {
  // 캐시 설정
  // 캐시 데이터의 구조가 바뀌면 버전을 올린다.
  // 예전 구조로 저장된 캐시는 아래 parseCache 검사에서도 걸러지지만,
  // 버전을 올리면 키 자체가 달라지므로 검사 이전에 확실히 무시된다.
  const CACHE_VERSION = "v2";
  const CACHE_KEY = `seoul_trail_merged_items_${CACHE_VERSION}`;

  // 버전 도입 이전 키가 남아 있으면 정리한다.
  localStorage.removeItem("seoul_trail_merged_items");

  // 캐시가 존재한다면 캐시 데이터를 반환
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData) {
    const parsed = parseCache(cachedData);
    if (parsed) {
      console.log("캐시 데이터가 존재하므로 캐시된 데이터를 불러옵니다.");
      return parsed;
    }
    // 캐시가 깨졌거나 구조가 맞지 않으면 버리고 새로 받는다.
    console.warn("캐시 데이터가 유효하지 않아 삭제하고 새로 가져옵니다.");
    localStorage.removeItem(CACHE_KEY);
  }

  // 둘레길 상세 정보 가져오기
  const infoItems: InfoItem[] = await fetchInfoItems();

  // 카카오맵이 공격으로 인식하지 않게 위해 청킹.
  // // 초당, 분당 rate limit이 각각 있는 것으로 보여, 4개씩만 청킹하고, 1초씩 딜레이를 줌.
  // // 순차방식 : 21개 아이템 x 0.8초 딜레이 = 16.8 초 걸림
  // // 청크방식 : (ceil(21개 아이템 / 청크 4개) * 1초 딜레이) - 마지막 루프에 딜레이 1초 제거  = 5초 걸림
  // // 실제 운영시에는 동시 접속자가 생기므로, 현재 방식으로는 운영이 불가함.
  // // 서버 사이드에서 처리해야 할 것으로 보임.
  const mergedItems: MergedItem[] = [];
  const chunkSize: number = 4;

  for (let i = 0; i < infoItems.length; i += chunkSize) {
    const chunk = infoItems.slice(i, i + chunkSize);

    // 청크 크기만큼 프라미스 배열 생성
    const chunkPromises: Promise<Position>[] = chunk.map((item) =>
      getPositionByName(item.BGNG_PSTN),
    );

    // 청크 크기만큼 병렬 처리
    const chunkPositions: Position[] = await Promise.all(chunkPromises);

    // 둘레길 상세 정보에 좌표 정보 병합
    chunkPositions.map((item, index) => {
      mergedItems.push({ ...infoItems[i + index], position: item });
      console.log(`${infoItems[i + index].BGNG_PSTN} 좌표 검색 성공`);
    });

    // 마지막 루프가 아닐 경우에만 대기
    if (i + chunkSize < infoItems.length) {
      await delay(1000);
    }
  }

  // 청킹하지 않고 순차적으로 가져오는 방식.
  // for (const item of infoItems) {
  //   try {
  //     const cleanName = item.BGNG_PSTN.trim();
  //     const position = await getPositionByName(cleanName);
  //     mergedItems.push({ ...item, position });
  //     console.log(`${item.BGNG_PSTN} 좌표 검색 성공`);
  //     await delay(800);
  //   } catch (error) {
  //     console.error(`${item.BGNG_PSTN} 좌표 검색 실패:`, error);
  //   }
  // }

  // 하나도 가져오지 못했을 경우
  if (mergedItems.length === 0)
    throw new Error("좌표를 하나도 가져오지 못했습니다.");

  console.log(
    `좌표 검색이 끝났습니다. 전체 ${infoItems.length}개 중 ${mergedItems.length}개 성공`,
  );

  // 로컬 스토리지에 저장하고 데이터 반환
  localStorage.setItem(CACHE_KEY, JSON.stringify(mergedItems));
  return mergedItems;
}
