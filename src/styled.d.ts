// styled.d.ts
import 'styled-components';
declare module 'styled-components' {
    export interface DefaultTheme {
        color: {
            primary: IButtonPalette
            field: IButtonPalette
            button: IButtonPalette
            buttonCancel: IButtonPalette
            buttonDanger: IButtonPalette

            shadow: string
            bg: IPalette
        }
    }

    export interface IPalette {
        primary: string
        secondary: string
    }

    export interface IButtonPalette {
        default: string
        hover: string
        active: string

        text: string
        textHover: string
        textActive: string
    }

}