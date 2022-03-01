import { DefaultTheme } from "styled-components";

export const lightTheme: DefaultTheme = {
  color: {
    tab: {
      bgColor: "rgb(1, 1, 1)",
      bgHover: "rgb(100, 100, 100)",
      bgActive: "white",
      bgActiveHover: "rgb(200, 200, 200)",

      color: "white",
      hover: "white",
      active: "black",
      activeHover: "black",
    },

    button: {
      bgColor: "rgb(1, 1, 1)",
      bgHover: "rgb(100, 100, 100)",
      bgActive: "white",

      color: "white",
      hover: "rgb(100, 100, 100)",
      active: "black",
    },
    buttonCancel: {
      bgColor: "rgb(150, 150, 150)",
      bgHover: "rgb(120, 120, 120)",
      bgActive: "rgb(80, 80, 80)",

      color: "white",
      hover: "white",
      active: "white",
    },
    buttonDanger: {
      bgColor: "red",
      bgHover: "rgb(255, 100, 100)",
      bgActive: "rgb(255, 200, 200)",

      color: "white",
      hover: "white",
      active: "red",
    },

    bg: {
      primary: "#f6f5f4",
      secondary: "white",
    },
    shadow: "#00000055",
  },
};
