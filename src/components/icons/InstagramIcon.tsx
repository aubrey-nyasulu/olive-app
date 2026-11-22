import Svg, { Rect, Circle, Line } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

/**
 * Custom Instagram icon matching Lucide's stroke style.
 * Lucide removed brand icons, so we provide our own SVG.
 */
export function InstagramIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <Circle cx="12" cy="12" r="4" />
      <Line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </Svg>
  );
}
