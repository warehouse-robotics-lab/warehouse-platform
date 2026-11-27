import { CELL_SIZE_PX } from "../consts.js";
import type { AxisStripProps } from "../types.js";
import { AxisLabel } from "./axis-label.js";

export function AxisStrip({ count, activeIndex, orientation }: AxisStripProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      style={{
        display: "grid",
        ...(isHorizontal
          ? { gridTemplateColumns: `repeat(${count}, ${CELL_SIZE_PX}px)` }
          : { gridTemplateRows: `repeat(${count}, ${CELL_SIZE_PX}px)` }),
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <AxisLabel
          key={`${orientation}-label-${index}`}
          active={activeIndex === index}
          label={index + 1}
        />
      ))}
    </div>
  );
}
