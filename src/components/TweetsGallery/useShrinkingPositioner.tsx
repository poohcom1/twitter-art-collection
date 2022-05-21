import { UsePositionerOptions, Positioner, createPositioner } from "masonic";
import React from "react";

export default function useShrinkingPositioner(
  {
    width,
    columnWidth = 200,
    columnGutter = 0,
    rowGutter,
    columnCount,
  }: UsePositionerOptions,
  items: React.DependencyList = []
): Positioner {
  const initPositioner = (): Positioner => {
    const [computedColumnWidth, computedColumnCount] = getColumns(
      width,
      columnWidth,
      columnGutter,
      columnCount
    );
    return createPositioner(
      computedColumnCount,
      computedColumnWidth,
      columnGutter,
      rowGutter ?? columnGutter
    );
  };
  const positionerRef = React.useRef<Positioner>();
  if (positionerRef.current === undefined)
    positionerRef.current = initPositioner();

  const prevLength = React.useRef(items.length);
  const opts = [width, columnWidth, columnGutter, rowGutter, columnCount];
  const prevOpts = React.useRef(opts);
  const optsChanged = !opts.every((item, i) => prevOpts.current[i] === item);

  // Only recreated positioner when item size decreased
  if (optsChanged || items.length < prevLength.current) {
    const prevPositioner = positionerRef.current;
    const positioner = initPositioner();
    prevLength.current = items.length;
    prevOpts.current = opts;

    if (optsChanged) {
      const cacheSize = prevPositioner.size();
      for (let index = 0; index < cacheSize; index++) {
        const pos = prevPositioner.get(index);
        positioner.set(index, pos !== void 0 ? pos.height : 0);
      }
    }

    positionerRef.current = positioner;
  }

  // Update item length
  if (items.length !== prevLength.current) {
    prevLength.current = items.length;
  }

  return positionerRef.current;
}

const getColumns = (
  width = 0,
  minimumWidth = 0,
  gutter = 8,
  columnCount?: number
): [number, number] => {
  columnCount =
    columnCount || Math.floor((width + gutter) / (minimumWidth + gutter)) || 1;
  const columnWidth = Math.floor(
    (width - gutter * (columnCount - 1)) / columnCount
  );
  return [columnWidth, columnCount];
};
