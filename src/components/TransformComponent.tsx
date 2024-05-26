import { ObjectTreeNode } from "@/lib/object/ObjectTreeNode";
import { Camera } from "@/lib/camera/Camera";
import {
  Link1Icon,
  LinkNone1Icon,
  MoveIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { useFindObjectInTree } from "@/lib/helper/findObjectInTree";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Light } from "@/lib/light/Light";
import { MathUtils } from "@/lib/math/MathUtils";
import { Vector3 } from "@/lib/math/Vector3";
import { toast } from "react-toastify";

interface TransformComponentProps {
  sceneObjects: ObjectTreeNode[];
  selectedObjectUUID: string | null;
  setSelectedObjectUUID: (id: string) => void;
  updateObjectInState: (obj: ObjectTreeNode) => void;
}

export default function TransformComponent({
  sceneObjects,
  selectedObjectUUID,
  setSelectedObjectUUID,
  updateObjectInState,
}: TransformComponentProps): JSX.Element {
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const [activeAxis, setActiveAxis] = useState<"x" | "y" | "z">("x");
  const [activeType, setActiveType] = useState<
    "position" | "rotation" | "scale"
  >("position");
  const [lockAspectRatio, setLockAspectRatio] = useState(false);
  const [initialRatios, setInitialRatios] = useState({ x: 1, y: 1, z: 1 });
  const findObjectInTree = useFindObjectInTree();

  useEffect(() => {
    if (selectedObjectUUID && lockAspectRatio) {
      const obj = findObjectInTree(selectedObjectUUID, sceneObjects);
      if (obj) {
        const x = obj.getProperty("x", "scale") || 1;
        const y = obj.getProperty("y", "scale") || 1;
        const z = obj.getProperty("z", "scale") || 1;
        setInitialRatios({ x, y, z });
      }
    }
  }, [selectedObjectUUID, lockAspectRatio, sceneObjects, findObjectInTree]);

  const startDrag = (
    e: React.MouseEvent,
    axis: "x" | "y" | "z",
    type: "position" | "rotation" | "scale",
  ) => {
    setDragging(true);
    setStartX(e.clientX);
    setActiveAxis(axis);
    setActiveType(type);
    const selectedObject = sceneObjects.find(
      (obj) => obj.uuid === selectedObjectUUID,
    );
    const initialVal = selectedObject?.getProperty(axis, type);
    setStartValue(initialVal || 0);
    e.preventDefault();
  };

  const onDrag = (e: React.MouseEvent) => {
    if (dragging && selectedObjectUUID) {
      const diff = (e.clientX - startX) * 0.1;
      const newValue = startValue + diff;
      handleValueChange(activeAxis, activeType, newValue.toString());
    }
  };

  const endDrag = () => {
    setDragging(false);
  };

  // Function to update position, rotation, or scale based on input
  const handleValueChange = (
    axis: "x" | "y" | "z",
    type: "position" | "rotation" | "scale",
    value: string,
  ) => {
    if (value === "") {
      value = "0";
    }

    if (selectedObjectUUID) {
      const obj = findObjectInTree(selectedObjectUUID, sceneObjects);
      if (obj) {
        const newValue = parseFloat(value);
        if (type === "scale" && lockAspectRatio) {
          const { x, y, z } = initialRatios;
          if (axis === "x") {
            obj.setProperty("x", type, newValue);
            obj.setProperty("y", type, (newValue / x) * y);
            obj.setProperty("z", type, (newValue / x) * z);
          } else if (axis === "y") {
            obj.setProperty("x", type, (newValue / y) * x);
            obj.setProperty("y", type, newValue);
            obj.setProperty("z", type, (newValue / y) * z);
          } else if (axis === "z") {
            obj.setProperty("x", type, (newValue / z) * x);
            obj.setProperty("y", type, (newValue / z) * y);
            obj.setProperty("z", type, newValue);
          }
        } else if (type === "rotation") {
          obj.setProperty(axis, type, MathUtils.DEGTORAD * newValue);
        } else {
          obj.setProperty(axis, type, newValue);
        }
        updateObjectInState(obj);
        setSelectedObjectUUID(obj.uuid);
      }
    }
  };

  function getValue(axis: string, type: string, defaultValue = 0) {
    const object = findObjectInTree(selectedObjectUUID!, sceneObjects);

    if (!object) {
      toast.error("Object not found");
      return defaultValue;
    }

    return (
      object.getProperty(
        axis as "x" | "y" | "z",
        type as "position" | "rotation" | "scale",
      ) || 0
    );
  }

  return (
    <div
      className="flex w-full flex-col gap-2 border-y border-y-zinc-700 p-2 px-3"
      onMouseMove={dragging ? onDrag : undefined}
      onMouseUp={endDrag}
    >
      {/* Component Name */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MoveIcon className="mb-0.5 size-4 text-stone-100" />
          <p className="text-sm font-medium text-white">Transform</p>
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={10}>
            <TooltipTrigger
              onClick={() => {
                if (!selectedObjectUUID) {
                  return;
                }
                const obj = findObjectInTree(selectedObjectUUID, sceneObjects);
                if (obj) {
                  obj.position = new Vector3(0, 0, 0);
                  if (obj instanceof Camera) {
                    obj.position = new Vector3(0, 0, 10);
                  }
                  obj.rotation.set(0, 0, 0);
                  obj.scale.set(1, 1, 1);
                  updateObjectInState(obj);
                }
              }}
            >
              <ReloadIcon className="size-3 text-stone-100" />
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="rounded-md bg-zinc-700 p-2 text-white"
            >
              Reset Transform
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Position, Rotation, Scale */}
      {["position", "rotation"].map((type) => (
        <div
          key={type}
          className="flex w-full items-center justify-between gap-4"
        >
          <p className="text-sm font-normal text-white">
            {type[0].toUpperCase() + type.slice(1)}
          </p>
          <div className="flex items-center gap-2">
            {["x", "y", "z"].map((axis) => (
              <div key={axis} className="flex items-center gap-2">
                <label
                  htmlFor={`${type}-${axis}`}
                  className="text-sm font-normal text-white"
                  style={{ cursor: "ew-resize" }}
                  onMouseDown={(e) =>
                    startDrag(
                      e,
                      axis as "x" | "y" | "z",
                      type as "position" | "rotation" | "scale",
                    )
                  }
                >
                  {axis.toUpperCase()}
                </label>
                <Input
                  type="number"
                  id={`${type}-${axis}`}
                  value={
                    type === "rotation"
                      ? MathUtils.RADTODEG * getValue(axis, type)
                      : getValue(axis, type)
                  }
                  className="h-6 w-12 border-none bg-zinc-800 text-left text-white"
                  onChange={(e) =>
                    handleValueChange(
                      axis as "x" | "y" | "z",
                      type as "position" | "rotation" | "scale",
                      e.target.value,
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {!selectedObjectUUID ||
      !(
        findObjectInTree(selectedObjectUUID, sceneObjects) instanceof Camera ||
        findObjectInTree(selectedObjectUUID, sceneObjects) instanceof Light
      ) ? (
        <div className="flex w-full items-center justify-between gap-4">
          <p className="text-sm font-normal text-white">Scale</p>
          <div className="flex items-center gap-2">
            <button
              className="mb-[1.5px] mr-0.5"
              onClick={() => setLockAspectRatio((prev) => !prev)}
              title={
                lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"
              }
            >
              {!lockAspectRatio ? (
                <LinkNone1Icon className="size-3 text-stone-100" />
              ) : (
                <Link1Icon className="size-3 text-stone-100" />
              )}
            </button>
            {["x", "y", "z"].map((axis) => (
              <div key={axis} className="flex items-center gap-2">
                <label
                  htmlFor={`scale-${axis}`}
                  className="text-sm font-normal text-white"
                  style={{ cursor: "ew-resize" }}
                  onMouseDown={(e) =>
                    startDrag(e, axis as "x" | "y" | "z", "scale")
                  }
                >
                  {axis.toUpperCase()}
                </label>
                <Input
                  type="number"
                  id={`scale-${axis}`}
                  value={getValue(axis, "scale", 1)}
                  className="h-6 w-12 border-none bg-zinc-800 text-left text-white"
                  onChange={(e) =>
                    handleValueChange(
                      axis as "x" | "y" | "z",
                      "scale",
                      e.target.value,
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
