/**
 * A toggled tab with an non-active and active state
 */

import { pickPalette, ThemedAttributes } from "src/utils/themeUtils";
import styled, { css, ISwitchPalette } from "styled-components";

interface TabProps extends ThemedAttributes<HTMLButtonElement, ISwitchPalette> {
  active?: boolean;
}

const TabPalette = "tab";

const active = css`
  color: ${pickPalette(TabPalette, (c) => c.active)};
  background-color: ${pickPalette(TabPalette, (c) => c.bgActive)};
  border-color: ${pickPalette(TabPalette, (c) => c.active)};

  &:focus {
    color: ${pickPalette(TabPalette, (c) => c.active)};
    background-color: ${pickPalette(TabPalette, (c) => c.bgActive)};
    border-color: ${pickPalette(TabPalette, (c) => c.active)};
  }

  &:hover {
    color: ${pickPalette(TabPalette, (c) => c.activeHover)};
    background-color: ${pickPalette(TabPalette, (c) => c.bgActiveHover)};
    border-color: ${pickPalette(TabPalette, (c) => c.activeHover)};
  }
`;

const StyledTab = styled.button<TabProps>`
  cursor: pointer;

  width: fit-content;
  margin: 4px;

  display: flex;
  justify-content: center;
  align-items: center;

  color: ${pickPalette(TabPalette, (c) => c.color)};
  background-color: ${pickPalette(TabPalette, (c) => c.bgColor)};
  border-color: ${pickPalette(TabPalette, (c) => c.bgColor)};

  font: 1.1em;
  font-weight: 700;
  border-width: 2px;
  border-style: solid;

  &:hover,
  &:focus {
    color: ${pickPalette(TabPalette, (c) => c.hover)};
    background-color: ${pickPalette(TabPalette, (c) => c.bgHover)};
    border-color: ${pickPalette(TabPalette, (c) => c.bgHover)};
  }

  &:active {
    ${active}
  }

  ${(props) => (props.active ? active : "")}

  transition: color 0.1s, background-color 0.1s, border-color 0.1s;
`;
export default StyledTab;
