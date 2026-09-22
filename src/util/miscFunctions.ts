import {
  COURSE_LEVEL_BG_COLORS,
  COURSE_LEVEL_TEXT_COLORS,
} from "../data/mapConstants";
import { TAILWIND_COLORS } from "../data/mapConstants";

export function setLevelTextColor(level: string): string {
  const matched = COURSE_LEVEL_TEXT_COLORS.find(({ key }) =>
    level.includes(key),
  );
  return matched ? matched.colorName : "";
}

export function setLevelBgColor(level: string): string {
  const matched = COURSE_LEVEL_BG_COLORS.find(({ key }) => level.includes(key));
  return matched ? matched.colorName : "";
}

export function removeHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

export function getRandomTailwindColor(step: string): string {
  const pallete = TAILWIND_COLORS.map(
    (item) => item[step as keyof typeof item],
  );
  const randomIndex = Math.floor(Math.random() * pallete.length);
  return pallete[randomIndex];
}
