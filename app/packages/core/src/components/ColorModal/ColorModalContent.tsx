import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import { TwitterPicker } from "react-color";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";

import * as fos from "@fiftyone/state";
import {
  BOOLEAN_FIELD,
  FLOAT_FIELD,
  getColor,
  INT_FIELD,
  STRING_FIELD,
} from "@fiftyone/utilities";
import ColorPalette from "./colorPalette/ColorPalette";
import AttributeColorSetting from "./colorPalette/AttributeColorSetting";
import Input from "../Common/Input";
import { colorBlindFriendlyPalette, tempColorSetting } from "./utils";
import { Divider } from "@mui/material";
import { cloneDeep } from "lodash";

const VALID_COLOR_ATTRIBUTE_TYPES = [BOOLEAN_FIELD, INT_FIELD, STRING_FIELD];

const ColorModalContent: React.FunctionComponent = () => {
  const field = useRecoilValue(fos.colorModal);
  const path = field?.path;
  const customizeColor = useRecoilValue(fos.customizeColors(path!));
  const [tempAttributeSetting, setTempAttributeSetting] =
    useRecoilState(tempColorSetting);
  const expandedPath = useRecoilValue(fos.expandPath(path!));
  const colorAttributeOptions = useRecoilValue(
    fos.fields({
      path: expandedPath,
      ftype: VALID_COLOR_ATTRIBUTE_TYPES,
    })
  )
    .filter((field) => field.dbField !== "tags")
    .map((field) => ({ value: field.path, label: field.name }));
  const opacityAttributeOptions = useRecoilValue(
    fos.fields({
      path: expandedPath,
      ftype: FLOAT_FIELD,
    })
  ).map((field) => ({ value: field.path, label: field.name }));

  const coloring = useRecoilValue(fos.coloring(false));
  const color = getColor(coloring.pool, coloring.seed, path ?? "");

  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [checkbox3, setCheckbox3] = useState(false);
  const [showFieldPicker, setShowFieldPicker] = useState(false);

  const handleDropdownChange = (
    event: React.ChangeEvent<{ name?: string; value: string }>
  ) => {
    setTempAttributeSetting((prev) => ({
      ...prev,
      attributeForColor: event.target.value,
    }));
  };
  const handleOpacityDropdownChange = (
    event: React.ChangeEvent<{ name?: string; value: string }>
  ) => {
    setTempAttributeSetting((prev) => ({
      ...prev,
      attributeForOpacity: event.target.value,
    }));
  };

  const getDefault = (key: string) => {
    if (key === "attributeForOpacity") return undefined;
    if (key === "colors") return [];
    if (key === "labelColors")
      return [
        {
          name: "",
          color:
            colorBlindFriendlyPalette[
              Math.floor(Math.random() * coloring.pool.length)
            ],
        },
      ];
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch (event.target.name) {
      case "attributeForOpacity":
        setCheckbox1(event.target.checked);
        break;
      case "colors":
        setCheckbox2(event.target.checked);
        break;
      case "labelColors":
        setCheckbox3(event.target.checked);
        break;
      default:
    }
    if (!event.target.checked) {
      setTempAttributeSetting((prev) => ({
        ...prev,
        [event.target.name]: getDefault(event.target.name),
      }));
    }
  };

  const hasDefaultColorPool = (colors: string[] | undefined) => {
    if (!colors || colors.length == 0) return true;
    if (colors.join("") === coloring.pool.join("")) return true;
    return false;
  };

  const hasDefaultLabelColor = (
    labelColors: { name: string; color: string }[] | undefined
  ) => {
    if (!labelColors || labelColors.length == 0) return true;
    if (labelColors.length == 1 && labelColors[0].name == "") return true;
    return false;
  };

  const initialColor =
    customizeColor?.fieldColor ?? tempAttributeSetting?.fieldColor ?? color;
  const [fieldColor, setFieldColor] = useState(initialColor);
  const onChangeFieldColor = (color) => {
    setFieldColor(color.hex);
    setTempAttributeSetting((prev) => ({
      ...cloneDeep(prev),
      field: path!,
      fieldColor: color.hex,
    }));
  };

  const colorContainer: React.RefObject<HTMLDivElement> = React.createRef();
  const toggleColorPicker = (e) => {
    if (e.target.id == "color-square") {
      setShowFieldPicker(!showFieldPicker);
    }
  };
  const hideFieldColorPicker = (e) => {
    if (
      e.target.id != "twitter-color-container" &&
      !e.target.id.includes("input")
    ) {
      setShowFieldPicker(false);
    }
  };

  // if customizeColor has settings about attribute for color field, tempFieldColor should copy the settings, otherwise, initialize the settings
  useEffect(() => {
    if (customizeColor?.attributeForColor) {
      setTempAttributeSetting(customizeColor);
      // update checkbox status based on exisiting settings
      setCheckbox1(!!customizeColor.attributeForOpacity);
      setCheckbox2(!hasDefaultColorPool(customizeColor.colors));
      setCheckbox3(!hasDefaultLabelColor(customizeColor.labelColors));
    } else {
      setTempAttributeSetting({
        field: path!,
        attributeForColor:
          colorAttributeOptions.find((x) => x.label === "label")?.value ??
          undefined,
        attributeForOpacity:
          opacityAttributeOptions.find((x) => x.label === "confidence")
            ?.value ?? undefined,
        colors: colorBlindFriendlyPalette,
        labelColors: [
          {
            name: "",
            color:
              colorBlindFriendlyPalette[
                Math.floor(Math.random() * coloring.pool.length)
              ],
          },
        ],
      });
    }
  }, []);

  if (!field || !path) return <div></div>;

  return (
    <div style={{ height: "calc( 80vh - 6rem)", overflow: "scroll" }}>
      <div style={{ margin: "1rem" }}>
        Color by field settings
        <div
          style={{
            margin: "1rem",
            display: "flex",
            flexDirection: "row",
            alignItems: "end",
          }}
        >
          <ColorSquare
            color={fieldColor}
            onClick={toggleColorPicker}
            id="color-square"
          >
            {showFieldPicker && (
              <PickerWrapper
                id="twitter-color-container"
                onBlur={hideFieldColorPicker}
                visible={showFieldPicker}
                tabIndex={0}
                ref={colorContainer}
              >
                <TwitterPicker
                  color={fieldColor}
                  colors={coloring.pool}
                  onChange={onChangeFieldColor}
                  id={"twitter-color-picker"}
                />
              </PickerWrapper>
            )}
          </ColorSquare>
          <Input
            value={fieldColor}
            setter={(v) => setFieldColor(v)}
            style={{
              width: 100,
              display: "inline-block",
              margin: 3,
            }}
          />
        </div>
        <Divider></Divider>
        Color by value mode
        <form
          style={{ display: "flex", flexDirection: "column", margin: "1rem" }}
        >
          {/* set the attribute used for color */}
          <FormControl key="color">
            <InputLabel key="dropdown-attribute">
              Select attribute for annotation color
            </InputLabel>
            <Select
              labelId="dropdown-attribute"
              key="select-attribute-dropdown"
              value={tempAttributeSetting?.attributeForColor ?? ""}
              onChange={handleDropdownChange}
              MenuProps={{ style: { zIndex: 9999999 } }}
              autoWidth
              required
            >
              {colorAttributeOptions.map((option, i) => {
                return (
                  <MenuItem value={option.value ?? ""} key={`color-${i}`}>
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          {/* set the attribute used for opacity */}
          <FormControlLabel
            key="attributeForOpacity"
            control={
              <Checkbox
                checked={checkbox1}
                onChange={handleCheckboxChange}
                name="attributeForOpacity"
                disabled={opacityAttributeOptions.length === 0}
              />
            }
            label="Set up object boxes opacity"
          />
          {checkbox1 && (
            <FormControl style={CHILD_STYLE} key="dropdown-opacity">
              <InputLabel key="dropdown-opacity-attribute">
                Select attribute for opacity
              </InputLabel>
              <Select
                labelId="dropdown-opacity-attribute"
                key="select-opacity-attribute-dropdown"
                value={tempAttributeSetting?.attributeForOpacity ?? ""}
                onChange={handleOpacityDropdownChange}
                MenuProps={{ style: { zIndex: 9999999 } }}
              >
                {opacityAttributeOptions.map((option, idx) => {
                  return (
                    <MenuItem
                      value={option.value ?? ""}
                      key={`opacity-option-${idx}`}
                    >
                      {option.label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}
          {/* set colors to use to replace the color pool*/}
          <FormControlLabel
            control={
              <Checkbox
                checked={checkbox2}
                onChange={handleCheckboxChange}
                name="colors"
              />
            }
            label="Overwrite color pool"
            key="colors"
          />
          {checkbox2 && <ColorPalette style={CHILD_STYLE} />}
          <FormControlLabel
            control={
              <Checkbox
                checked={checkbox3}
                onChange={handleCheckboxChange}
                name="labelColors"
              />
            }
            label="Assign specfic color to attribute value"
            key="labelColors"
          />
          {checkbox3 && <AttributeColorSetting style={CHILD_STYLE} />}
        </form>
      </div>
    </div>
  );
};

export default ColorModalContent;

const Text = styled.div`
  margin: 1rem;
`;

const ColorSquare = styled.div<{ color: string }>`
  position: relative;
  width: 40px;
  height: 40px;
  margin: 5px;
  cursor: pointer;
  background-color: ${(props) => props.color || "#ddd"};
  display: "inline-block";
`;

const PickerWrapper = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 60px;
  left: 0;
  z-index: 10001;
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
`;

const CHILD_STYLE = {
  marginLeft: "2rem",
  marginTop: "-0.25rem",
};
