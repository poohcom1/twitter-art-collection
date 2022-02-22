// styled.d.ts
import 'styled-components';

interface IPalette {
    primary: string
    secondary: string
}

interface IButton {
    default: string
    hover: string
    active: string

    text: string
    textHover: string
    textActive: string
}

declare module 'styled-components' {
    export interface DefaultTheme {
        color: {
            primary: IButton
            field: IButton
            button: IButton
            buttonDanger: IButton

            shadow: string
            bg: IPalette
        }
    }
}