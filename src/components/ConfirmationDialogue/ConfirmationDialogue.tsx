import React, { useCallback, useMemo, useRef } from "react";
import { ForwardedRef, forwardRef } from "react";
import styled, { DefaultTheme, withTheme } from "styled-components";
import { StyledButton } from "..";

const DialogueDiv = styled.div`
  padding: 32px;
  color: ${(props) => props.theme.color.onSurface};
  background-color: ${(props) => props.theme.color.surface};
  border-radius: 15px;
`;

const ButtonsDiv = styled.div`
  display: flex;
  justify-content: flex-end;
`;

interface ConfirmationDialogueProps {
  closeCallback: () => void;
  title?: string;
  text?: string;
  acceptText?: string;
  cancelText?: string;

  acceptColor?: string;
  cancelColor?: string;

  onAccept?: () => void;
}

const ConfirmationDialogue = withTheme(
  forwardRef(function ConfirmationDialogue(
    props: ConfirmationDialogueProps & { theme: DefaultTheme },
    ref: ForwardedRef<HTMLDivElement>
  ) {
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    return (
      <DialogueDiv ref={ref}>
        <h1>{props.title}</h1>
        <br />
        <p>{props.text}</p>
        <br />
        <ButtonsDiv>
          <StyledButton
            className="active"
            ref={confirmButtonRef}
            color={props.acceptColor ?? props.theme.color.primary}
            onClick={useCallback(
              () => (props.onAccept ? props.onAccept() : {}),
              [props]
            )}
          >
            {useMemo(() => props.acceptText ?? "Accept", [props.acceptText])}
          </StyledButton>
          <StyledButton
            color={props.cancelColor ?? props.theme.color.secondary}
            onClick={useCallback(() => props.closeCallback(), [props])}
          >
            {useMemo(() => props.cancelText ?? "Cancel", [props.cancelText])}
          </StyledButton>
        </ButtonsDiv>
      </DialogueDiv>
    );
  })
);

export default ConfirmationDialogue;
