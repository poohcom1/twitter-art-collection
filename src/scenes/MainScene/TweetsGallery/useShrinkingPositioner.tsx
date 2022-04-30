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

  const prevItems = React.useRef(items.length);
  const opts = [width, columnWidth, columnGutter, rowGutter, columnCount];
  const prevOpts = React.useRef(opts);
  const optsChanged = !opts.every((item, i) => prevOpts.current[i] === item);

  // Create a new positioner when the dependencies or sizes change
  // Thanks to https://github.com/khmm12 for pointing this out
  // https://github.com/jaredLunde/masonic/pull/41
  if (optsChanged || items.length < prevItems.current) {
    const prevPositioner = positionerRef.current;
    const positioner = initPositioner();
    prevItems.current = items.length;
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
