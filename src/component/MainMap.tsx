import { Map, MapTypeId, Polyline } from "react-kakao-maps-sdk";
import type { Position, Direction } from "../type/geoTypes";
import MarkerSet from "./MarkerSet";
import { useContext, useEffect, useRef, useState } from "react";
import ZoomButtons from "./ZoomButtons";
import MyLocationButton from "./MyLocationButton";
import MyLocationMarker from "./MyLocationMarker";
import { parseGeoJson } from "../util/parseGeoJson";
import FilterButtons from "./FilterButtons";
import { SEOUL_CENTER } from "../data/mapConstants";
import { TrailStateContext } from "../context/TrailStateContext";
import { TrailDispatchContext } from "../context/TrailDispatchContext";

// 업데이트, fetch 가능성이 없으므로 컴포넌트 외부에서 데이터를 가공한다.
// 컴포넌트 라이프사이클과 무관하게 된다.
const polyLines: Position[][][] = parseGeoJson();

export default function MainMap() {
  const { infos, selectedRoad, selectedLevel, isSideBarOpen, mapResetCount } =
    useContext(TrailStateContext);
  const { onRoadSelect, onLevelChange } = useContext(TrailDispatchContext);

  // 지도를 조작하기 위해 필요
  const mapRef = useRef<kakao.maps.Map>(null);

  // 내 위치 관련 state
  const [isMyLocation, setIsMyLocation] = useState<boolean>(false);
  const [myLocation, setMyLocation] = useState<Position>(SEOUL_CENTER);

  // 지도 객체 널 체크 루틴
  // 모든 지도 조작 루틴은 map 객체가 확인된 후에 진행하는 것이 좋으므로
  // withMap 콜백 안에서 진행하는 것이 좋다.
  const withMap = (action: (map: kakao.maps.Map) => void) => {
    const map = mapRef.current;
    if (!map) return;
    action(map);
  };

  // 사이드바가 펼쳐졌는지 감지해서 오프셋 위경도 계산해주는 함수.
  // 카카오맵에서 레벨과 센터를 동시에 변경하려면
  // jump 메쏘드로 한번에 호출해야 해서, 메쏘드 호출 전에 오프셋을 다 계산해서 넘겨줘야 함.
  const calcOffsetLng = (targetLevel: number, curLevel: number): number => {
    let offsetLng = 0;
    // 사이드바 너비가 테일윈드로 지정되어 있는데,
    // 기본값은 가로 full 이고,
    // 브라우저 너비가 sm 이상일 경우에는 100 == 40rem == 640px 으로 제한되도록 구현되었다.
    // 그래서 사이드바가 열려있고, 브라우저 너비가 조건에 맞을 경우에만 사이드바 너비를 고려해야 한다.
    if (isSideBarOpen && window.innerWidth >= 640) {
      withMap((map) => {
        // 레벨 차이
        const deltaLevel = targetLevel - curLevel;

        // 현재 지도의 중심 좌표의 포인트를 계산
        const projection = map.getProjection();
        const centerLatLng = map.getCenter();
        const centerPoint = projection.containerPointFromCoords(centerLatLng);

        // 레벨 차이를 고려하여 몇 픽셀을 이동시키면 될지 계산
        centerPoint.x -= 200 * 2 ** deltaLevel;

        // 계산된 point를 위경도 좌표로 변환
        const newLatLng = projection.coordsFromContainerPoint(centerPoint);

        // 경도 차이값을 계산
        offsetLng = newLatLng.getLng() - centerLatLng.getLng();
      });
    }
    return offsetLng;
  };

  const onZoomChange = (direction: Direction) => {
    withMap((map) => {
      const curLevel = map.getLevel();
      const targetLevel = direction === "IN" ? curLevel - 1 : curLevel + 1;

      if (targetLevel < 1 || targetLevel > 14) return;

      let newLatLng = new kakao.maps.LatLng(
        map.getCenter().getLat(),
        map.getCenter().getLng() -
          calcOffsetLng(curLevel, curLevel) + // 이미 사이드바에 의해서 변경된 센터일 가능성이 있으므로, 원래 센터로 한번 바꿔준다.
          calcOffsetLng(targetLevel, curLevel),
      );

      (map as any).jump(newLatLng, targetLevel, { animate: true });
    });
  };

  const onMyLocation = () => {
    withMap((map) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLatLng = new kakao.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude,
          );

          const newPosition = {
            lat: newLatLng.getLat(),
            lng: newLatLng.getLng(),
          };
          setMyLocation(newPosition);
          setIsMyLocation(true);

          const offsetLatLng = new kakao.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude + calcOffsetLng(7, map.getLevel()),
          );

          (map as any).jump(offsetLatLng, 7, { animate: true });
        },
        (error) => {
          console.error("위치 정보를 가져오는데 실패했습니다.", error);
        },
      );
    });
  };

  const onDragEnd = () => {
    withMap((map) => {
      const curCenter = map.getCenter();
      const curLat = curCenter.getLat();
      const curLng = curCenter.getLng();

      const isMoved =
        Math.abs(curLat - myLocation.lat) > 0.05 ||
        Math.abs(curLng - myLocation.lng) > 0.05;

      if (isMoved && isMyLocation) {
        setIsMyLocation(false);
      }
    });
  };

  const onMapInit = () => {
    withMap((map) => {
      // 카카오맵은 실제 지도 조작과 state 관리를 분리해야 함
      const seoulLatLng = new kakao.maps.LatLng(
        SEOUL_CENTER.lat,
        SEOUL_CENTER.lng,
      );

      // 카카오맵에서 setCenter를 하고, setLevel을 하면 애니메이션이 부드럽게 되지 않음.
      // 카카오맵 원본 API에서 둘을 한꺼번에 처리할 수 있는 jump 기능을 추가해 줌.
      // react 라이브러리에서 jump 메서드가 추가되어 있지 않아, 임시방편으로 type any로 단언하여 사용중
      (map as any).jump(seoulLatLng, 9, { animate: true });
      setIsMyLocation(false);
    });
  };

  const onMarkerSelected = () => {
    const selectedRoadItem = infos.find(
      (item) => item.ROAD_NO === selectedRoad,
    );
    if (selectedRoadItem) {
      withMap((map) => {
        let newLatLng = new kakao.maps.LatLng(
          selectedRoadItem.position.lat,
          selectedRoadItem.position.lng + calcOffsetLng(7, map.getLevel()),
        );

        (map as any).jump(newLatLng, 7, { animate: true });
        setIsMyLocation(false);
      });
    }
  };

  // 지도 초기화
  useEffect(() => {
    onMapInit();
  }, [mapResetCount]); // 부모의 onAppInit이 실행되면 mapResetCount 값이 변경되고, 그것을 감지하여 지도를 초기화 한다.

  // 마커가 선택될 때
  useEffect(() => {
    onMarkerSelected();
  }, [selectedRoad]); // 마커가 선택될 때마다 지도의 센터에 마커가 오도록 계산

  return (
    <div>
      <Map
        center={SEOUL_CENTER}
        isPanto={true}
        className="w-screen h-dvh"
        level={9}
        ref={mapRef}
        // zoomable={false}
        onDragEnd={onDragEnd}
      >
        {infos.map((i) => (
          <MarkerSet
            key={i.ROAD_NO}
            item={i}
            onRoadSelect={onRoadSelect}
            isSelected={i.ROAD_NO === selectedRoad}
            selectedLevel={selectedLevel}
          />
        ))}
        {isMyLocation && <MyLocationMarker position={myLocation} />}
        {polyLines &&
          polyLines.map((positions, index) => (
            <Polyline
              key={index}
              path={positions}
              strokeWeight={4}
              strokeColor={"oklch(51.1% 0.262 276.966)"}
              strokeOpacity={0.7}
              strokeStyle={"solid"}
            />
          ))}
        <MapTypeId type={"TERRAIN"} />
      </Map>
      <ZoomButtons onZoomChange={onZoomChange} />
      <MyLocationButton onMyLocation={onMyLocation} />
      <FilterButtons onLevelChange={onLevelChange} />
    </div>
  );
}
