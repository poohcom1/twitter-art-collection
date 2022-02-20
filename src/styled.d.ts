// styled.d.ts
import 'styled-components';

interface IPalette {
    primary: string
    secondary: string
}

interface IButton {
    main: string
    hover: string
    selected: string

    text: string
    textHover: string
    textSelected: string
}

declare module 'styled-components' {
    export interface DefaultTheme {
        color: {
            primary: IButton
            field: IButton

            shadow: string
            bg: IPalette
        }
    }
}