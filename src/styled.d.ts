// styled.d.ts
import "styled-components";
declare module "styled-components" {
  export interface DefaultTheme {
    color: {
      tab: ISwitchPalette;

      button: IButtonPalette;
      buttonCancel: IButtonPalette;
      buttonDanger: IButtonPalette;

      shadow: string;
      bg: IPalette;
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
}
