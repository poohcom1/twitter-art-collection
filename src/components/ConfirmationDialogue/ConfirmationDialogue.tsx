import React, { useCallback, useMemo } from "react";
import { ForwardedRef, forwardRef } from "react";
import styled, {
  DefaultTheme,
  IButtonPalette,
  withTheme,
} from "styled-components";
import { StyledButton } from "..";

const DialogueDiv = styled.div`
  padding: 32px;
  background-color: ${(props) => props.theme.color.bg.secondary};
`;

const ButtonDiv = styled.div`
  display: flex;
  justify-content: flex-end;
`;

interface ConfirmationDialogueProps {
  closeCallback: () => void;
  title?: string;
  text?: string;
  acceptText?: string;
  cancelText?: string;

  acceptColor?: IButtonPalette;
  cancelColor?: IButtonPalette;

  onAccept?: () => void;
}

const ConfirmationDialogue = withTheme(
  forwardRef(function ConfirmationDialogue(
    props: ConfirmationDialogueProps & { theme: DefaultTheme },
    ref: ForwardedRef<HTMLDivElement>
  ) {
    return (
      <DialogueDiv ref={ref}>
        <h1>{props.title}</h1>
        <br />
        <p>{props.text}</p>
        <br />
        <ButtonDiv>
          <StyledButton
            palette={props.acceptColor ?? props.theme.color.button}
            onClick={useCallback(
              () => (props.onAccept ? props.onAccept() : {}),
              [props]
            )}
          >
            {useMemo(() => props.acceptText ?? "Accept", [props.acceptText])}
          </StyledButton>
          <StyledButton
            palette={props.cancelColor ?? props.theme.color.buttonCancel}
            onClick={useCallback(() => props.closeCallback(), [props])}
          >
            {useMemo(() => props.cancelText ?? "Cancel", [props.cancelText])}
          </StyledButton>
        </ButtonDiv>
      </DialogueDiv>
    );
  })
);

export default ConfirmationDialogue;
