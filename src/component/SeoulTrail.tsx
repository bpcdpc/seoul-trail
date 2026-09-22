import { ENV } from "../config/env";
import { useKakaoLoader } from "react-kakao-maps-sdk";
import { useState, useEffect, useReducer, useMemo } from "react";
import { TrailStateContext } from "../context/TrailStateContext";
import { TrailDispatchContext } from "../context/TrailDispatchContext";
import { initialTrailState, trailReducer } from "../reducer/trailReducer";
import { fetchMergedItems } from "../util/fetchGeoData";

import MainMap from "./MainMap";
import SideBar from "./SideBar";
import Footer from "./Footer";
import Header from "./Header";
import StatusScreen from "./StatusScreen";
import RefreshButton from "./RefreshButton";
import Spinner from "./Spinner";

export default function SeoulTrail() {
  // 상태 관리 reducer
  const [state, dispatch] = useReducer(trailReducer, initialTrailState);

  // 렌더링을 조건을 위한 states
  const [fetching, setFetching] = useState<boolean>(true);
  const [fetched, setFetched] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);

  // 카카오 지도 로딩 hook
  const [isMapLoading, mapLoadingError] = useKakaoLoader({
    appkey: ENV.MAP_KEY,
    libraries: ["services"],
  });

  // Context Provider 에 전달할 함수들을 메모이제이션한다.
  // 왜냐하면, value={객체} 로 전달할 떄, `객체`가 새로 만들어지지 않게 하기 위해서이다.
  const dispatchValue = useMemo(
    () => ({
      // 지도에서 특정 둘레길 마커를 선택할 때
      onRoadSelect: (targetRoadNumber: number) =>
        dispatch({ type: "SELECT_ROAD", payload: targetRoadNumber }),
      // 사이드바가 닫힐 때
      onSideBarClose: () => dispatch({ type: "CLOSE_SIDEBAR" }),
      // 사이드바가 닫힌 후에
      afterSideBarClosed: () => dispatch({ type: "AFTER_SIDEBAR_CLOSED" }),
      // 앱을 초기화
      onAppInit: () => dispatch({ type: "APP_INIT" }),
      // 난이도를 선택할 때
      onLevelChange: (levelName: string) =>
        dispatch({ type: "SET_LEVEL", payload: levelName }),
    }),
    [],
  );

  // 데이터 가져오기
  useEffect(() => {
    if (isMapLoading) return; // 지도가 로드되기 전에 데이터 가져오는 것을 방지

    const loadInitialData = async () => {
      try {
        const infoResults = await fetchMergedItems();
        // setInfos(infoResults);
        dispatch({ type: "SET_INFOS", payload: infoResults });
        setFetched(true); // 데이터가 성공적으로 가져와짐
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false); // 성공 실패에 관계없이 데이터 가져오는 과정이 끝났음
      }
    };
    loadInitialData();
  }, [isMapLoading]); // 지도 로딩 여부를 의존성 주입

  //  지도 로딩중
  if (isMapLoading)
    return (
      <StatusScreen message={"Map loading..."}>
        <Spinner />
      </StatusScreen>
    );

  // 지도 로딩 실패
  if (mapLoadingError)
    return (
      <StatusScreen message={"지도 로드에 실패했습니다. 다시 시도해 주세요."}>
        <RefreshButton />
      </StatusScreen>
    );

  // 데이터 로딩중
  if (fetching)
    return (
      <StatusScreen message={"Data loading..."}>
        <Spinner />
      </StatusScreen>
    );

  // 데이터 로딩 실패
  if (!fetched)
    return (
      <StatusScreen
        message={"데이터를 가져오는데 실패했습니다. 다시 시도해 주세요."}
      >
        <RefreshButton />
      </StatusScreen>
    );

  // 데이터 로딩 성공
  if (fetched && !showMap)
    return (
      <StatusScreen backgroundColor={"bg-blue-500"}>
        <button
          className="px-4 py-2 text-blue-600 bg-white rounded-md text-xl font-extrabold transition-all ease-in-out hover:scale-103"
          onClick={() => {
            setShowMap(true);
          }}
        >
          SEOUL TRAIL
        </button>
      </StatusScreen>
    );

  return (
    <TrailDispatchContext.Provider value={dispatchValue}>
      <TrailStateContext.Provider value={state}>
        <div className="relative w-screen h-dvh overflow-hidden">
          <Header />
          <SideBar />
          <MainMap />
          <Footer />
        </div>
      </TrailStateContext.Provider>
    </TrailDispatchContext.Provider>
  );
}
