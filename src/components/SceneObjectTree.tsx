import { Camera } from "@/lib/camera/Camera";
import { Mesh } from "@/lib/object/Mesh";
import { ObjectTreeNode } from "@/lib/object/ObjectTreeNode";
import {
  TriangleDownIcon,
  TriangleRightIcon,
  CubeIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import { GoDeviceCameraVideo, GoLightBulb } from "react-icons/go";
import { Light } from "@/lib/light/Light";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { RingGeometry } from "@/lib/geometry/RingGeometry";
import { BoxGeometry } from "@/lib/geometry/BoxGeometry";
import { PyramidGeometry } from "@/lib/geometry/PyramidGeometry";
import { useExpandedState } from "@/context/ExpandedStateContext";
import { parseGLTFFromFiles } from "@/lib/gltf/parseGLTF";
import { toast } from "react-toastify";
import { Dialog, DialogTrigger } from "./ui/dialog";
import ImportObjectDialog from "./ImportObjectDialog";
import { HiCubeTransparent } from "react-icons/hi2";
import { GiRing } from "react-icons/gi";
import exportGLTF from "@/lib/gltf/exportGLTF";
import { BiCapsule, BiPyramid } from "react-icons/bi";
import { SphereGeometry } from "@/lib/geometry/SphereGeometry";
import { PiSphere } from "react-icons/pi";
import { CapsuleGeometry } from "@/lib/geometry/CapsuleGeometry";
import { PhongMaterial } from "@/lib/material/PhongMaterial";

export default function SceneObjectTree({
  type,
  sceneObject,
  sceneObjects,
  level = 0,
  selectedObjectUUID,
  onSelect,
  onAddChild,
  onDelete,
  updateObjectInState,
}: {
  type: "scene" | "hollow";
  sceneObject: ObjectTreeNode;
  sceneObjects: ObjectTreeNode[];
  level?: number;
  selectedObjectUUID: string | null;
  onSelect: (objNode: string) => void;
  onAddChild: (objNode: ObjectTreeNode) => void;
  onDelete: () => void;
  updateObjectInState: (obj: ObjectTreeNode) => void;
}): JSX.Element {
  const { expandedNodes, toggleNode } = useExpandedState();
  const isExpanded = expandedNodes[sceneObject.uuid] ?? false;

  const handleSelect = () => {
    onSelect(sceneObject.uuid);
  };

  const handleContextMenuScene = () => {
    handleSelect();
  };

  const handleContextMenuHollow = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSelect();
  };

  const handleImportObject = (gltfFile: File, binFile: File) => {
    parseGLTFFromFiles(gltfFile, binFile)
      .then((nodes) => {
        if (nodes.length === 0) {
          throw new Error("No nodes found in the GLTF file.");
        }
        const object = nodes[0];

        const parent = sceneObject.parent;
        if (parent && parent.name !== "scene-root") {
          parent.remove(sceneObject);
          parent.add(object);
        } else {
          sceneObjects.splice(sceneObjects.indexOf(sceneObject), 1, object);
        }
        updateObjectInState(object);
      })
      .catch((error) => {
        const modelName = gltfFile.name.split(".");
        const modelNameWithoutExtension = modelName
          .splice(modelName.length, 1)
          .join(".");
        toast.error(`${modelNameWithoutExtension}: ${error.message}`);
      });
  };

  const handleExportObject = () => {
    try {
      exportGLTF(sceneObject);
      toast.success("Object exported successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddChildByImport = (gltfFile: File, binFile: File) => {
    parseGLTFFromFiles(gltfFile, binFile)
      .then((nodes) => {
        if (nodes.length === 0) {
          throw new Error("No nodes found in the GLTF file.");
        }
        const object = nodes[0];
        onAddChild(object);
      })
      .catch((error) => {
        const modelName = gltfFile.name.split(".");
        const modelNameWithoutExtension = modelName
          .splice(modelName.length, 1)
          .join(".");
        toast.error(`${modelNameWithoutExtension}: ${error.message}`);
      });
  };

  const getIcon = (obj: ObjectTreeNode) => {
    if (obj instanceof Light) {
      return <GoLightBulb className="-ml-px mr-px size-3.5 text-stone-100" />;
    }
    if (obj instanceof Mesh) {
      return <CubeIcon className="size-4 text-stone-100" />;
    }
    if (obj instanceof Camera) {
      return <GoDeviceCameraVideo className="size-3.5 text-stone-100" />;
    }
    return <CubeIcon className="size-4 text-stone-100" />;
  };

  const isLastLightSource = () => {
    if (!(sceneObject instanceof Light)) {
      return false;
    }

    const lights = sceneObjects.filter((obj) => obj instanceof Light);
    return lights.length === 1;
  };

  return (
    <div className="flex cursor-pointer flex-col">
      <ContextMenu>
        <ContextMenuTrigger
          onContextMenu={
            type === "scene" &&
            sceneObject.uuid !== "main-camera" &&
            !isLastLightSource()
              ? handleContextMenuScene
              : handleContextMenuHollow
          }
          className={`flex w-full items-center gap-1 px-1 py-0.5 focus:outline-none ${
            selectedObjectUUID === sceneObject.uuid ? "bg-blue-500/50" : ""
          }`}
          onClick={handleSelect}
        >
          <div
            style={{
              marginLeft:
                sceneObject.children.length > 0 && level > 0
                  ? level * 16
                  : level * 20,
            }}
            className="flex w-full items-center pl-1"
          >
            {sceneObject.children.length > 0 && (
              <button
                onClick={() => toggleNode(sceneObject.uuid)}
                className="focus:outline-none"
              >
                {isExpanded ? (
                  <TriangleDownIcon className="ml-[-4px] size-5 text-stone-500 transition-transform duration-200" />
                ) : (
                  <TriangleRightIcon className="ml-[-4px] size-5 text-stone-500 transition-transform duration-200" />
                )}
              </button>
            )}
            <div className="flex items-center gap-1.5">
              {getIcon(sceneObject)}
              <p className="mt-0.5 truncate text-left text-sm font-normal text-white">
                {sceneObject.name}
              </p>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="border-zinc-900 bg-zinc-800">
          {!(sceneObject instanceof Camera || sceneObject instanceof Light) && (
            <ContextMenuSub>
              <ContextMenuSubTrigger className="flex items-center gap-2 text-white focus:bg-zinc-700 focus:text-white data-[state=open]:bg-zinc-700 data-[state=open]:text-white">
                Add Child Object
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="ml-2 border-zinc-900 bg-zinc-800">
                <div className="flex flex-col gap-1 border-none bg-zinc-800">
                  <button
                    onClick={() => {
                      const newObject = new ObjectTreeNode();
                      newObject.name = "Empty";
                      onAddChild(newObject);
                    }}
                    className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                  >
                    <HiCubeTransparent className="size-3 text-stone-100" />
                    <p>Empty</p>
                  </button>
                  <button
                    onClick={() => {
                      const geometry = new RingGeometry();
                      const material = new PhongMaterial();
                      const newMesh = new Mesh(geometry, material);
                      newMesh.name = "Ring";
                      onAddChild(newMesh);
                    }}
                    className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                  >
                    <GiRing className="size-3" />
                    <p>Ring</p>
                  </button>
                  <button
                    onClick={() => {
                      const geometry = new BoxGeometry();
                      const material = new PhongMaterial();
                      const newMesh = new Mesh(geometry, material);
                      newMesh.name = "Cube";
                      onAddChild(newMesh);
                    }}
                    className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                  >
                    <CubeIcon className="size-3" />
                    <p>Cube</p>
                  </button>
                  <button
                    onClick={() => {
                      const geometry = new SphereGeometry();
                      const material = new PhongMaterial();
                      const newMesh = new Mesh(geometry, material);
                      newMesh.name = "Sphere";
                      onAddChild(newMesh);
                    }}
                    className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                  >
                    <PiSphere className="size-3" />
                    <p>Sphere</p>
                  </button>
                  <button
                    onClick={() => {
                      const geometry = new CapsuleGeometry();
                      const material = new PhongMaterial();
                      const newMesh = new Mesh(geometry, material);
                      newMesh.name = "Capsule";
                      onAddChild(newMesh);
                    }}
                    className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                  >
                    <BiCapsule className="size-3" />
                    <p>Capsule</p>
                  </button>
                  <button
                    onClick={() => {
                      const geometry = new PyramidGeometry();
                      const material = new PhongMaterial();
                      const newMesh = new Mesh(geometry, material);
                      newMesh.name = "Pyramid";
                      onAddChild(newMesh);
                    }}
                    className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                  >
                    <BiPyramid className="size-3" />
                    <p>Pyramid</p>
                  </button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300">
                        <DownloadIcon className="size-3" />
                        <p>Import Object</p>
                      </button>
                    </DialogTrigger>
                    <ImportObjectDialog onSubmit={handleAddChildByImport} />
                  </Dialog>
                </div>
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
          {!(sceneObject instanceof Camera || sceneObject instanceof Light) && (
            <>
              <ContextMenuItem
                onClick={handleExportObject}
                className="text-white focus:bg-zinc-700 focus:text-white"
              >
                Export
              </ContextMenuItem>
              <Dialog>
                <DialogTrigger className="flex w-full rounded bg-transparent p-2 text-sm text-white hover:bg-zinc-700 focus:text-white">
                  Import
                </DialogTrigger>
                <ImportObjectDialog onSubmit={handleImportObject} />
              </Dialog>
            </>
          )}
          {sceneObject.uuid !== "main-camera" && (
            <ContextMenuItem
              onClick={onDelete}
              className="font-medium text-red-500 focus:bg-zinc-700 focus:text-red-500"
            >
              Delete
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
      {isExpanded &&
        sceneObject.children.map((child) => (
          <SceneObjectTree
            type={type}
            key={child.uuid}
            sceneObject={child}
            sceneObjects={sceneObjects}
            level={level + 1}
            selectedObjectUUID={selectedObjectUUID}
            onSelect={onSelect}
            onAddChild={onAddChild}
            onDelete={onDelete}
            updateObjectInState={updateObjectInState}
          />
        ))}
    </div>
  );
}
