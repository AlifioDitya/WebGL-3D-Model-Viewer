import { useEffect, useState } from "react";
import { useFindObjectInTree } from "@/lib/helper/findObjectInTree";
import { Light, LightType } from "@/lib/light/Light";
import { ObjectTreeNode } from "@/lib/object/ObjectTreeNode";
import { CaretSortIcon, ShadowIcon } from "@radix-ui/react-icons";
import { Color } from "@/lib/light/Color";
import { PopoverPicker } from "./PopoverPicker";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LightComponentProps {
  selectedObjectUUID: string | null;
  sceneObjects: ObjectTreeNode[];
  updateObjectInState: (obj: ObjectTreeNode) => void; // Add this to update the light color in state
}

export default function LightComponent({
  selectedObjectUUID,
  sceneObjects,
  updateObjectInState,
}: LightComponentProps): JSX.Element {
  const [color, setColor] = useState<Color>(new Color(255, 255, 255, 1));
  const [intensity, setIntensity] = useState<number>(1);
  const findObjectInTree = useFindObjectInTree();

  useEffect(() => {
    if (selectedObjectUUID) {
      const selectedLight = findObjectInTree(
        selectedObjectUUID,
        sceneObjects,
      ) as Light;
      if (selectedLight) {
        setColor(
          new Color(
            selectedLight.color.r,
            selectedLight.color.g,
            selectedLight.color.b,
            selectedLight.color.a,
          ),
        );
        setIntensity(selectedLight.intensity);
      }
    }
  }, [selectedObjectUUID, sceneObjects, findObjectInTree]);

  const handleColorChange = (newColor: Color) => {
    setColor(newColor);
    if (selectedObjectUUID) {
      const selectedLight = findObjectInTree(
        selectedObjectUUID,
        sceneObjects,
      ) as Light;
      if (selectedLight) {
        selectedLight.color.set(newColor.r, newColor.g, newColor.b, newColor.a);
        updateObjectInState(selectedLight);
      }
    }
  };

  const handleIntensityChange = (newIntensity: number | number[]) => {
    if (typeof newIntensity === "number") {
      setIntensity(newIntensity);
      if (selectedObjectUUID) {
        const selectedLight = findObjectInTree(
          selectedObjectUUID,
          sceneObjects,
        ) as Light;
        if (selectedLight) {
          selectedLight.intensity = newIntensity;
          updateObjectInState(selectedLight);
        }
      }
    }
  };

  return (
    <div className="relative flex w-full flex-col gap-2 border-y border-y-zinc-700 px-3 pb-2.5 pt-2">
      <div className="flex items-center gap-2">
        <ShadowIcon className="mb-0.5 size-4 text-stone-100" />
        <p className="text-sm font-medium text-white">Light</p>
      </div>
      {/* Light Type */}
      <div className="flex w-full items-center gap-[52px]">
        <p className="text-sm text-stone-100">Type</p>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex w-full items-center justify-between rounded-md bg-zinc-700 px-3 py-1 focus:border-none">
              <p className="text-xs text-stone-100">
                {(findObjectInTree(selectedObjectUUID!, sceneObjects) as Light)
                  ?.type === LightType.Directional
                  ? "Directional"
                  : "Point"}
              </p>
              <CaretSortIcon className="size-4 text-stone-100" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full border-zinc-900 bg-zinc-800 text-white">
            <DropdownMenuCheckboxItem
              checked={
                (findObjectInTree(selectedObjectUUID!, sceneObjects) as Light)
                  ?.type === LightType.Directional
              }
              onClick={() => {
                if (selectedObjectUUID) {
                  const obj = findObjectInTree(
                    selectedObjectUUID,
                    sceneObjects,
                  ) as Light;
                  obj.type = LightType.Directional;
                  updateObjectInState(obj);
                }
              }}
              className="focus:bg-zinc-700 focus:text-white"
            >
              Directional
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={
                (findObjectInTree(selectedObjectUUID!, sceneObjects) as Light)
                  ?.type === LightType.Point
              }
              onClick={() => {
                if (selectedObjectUUID) {
                  const obj = findObjectInTree(
                    selectedObjectUUID,
                    sceneObjects,
                  ) as Light;
                  obj.type = LightType.Point;
                  updateObjectInState(obj);
                }
              }}
              className="focus:bg-zinc-700 focus:text-white"
            >
              Point
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Light Color */}
      <div className="flex items-center gap-12">
        <p className="text-sm text-stone-100">Color</p>
        <PopoverPicker color={color} onChange={handleColorChange} />
      </div>

      {/* Light Intensity */}
      <div className="flex items-center gap-7">
        <p className="text-sm text-stone-100">Intensity</p>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={intensity}
          onChange={handleIntensityChange}
          styles={{
            track: { backgroundColor: "#6B7280" },
            rail: { backgroundColor: "#374151" },
            handle: { backgroundColor: "#D1D5DB" },
          }}
        />
      </div>
    </div>
  );
}
