import { HTMLAttributes } from "react";
import { DefaultTheme } from "styled-components";

export function fallback<C>(color: C | undefined, fallback: C): C {
  return color ?? fallback;
}

type ThemeColor = DefaultTheme["color"];

export type ThemedAttributes<
  T,
  K extends ThemeColor[keyof ThemeColor]
> = HTMLAttributes<T> & {
  palette?: K;
};

/**
 * HOC For easily picking colors in styled components
 * props should extend ThemeAttributes<HTMLProps, PaletteInterface>
 * @param defaultColor
 * @param callback
 * @returns
 */
export const pickPalette =
  <
    P extends { theme: DefaultTheme; palette?: ThemeColor[K] },
    K extends keyof ThemeColor
  >(
    defaultColor: K,
    callback: (color: ThemeColor[K]) => string
  ) =>
  (props: P): string => {
    return callback(
      props.palette ? props.palette : props.theme.color[defaultColor]
    );
  };


