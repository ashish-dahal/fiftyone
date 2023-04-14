import React, { useRef, useState } from "react";
import styled from "styled-components";
import DeleteIcon from "@material-ui/icons/Delete";
import { ChromePicker } from "react-color";
import Input from "../../Common/Input";
import * as fos from "@fiftyone/state";
import { useRecoilState, useRecoilValue } from "recoil";
import { tempColorSetting } from "../utils";
import { cloneDeep } from "lodash";
import { Button } from "../../utils";

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  column-count: 2;
`;

const AddContainer = styled.div`
  display: flex;
  justify-content: start;
  alight-items: center;
  margin-bottom: 0.5rem;
`;

const DeleteButton = styled(DeleteIcon)`
  cursor: pointer;
`;

const ColorSquare = styled.div<{ color: string }>`
  position: relative;
  width: 30px;
  height: 30px;
  margin-left: 1rem;
  margin-right: 0.5rem;
  cursor: pointer;
  background-color: ${(props) => props.color || "#ddd"};
`;

const ChromePickerWrapper = styled.div`
  position: absolute;
  top: 60px;
  left: 0;
  z-index: 10001;
`;

type ColorPickerRowProps = {
  style?: React.CSSProperties;
};

const AttributeColorSetting: React.FC<ColorPickerRowProps> = ({ style }) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const coloring = useRecoilValue(fos.coloring(false));
  const defaultValue = {
    name: "",
    color: coloring.pool[Math.floor(Math.random() * coloring.pool.length)],
  };
  const [tempColor, setTempColor] = useRecoilState(tempColorSetting);
  const values = tempColor.labelColors;

  const [showPicker, setShowPicker] = useState(
    Array(values?.length ?? 0).fill(false)
  );

  const handleAdd = () => {
    setTempColor((prev) => ({
      ...cloneDeep(prev),
      labelColors: prev.labelColors
        ? [...cloneDeep(prev.labelColors), defaultValue]
        : [defaultValue],
    }));
    setShowPicker([...showPicker, false]);
  };

  const handleDelete = (index: number) => {
    const newValues = values ? [...cloneDeep(values)] : [];
    newValues.splice(index, 1);
    setTempColor((prev) => ({ ...cloneDeep(prev), labelColors: newValues }));
  };

  const hanldeColorChange = (color: any, index: number) => {
    const newColor = color?.hex;
    setShowPicker((prev) => prev.map((_, i) => (i === index ? false : _)));
    setTempColor((p) => {
      const prev = cloneDeep(p);
      const newValues = prev.labelColors ? [...prev.labelColors] : [];
      newValues[index].color = newColor;
      return { ...cloneDeep(prev), labelColors: newValues };
    });
  };

  if (!values) return null;

  const handleChange = (
    index: number,
    key: "name" | "color",
    value: string
  ) => {
    const newValues = cloneDeep(values);
    newValues[index][key] = value;
    setTempColor((prev) => ({ ...cloneDeep(prev), labelColors: newValues }));
  };

  return (
    <div style={style}>
      {values.map((value, index) => (
        <RowContainer key={index}>
          <Input
            placeholder="Value (e.g. 'car')"
            value={value.name ?? ""}
            setter={(v) => handleChange(index, "name", v)}
            style={{ width: "8rem" }}
          />
          :
          <ColorSquare
            key={index}
            color={value.color}
            onClick={() => {
              setShowPicker((prev) =>
                prev.map((_, i) => (i === index ? !prev[index] : _))
              );
            }}
          >
            {showPicker[index] && (
              <ChromePickerWrapper>
                <ChromePicker
                  color={value.color}
                  onChangeComplete={(color) => hanldeColorChange(color, index)}
                  popperProps={{ positionFixed: true }}
                  ref={pickerRef}
                  disableAlpha={true}
                  onBlur={() =>
                    setShowPicker((prev) =>
                      prev.map((_, i) => (i === index ? false : _))
                    )
                  }
                />
              </ChromePickerWrapper>
            )}
          </ColorSquare>
          <Input
            value={value.color ?? ""}
            setter={(v) => handleChange(index, "color", v)}
            style={{ width: "5rem" }}
          />
          <DeleteButton
            onClick={() => {
              handleDelete(index);
            }}
          />
        </RowContainer>
      ))}
      <AddContainer>
        <Button
          onClick={handleAdd}
          text="Add a new pair"
          title="add a new pair"
        />
      </AddContainer>
    </div>
  );
};

export default AttributeColorSetting;
