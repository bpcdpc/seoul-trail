import React, { useEffect, useRef, useState } from "react";
import type { MergedItem } from "../type/geoTypes";
import { X } from "lucide-react";
import { fetchImages } from "../util/fetchImageData";
import type { ImageItem } from "../type/imageTypes";
import { setLevelBgColor, removeHtml } from "../util/miscFunctions";
import { useContext } from "react";
import { TrailStateContext } from "../context/TrailStateContext";
import { TrailDispatchContext } from "../context/TrailDispatchContext";
import Header from "./Header";

export default function SideBar() {
  const { infos, selectedRoad, isSideBarOpen } = useContext(TrailStateContext);
  const { onSideBarClose, afterSideBarClosed } =
    useContext(TrailDispatchContext);

  const item: MergedItem | undefined = infos.find(
    (i) => i.ROAD_NO === selectedRoad,
  );

  const [images, setImages] = useState<ImageItem[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item) return;
    const loadImages = async () => {
      try {
        const imgResults: ImageItem[] = await fetchImages(item.ROAD_NM);
        setImages(imgResults);
      } catch (err) {
        console.error(err);
      }
    };
    loadImages();
  }, [item]);

  const onTransitionEnd = (e: React.TransitionEvent<HTMLElement>) => {
    if (e.target === e.currentTarget && e.propertyName === "width") {
      if (!isSideBarOpen) {
        afterSideBarClosed();
        setImages([]);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      }
    }
  };

  let sidebarContent = null;

  if (item) {
    const {
      ROAD_NO,
      ROAD_NM,
      ROAD_SUB_TTL,
      LV_KORN,
      ROAD_LEN,
      REQ_HR,
      ROAD_DTL_NM,
      STMP_PSTN_1,
      STMP_PSTN_2,
      STMP_PSTN_3,
      ROAD_EXPLN,
    } = item;

    const levelBgColor = setLevelBgColor(LV_KORN);
    // const positions = ROAD_DTL_NM.split(",");
    const stampPositions = [STMP_PSTN_1, STMP_PSTN_2, STMP_PSTN_3];
    const sanitizedStampPositions = stampPositions.map((s) => removeHtml(s));

    sidebarContent = (
      <div
        className="w-screen sm:w-100 pt-20 pl-3 pr-10 pb-6 h-full overflow-x-hidden overflow-y-scroll"
        ref={scrollRef}
      >
        {item && (
          <div className="text-gray-800 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold flex gap-2 items-center">
                <span className="bg-blue-600 text-white flex items-center justify-center w-11.5 h-11.25 rounded-lg outline-2 outline-blue-50 -outline-offset-5">
                  {ROAD_NO}
                </span>
                <span>{ROAD_NM}길</span>
              </h3>
              <h4 className="text-slate-500">{ROAD_SUB_TTL}</h4>
              <div className="flex gap-2 items-center">
                <span
                  className={`bg-gray-400 text-white px-1.5 py-0.5 rounded-sm text-xs ${levelBgColor}`}
                >
                  {LV_KORN} 코스
                </span>
                <span>
                  {ROAD_LEN}km, {REQ_HR}
                </span>
              </div>
            </div>

            <div className="grid grid-flow-col grid-rows-2 gap-px w-full aspect-square rounded-lg overflow-hidden bg-gray-200">
              {images &&
                images.length > 0 &&
                item &&
                images.map((image, index) => (
                  <div
                    className="overflow-hidden"
                    key={`IMG-${item.ROAD_NO}-${index}`}
                  >
                    <img
                      src={image.thumbnail_url}
                      alt={`${item.ROAD_NM}길`}
                      className="w-full h-full flex object-cover"
                    />
                  </div>
                ))}
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <div className="text-slate-500">경유지점</div>
              <div className="flex gap-2 flex-wrap">
                {ROAD_DTL_NM.replaceAll(",", " - ")}
                {/* {positions.map((p) => (
                  <span>{p}</span>
                ))} */}
              </div>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <div className="text-slate-500">스탬프함 위치</div>
              <div className="flex flex-wrap gap-1">
                {sanitizedStampPositions.filter(Boolean).join(", ")}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-slate-500  text-sm">둘레길 설명</div>
              <p>{ROAD_EXPLN}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <aside
      className={`transition-[width] duration-300 absolute z-500 bg-gray-50 overflow-hidden h-full shadow-2xl ${
        isSideBarOpen ? "w-full sm:w-100" : "w-0"
      }`}
      onTransitionEnd={onTransitionEnd}
    >
      <Header />
      <div className="absolute w-full h-13 bg-white shadow-sm"></div>
      <button onClick={onSideBarClose} className="absolute right-3 top-3 z-100">
        <X size={25} strokeWidth={2} color="#333" />
      </button>
      {sidebarContent}
    </aside>
  );
}
