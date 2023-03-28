import React, { Fragment, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import * as fos from "@fiftyone/state";

import Draggable from "react-draggable";

import ReactDOM from "react-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import ColorModalContent from "./ColorModalContent";
import { Button } from "../utils";

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  align-items: center;
  display: flex;
  justify-content: center;
  background-color: ${({ theme }) => theme.neutral.softBg};
`;

const Container = styled.div`
  background-color: ${({ theme }) => theme.background.level2};
  border: 1px solid ${({ theme }) => theme.primary.plainBorder};
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: start;
  overflow: hidden;
  box-shadow: 0 20px 25px -20px #000;
`;

const DraggableModalTitle = styled.div`
  flex-direction: row;
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 2.5rem;
  background-color: ${({ theme }) => theme.background.level1};
  padding: 2px;
  cursor: pointer;
  fontstyle: bold;
`;

const ModalActionButtonContainer = styled.div`
  align-self: flex-end;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 0.5rem;
`;

const BUTTON_STYLE: React.CSSProperties = {
  margin: "0.5rem 0",
  height: "2rem",
  width: "6rem",
  flex: 1,
  textAlign: "center",
};

const SubmitControls = () => {
  const [activeColorModalField, setActiveColorModalField] = useRecoilState(
    fos.colorModal
  );
  const onCancel = () => {
    // TODO: clear the temporary color settings
    setActiveColorModalField(null);
  };
  const onSave = () => {
    setActiveColorModalField(null);
  };
  return (
    <ModalActionButtonContainer>
      <Button
        text={"Save"}
        title={`Save`}
        onClick={onSave}
        style={BUTTON_STYLE}
      />
    </ModalActionButtonContainer>
  );
};

const ColorModal = () => {
  const field = useRecoilValue(fos.colorModal);
  const colorBy = useRecoilValue(fos.coloring(false)).by;
  const longSetting = Boolean(field?.embeddedDocType && colorBy === "value");

  const screen = {
    minWidth: longSetting ? "500px" : "350px",
    width: longSetting ? "50vw" : "30vw",
    height: longSetting ? "80vh" : "350px",
  };
  const wrapperRef = useRef<HTMLDivElement>(null);
  const targetContainer = document.getElementById("colorModal");
  const [activeColorModalField, setActiveColorModalField] = useRecoilState(
    fos.colorModal
  );

  if (targetContainer) {
    return ReactDOM.createPortal(
      <Fragment>
        <ModalWrapper
          ref={wrapperRef}
          onClick={(event) => event.target === wrapperRef.current}
          aria-labelledby="draggable-color-modal"
        >
          <Draggable bounds="parent" handle=".draggable-colorModal-handle">
            <Container style={{ ...screen, zIndex: 2 }}>
              <DraggableModalTitle className="draggable-colorModal-handle">
                <div>
                  {activeColorModalField?.name?.toUpperCase() ?? ""} (
                  {activeColorModalField?.embeddedDocType?.split(".").slice(-1)}
                  )
                </div>
                <CloseIcon onClick={() => setActiveColorModalField(null)} />
              </DraggableModalTitle>
              <ColorModalContent />
              <SubmitControls />
            </Container>
          </Draggable>
        </ModalWrapper>
      </Fragment>,
      targetContainer
    );
  } else {
    console.error("target container not found");
    return <></>;
  }
};

export default React.memo(ColorModal);
