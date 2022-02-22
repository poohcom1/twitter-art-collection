import { DefaultTheme } from "styled-components";

export const lightTheme: DefaultTheme = {
    color: {
        primary: {
            main: "rgb(1, 1, 1)",
            hover: "rgb(100, 100, 100)",
            selected: "white",

            text: "white",
            textHover: "rgb(100, 100, 100)",
            textSelected: "black",
        },
        button: {
            main: "rgb(1, 1, 1)",
            hover: "rgb(100, 100, 100)",
            selected: "white",

            text: "white",
            textHover: "rgb(100, 100, 100)",
            textSelected: "black",
        },
        field: {
            main: "#e6e5e4",
            hover: "rgb(200, 200, 200)",
            selected: "rgb(100, 100, 100)",

            text: "rgb(30, 30, 30)",
            textHover: "rgb(30, 30, 30)",
            textSelected: "rgb(30, 30, 30)",
        },
        bg: {
            primary: "#f6f5f4",
            secondary: "white"
        },
        shadow: "#00000055"
    }
}