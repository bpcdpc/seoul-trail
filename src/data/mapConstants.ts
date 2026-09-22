import type { Position } from "../type/geoTypes";

// 초기 중심 좌료
export const SEOUL_CENTER: Position = {
  lat: 37.5665,
  lng: 126.978,
};

// 코스 난이도별 글자 색상
export const COURSE_LEVEL_TEXT_COLORS = [
  { key: "초급", colorName: "text-green-600" },
  { key: "중급", colorName: "text-orange-400" },
  { key: "상급", colorName: "text-red-600" },
];

// 코스 난이도별 배경 색상
export const COURSE_LEVEL_BG_COLORS = [
  { key: "초급", colorName: "bg-green-600" },
  { key: "중급", colorName: "bg-orange-400" },
  { key: "상급", colorName: "bg-red-600" },
];

// 카카오맵 지도 축척
// 축척 출처 https://devtalk.kakao.com/t/topic/35624/2
export const KAKAO_ZOOM_SCALES = [
  { key: 0, scale: 475 },
  { key: 1, scale: 950 },
  { key: 2, scale: 1900 },
  { key: 3, scale: 3800 },
  { key: 4, scale: 7600 },
  { key: 5, scale: 15200 },
  { key: 6, scale: 30400 },
  { key: 7, scale: 60800 },
  { key: 8, scale: 121600 },
  { key: 9, scale: 243200 },
  { key: 10, scale: 486400 },
  { key: 11, scale: 972800 },
  { key: 12, scale: 1945600 },
  { key: 13, scale: 3891200 },
  { key: 14, scale: 7782400 },
];

// 테일윈드 컬러
export const TAILWIND_COLORS = [
  {
    key: "slate",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
  },
  {
    key: "gray",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
  },
  {
    key: "zinc",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#374151",
  },
  {
    key: "neutral",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
  },
  {
    key: "stone",
    400: "#a8a29e",
    500: "#78716c",
    600: "#57534e",
    700: "#44403c",
  },
  {
    key: "red",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
  },
  {
    key: "orange",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
  },
  {
    key: "amber",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
  },
  {
    key: "yellow",
    400: "#facc15",
    500: "#eab308",
    600: "#ca8a04",
    700: "#a16207",
  },
  {
    key: "lime",
    400: "#a3e635",
    500: "#84cc16",
    600: "#65a30d",
    700: "#4d7c0f",
  },
  {
    key: "green",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
  },
  {
    key: "emerald",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
  },
  {
    key: "teal",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
  },
  {
    key: "cyan",
    400: "#22d3ee",
    500: "#06b6d4",
    600: "#0891b2",
    700: "#0e7490",
  },
  {
    key: "sky",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
  },
  {
    key: "blue",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },
  {
    key: "indigo",
    400: "#818cf8",
    500: "#6366f1",
    600: "#4f46e5",
    700: "#4338ca",
  },
  {
    key: "violet",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
  },
  {
    key: "purple",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
  },
  {
    key: "fuchsia",
    400: "#e879f9",
    500: "#d946ef",
    600: "#c026d3",
    700: "#a21caf",
  },
  {
    key: "pink",
    400: "#f472b6",
    500: "#ec4899",
    600: "#db2777",
    700: "#be185d",
  },
  {
    key: "rose",
    400: "#fb7185",
    500: "#f43f5e",
    600: "#e11d48",
    700: "#be123c",
  },
];
