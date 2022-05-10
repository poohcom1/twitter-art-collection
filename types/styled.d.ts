// styled.d.ts
import "styled-components";
declare module "styled-components" {
  export interface DefaultTheme {
    color: {
      primary: string;
      secondary: string;
      accent: string;

      danger: string;

      background: string;
      surface: string;
      surfaceBorder: string;

      shadow: string;

      // Text
      onPrimary: string;
      onSecondary: string;
      onAccent: string;
      onBackground: string;
      onSurface: string;
    };
  }

  export interface IPalette {
    primary: string;
    secondary: string;
  }

  export interface IButtonPalette {
    bgColor: string;
    bgHover: string;
    bgActive: string;

    color: string;
    hover: string;
    active: string;
  }

  export interface ISwitchPalette extends IButtonPalette {
    activeHover: string;

    bgActiveHover: string;
  }

  export interface WithTheme {
    theme: DefaultTheme;
  }
}
