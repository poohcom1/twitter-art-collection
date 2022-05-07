import Popup from "reactjs-popup";
import styled from "styled-components";

const StyledPopup = styled(Popup)`
  @keyframes anvil {
    0% {
      transform: scale(1) translateY(0px);
      opacity: 0;
    }
    1% {
      transform: scale(0.96) translateY(10px);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0px);
      opacity: 1;
    }
  }

  &-content {
    padding: 10px;
    background: white;
    color: black;
    border-radius: 5px;
    box-shadow: 0 0 5px ${(props) => props.theme.color.shadow};
    animation: anvil 0.15s cubic-bezier(0.38, 0.1, 0.36, 0.9) forwards;
  }

  &-arrow {
    z-index: 10;
    color: white;
  }
`;

export const PopupItem = styled.button`
  color: black;

  display: block;
  background-color: transparent;

  text-align: left;
  width: 100%;

  border: none;

  border-radius: 5px;

  padding: 3px 10px;
  cursor: pointer;
  font-size: 17px;

  &:hover {
    background-color: #00000019;
  }

  font-weight: 590;
`;

export default StyledPopup;
