import { CustomOverlayMap } from "react-kakao-maps-sdk";
import type { MergedItem } from "../type/geoTypes";
import React, { useState, useCallback } from "react";
import { setLevelBgColor, setLevelTextColor } from "../util/miscFunctions";

type MarkerSetProps = {
  item: MergedItem;
  isSelected: boolean;
  selectedLevel: string;
  onRoadSelect: (targetRoadNumber: number) => void;
};

const MarkerSet = ({
  item,
  isSelected,
  selectedLevel,
  onRoadSelect,
}: MarkerSetProps) => {
  const [isOver, setIsOver] = useState(false);
  const isFiltered = selectedLevel === item.LV_KORN;

  // 모바일 에서 hover 액션 하지 않도록 대응
  const handleMouseEnter = useCallback(() => {
    if (window.matchMedia("(hover: hover)").matches) setIsOver(true);
  }, []);

  // 상황에 따른 마커 배경색과 인포윈도우 텍스트 색상
  let bgColor = "";
  let textColor = "";
  if (isFiltered) {
    // 레벨 필터링에서 선택된 상태
    bgColor = setLevelBgColor(item.LV_KORN);
    textColor = setLevelTextColor(item.LV_KORN);
  } else if (isSelected) {
    // 사용자가 마커를 클릭해서 해당 둘레길을 선택한 상태
    bgColor = "bg-indigo-600";
    textColor = "text-indigo-600";
  } else if (selectedLevel !== "") {
    // 레벨 필터링에서 걸러진 상태
    bgColor = "bg-zinc-400 opacity-90";
    textColor = "text-zinc-400";
  } else if (isOver) {
    // 사용자가 마커에 마우스를 오버한 상태
    bgColor = "bg-blue-500";
    textColor = "text-blue-500";
  } else {
    // 기본 상태
    bgColor = "bg-blue-400";
    textColor = "text-blue-400";
  }

  // 마커 스타일
  const baseStyle =
    "w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 shadow-md font-bold text-xs text-white";

  const sizeStyle = isSelected || isOver ? "scale-110" : "scale-100";
  const ringStyle = isSelected ? "ring-4 ring-indigo-200" : "";

  const markerStyles = `${baseStyle} ${sizeStyle} ${ringStyle} ${bgColor}`;

  // zIndex: 호버(50) > 선택/필터링(30) > 기본(10)
  const overlayZIndex = isOver ? 50 : isSelected || isFiltered ? 30 : 10;

  return (
    <CustomOverlayMap
      position={item.position}
      yAnchor={0.5}
      zIndex={overlayZIndex}
    >
      <div
        className="relative flex flex-col items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsOver(false)}
      >
        {/* InfoWindow */}
        {(isOver || isSelected) && (
          <div className="absolute bottom-10 z-50 bg-white px-3 py-2 rounded-lg shadow-xl border border-gray-100 ">
            <p className={`text-xs font-semibold ${textColor}`}>
              {item.ROAD_NM}길
            </p>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100" />
          </div>
        )}

        {/* Marker */}
        <div className={markerStyles} onClick={() => onRoadSelect(item.ROAD_NO)}>
          {item.ROAD_NO}
        </div>
      </div>
    </CustomOverlayMap>
  );
};

export default React.memo(MarkerSet);
