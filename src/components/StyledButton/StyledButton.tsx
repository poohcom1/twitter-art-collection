import { pickPalette, ThemedAttributes } from "src/utils/themeUtils";
import styled, { IButtonPalette } from "styled-components";

interface ButtonProps
  extends ThemedAttributes<HTMLButtonElement, IButtonPalette> {
  palette?: IButtonPalette;
}

const buttonPalette = "button";

const StyledButton = styled.button<ButtonProps>`
  padding: 5px 15px;
  cursor: pointer;

  border-style: solid;
  border-radius: 5em;
  margin: 8px;
  padding: 16px;
  font-size: 1.1em;

  color: ${pickPalette(buttonPalette, (c) => c.color)};
  background-color: ${pickPalette(buttonPalette, (c) => c.bgColor)};
  border-color: ${pickPalette(buttonPalette, (c) => c.bgColor)};

  &:hover {
    color: ${pickPalette(buttonPalette, (c) => c.hover)};
    background-color: ${pickPalette(buttonPalette, (c) => c.bgHover)};
    border-color: ${pickPalette(buttonPalette, (c) => c.bgHover)};
  }

  &:active {
    color: ${pickPalette(buttonPalette, (c) => c.active)};
    background-color: ${pickPalette(buttonPalette, (c) => c.bgActive)};
    border-color: ${pickPalette(buttonPalette, (c) => c.bgActive)};
  }
`;

export default StyledButton;
