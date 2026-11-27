import {
  AXIS_LABEL_FONT_SIZE,
  LABEL_ACTIVE_COLOR,
  LABEL_COLOR,
} from "../consts.js";
import type { AxisLabelProps } from "../types.js";

export function AxisLabel({ active, label }: AxisLabelProps) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? LABEL_ACTIVE_COLOR : LABEL_COLOR,
        fontSize: AXIS_LABEL_FONT_SIZE,
        fontWeight: active ? 600 : 400,
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      {label}
    </span>
  );
}
