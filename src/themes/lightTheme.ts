import { DefaultTheme } from "styled-components";

export const lightTheme: DefaultTheme = {
    color: {
        primary: {
            default: "rgb(1, 1, 1)",
            hover: "rgb(100, 100, 100)",
            active: "white",

            text: "white",
            textHover: "rgb(100, 100, 100)",
            textActive: "black",
        },
        button: {
            default: "rgb(1, 1, 1)",
            hover: "rgb(100, 100, 100)",
            active: "white",

            text: "white",
            textHover: "rgb(100, 100, 100)",
            textActive: "black",
        },
        buttonDanger: {
            default: "red",
            hover: "rgb(255, 100, 100)",
            active: "rgb(255, 200, 200)",

            text: "white",
            textHover: "rgb(100, 100, 100)",
            textActive: "rgb(100, 100, 100)",
        },
        field: {
            default: "#e6e5e4",
            hover: "rgb(200, 200, 200)",
            active: "rgb(100, 100, 100)",

            text: "rgb(30, 30, 30)",
            textHover: "rgb(30, 30, 30)",
            textActive: "rgb(30, 30, 30)",
        },
        bg: {
            primary: "#f6f5f4",
            secondary: "white"
        },
        shadow: "#00000055"
    }
}