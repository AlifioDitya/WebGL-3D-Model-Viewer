import { useFindObjectInTree } from "@/lib/helper/findObjectInTree";
import { BasicMaterial } from "@/lib/material/BasicMaterial";
import { PhongMaterial } from "@/lib/material/PhongMaterial";
import { Mesh } from "@/lib/object/Mesh";
import { ObjectTreeNode } from "@/lib/object/ObjectTreeNode";
import { BlendingModeIcon, CaretSortIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useEffect, useState } from "react";
import { BasicShader } from "@/lib/shader/BasicShader";

interface MaterialComponentProps {
  selectedObjectUUID: string | null;
  sceneObjects: ObjectTreeNode[];
  updateObjectInState: (obj: ObjectTreeNode) => void;
}

export default function MaterialComponent({
  selectedObjectUUID,
  sceneObjects,
  updateObjectInState,
}: MaterialComponentProps): JSX.Element {
  const findObjectInTree = useFindObjectInTree();
  const [materialName, setMaterialName] = useState<"basic" | "phong">("basic");

  const handleChangeMaterial = (material: "basic" | "phong") => {
    if (!selectedObjectUUID) {
      return;
    }

    const obj = findObjectInTree(selectedObjectUUID, sceneObjects) as Mesh;
    if (obj) {
      if (material === "basic") {
        obj.material = new BasicMaterial();
        setMaterialName("basic");
      } else {
        obj.material = new PhongMaterial();
        setMaterialName("phong");
      }
    }
    updateObjectInState(obj);
  };

  useEffect(() => {
    const material =
      (findObjectInTree(selectedObjectUUID!, sceneObjects) as Mesh)?.material
        ._shader instanceof BasicShader
        ? "basic"
        : "phong";
    setMaterialName(material);
  }, [selectedObjectUUID, sceneObjects, findObjectInTree]);

  return (
    <div className="flex w-full flex-col gap-2 border-y border-y-zinc-700 px-3 pb-2.5 pt-2">
      <div className="flex items-center gap-2">
        <BlendingModeIcon className="mb-0.5 size-4 text-stone-100" />
        <p className="text-sm font-medium text-white">Material Shader</p>
      </div>

      {/* Material Shader Type */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex w-full items-center justify-between rounded-lg bg-zinc-700 px-3 py-1.5">
            <p className="text-xs text-stone-100">
              {materialName === "basic"
                ? "Basic"
                : materialName === "phong"
                  ? "Phong"
                  : "Unknown"}
            </p>
            <CaretSortIcon className="size-4 text-stone-100" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full border-zinc-900 bg-zinc-800 text-white">
          <DropdownMenuCheckboxItem
            checked={materialName === "basic" ? true : false}
            onClick={() => handleChangeMaterial("basic")}
            className="focus:bg-zinc-700 focus:text-white"
          >
            Basic
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={materialName === "phong" ? true : false}
            onClick={() => handleChangeMaterial("phong")}
            className="focus:bg-zinc-700 focus:text-white"
          >
            Phong
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
