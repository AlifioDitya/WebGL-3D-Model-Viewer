import {
  ComponentPlaceholderIcon,
  CubeIcon,
  DotsVerticalIcon,
  DownloadIcon,
  LayersIcon,
  PlusIcon,
  TokensIcon,
} from "@radix-ui/react-icons";
import { GiCubeforce, GiDinosaurBones, GiRing } from "react-icons/gi";
import { HiCubeTransparent } from "react-icons/hi2";
import { VscTrash } from "react-icons/vsc";
import { ImOmega } from "react-icons/im";
import SceneObjectTree from "@/components/SceneObjectTree";
import { ObjectTreeNode } from "@/lib/object/ObjectTreeNode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mesh } from "@/lib/object/Mesh";
import { useState } from "react";
import { GoDeviceCameraVideo } from "react-icons/go";
import { FaPerson, FaPersonFalling } from "react-icons/fa6";
import { SiBmw, SiBugatti, SiLamborghini, SiPorsche } from "react-icons/si";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MdOutlineTipsAndUpdates } from "react-icons/md";
import { useFindObjectInTree } from "@/lib/helper/findObjectInTree";
import { RingGeometry } from "@/lib/geometry/RingGeometry";
import { BoxGeometry } from "@/lib/geometry/BoxGeometry";
import { PyramidGeometry } from "@/lib/geometry/PyramidGeometry";
import { toast } from "react-toastify";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ImportObjectDialog from "@/components/ImportObjectDialog";
import { parseGLTFFromFiles, parseGLTFFromPath } from "@/lib/gltf/parseGLTF";
import { PerspectiveCamera } from "@/lib/camera/PerspectiveCamera";
import { BiCapsule, BiPyramid } from "react-icons/bi";
import { SphereGeometry } from "@/lib/geometry/SphereGeometry";
import { PiSphere } from "react-icons/pi";
import { TbBrandAmongUs } from "react-icons/tb";
import { CapsuleGeometry } from "@/lib/geometry/CapsuleGeometry";
import IronManLogo from "@/assets/IronManLogo.svg";
import BatmanLogo from "@/assets/BatmanLogo.svg";
import GoTLogo from "@/assets/GoTLogo.png";
import ACLogo from "@/assets/ACLogo.png";
import TheWitcherLogo from "@/assets/TheWitcherLogo.png";
import { Light } from "@/lib/light/Light";
import { PhongMaterial } from "@/lib/material/PhongMaterial";

interface SceneObjectTreeProps {
  tab: "scene" | "hollow";
  setTab: (tab: "scene" | "hollow") => void;
  selectedObjectUUID: string | null;
  setSelectedObjectUUID: (id: string | null) => void;
  sceneObjects: ObjectTreeNode[];
  setSceneObjects: (objects: ObjectTreeNode[]) => void;
  hollowObjects: ObjectTreeNode[];
  updateObjectInState: (obj: ObjectTreeNode) => void;
}

export default function ObjectTreePanel({
  tab,
  setTab,
  selectedObjectUUID,
  setSelectedObjectUUID,
  sceneObjects,
  setSceneObjects,
  hollowObjects,
  updateObjectInState,
}: SceneObjectTreeProps): JSX.Element {
  const [openAddObjectDropdown, setOpenAddObjectDropdown] = useState(false);
  const findObjectInTree = useFindObjectInTree();

  const onAddChild = (newNode: ObjectTreeNode) => {
    if (selectedObjectUUID) {
      const parentObject = findObjectInTree(selectedObjectUUID, sceneObjects);
      if (parentObject) {
        parentObject.add(newNode);
        newNode.parent = parentObject;
        updateObjectInState(parentObject);
        setSelectedObjectUUID(newNode.uuid);
      }
    } else {
      sceneObjects.push(newNode);
      updateObjectInState(newNode);
      setSelectedObjectUUID(newNode.uuid);
    }
  };

  const onDelete = () => {
    if (selectedObjectUUID) {
      const selectedObject = findObjectInTree(selectedObjectUUID, sceneObjects);
      if (selectedObject) {
        if (
          selectedObject.parent &&
          selectedObject.parent.name !== "scene-root"
        ) {
          selectedObject.parent.remove(selectedObject);
          updateObjectInState(selectedObject.parent);
          selectedObject.parent = null;
        } else {
          const index = sceneObjects.indexOf(selectedObject);
          if (index !== -1) {
            sceneObjects.splice(index, 1);
            updateObjectInState(selectedObject);
          }
        }
        setSelectedObjectUUID(null);
      }
    }
  };

  // Import object from file
  const onAddByImport = (gltfFile: File, binFile: File) => {
    parseGLTFFromFiles(gltfFile, binFile)
      .then((nodes) => {
        if (nodes.length === 0) {
          throw new Error("No nodes found in the GLTF file.");
        }
        const object = nodes[0];
        sceneObjects.push(object);
        updateObjectInState(object);
        setSelectedObjectUUID(object.uuid);
      })
      .catch((error) => {
        const modelName = gltfFile.name.split(".");
        const modelNameWithoutExtension = modelName
          .splice(modelName.length, 1)
          .join(".");
        toast.error(`${modelNameWithoutExtension}: ${error.message}`);
      });
  };

  const onAddByPath = (gltfPath: string, binPath: string) => {
    parseGLTFFromPath(gltfPath, binPath)
      .then((nodes) => {
        if (nodes.length === 0) {
          throw new Error("No nodes found in the GLTF file.");
        }
        console.log("Imported nodes: ", nodes);
        const object = nodes[0];
        sceneObjects.push(object);
        updateObjectInState(object);
        setSelectedObjectUUID(object.uuid);
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const isSecondaryCameraPresent = () => {
    // Search for the secondary camera
    const secondaryCamera = findObjectInTree("secondary-camera", sceneObjects);
    if (secondaryCamera) {
      return false;
    } else {
      return true;
    }
  };

  return (
    <div className="flex h-full w-1/5 min-w-[23%] flex-col border-r border-r-zinc-800 bg-zinc-800/70">
      {/* Tabs */}
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <button
            className={`flex items-center gap-1 border-t ${tab === "scene" ? "border-blue-500" : "border-zinc-800"}  bg-zinc-800/50 px-3 py-1`}
            onClick={() => {
              setTab("scene");
              selectedObjectUUID && setSelectedObjectUUID(null);
            }}
          >
            <TokensIcon className="mb-0.5 size-3 text-white" />
            <p className="truncate text-sm font-normal text-white">Scene</p>
          </button>
          <button
            className={`flex items-center gap-1 border-t ${tab === "hollow" ? "border-blue-500" : "border-zinc-800"}  bg-zinc-800/50 px-3 py-1`}
            onClick={() => {
              setTab("hollow");
              selectedObjectUUID && setSelectedObjectUUID(null);
            }}
          >
            <ComponentPlaceholderIcon className="mb-0.5 size-3 text-white" />
            <p className="truncate text-sm font-normal text-white">
              Hollow Object
            </p>
          </button>
        </div>
        <div className="mr-2.5 flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button>
                <DotsVerticalIcon className="size-3 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              alignOffset={-2}
              className="border-none bg-zinc-800"
            >
              <div
                onClick={() => {
                  // Clear all objects except light and camera
                  const newSceneObjects = sceneObjects.filter(
                    (obj) => obj.uuid === "main-camera" || obj instanceof Light,
                  );

                  setSceneObjects(newSceneObjects);
                }}
                className="flex flex-col gap-1 border-none bg-zinc-800"
              >
                <button className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300">
                  <VscTrash className="size-3 text-red-500" />
                  <p className="text-red-500">Clear Scene</p>
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Scene Name */}
      {tab === "scene" ? (
        <div className="flex w-full items-center justify-between bg-zinc-800 px-2 py-1">
          <div className="flex items-center gap-1.5">
            <LayersIcon className="size-4 text-stone-100" />
            <p className="mt-0.5 text-sm font-medium text-white">
              Scene Objects
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Add Articulated Model to Scene */}
            <DropdownMenu
              open={openAddObjectDropdown}
              onOpenChange={(open) => setOpenAddObjectDropdown(open)}
            >
              <TooltipProvider>
                <Tooltip delayDuration={10}>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button>
                        <PlusIcon className="size-4 text-stone-100" />
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-700">
                    <p>Add Object to Current Scene</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent
                align="start"
                alignOffset={-2}
                className="border-none bg-zinc-800"
              >
                <div className="flex flex-col gap-1 border-none bg-zinc-800">
                  <button
                    onClick={() => {
                      const newObject = new ObjectTreeNode();
                      newObject.name = "Empty";
                      sceneObjects.push(newObject);
                      updateObjectInState(newObject);
                      setSelectedObjectUUID(newObject.uuid);
                      setOpenAddObjectDropdown(false);
                    }}
                    className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                  >
                    <HiCubeTransparent className="size-3 text-stone-100" />
                    <p>Empty</p>
                  </button>
                  {isSecondaryCameraPresent() && (
                    <>
                      <DropdownMenuSeparator className="my-0 h-[0.5px] bg-zinc-600" />
                      <button
                        onClick={() => {
                          const newCamera = new PerspectiveCamera(
                            30,
                            800 / 600, // Important: Fixed aspect ratio
                            0.1,
                            100,
                          );
                          newCamera.name = "Secondary Camera";
                          newCamera.uuid = "secondary-camera";
                          newCamera.position.set(0, 0, 10);
                          sceneObjects.push(newCamera);
                          updateObjectInState(newCamera);
                          setSelectedObjectUUID(newCamera.uuid);
                          setOpenAddObjectDropdown(false);
                        }}
                        className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                      >
                        <GoDeviceCameraVideo className="size-3" />
                        <p>Camera</p>
                      </button>
                    </>
                  )}
                  {/* <DropdownMenuSeparator className="my-0 h-[0.5px] bg-zinc-600" />
                  <button
                    onClick={() => {
                      const newLight = new Light();
                      newLight.name = "Light";
                      newLight.color = new Color(1, 1, 1);
                      sceneObjects.push(newLight);
                      updateObjectInState(newLight);
                      setSelectedObjectUUID(newLight.uuid);
                      setOpenAddObjectDropdown(false);
                    }}
                    className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                  >
                    <GoLightBulb className="size-3" />
                    <p>Light Source</p>
                  </button> */}
                  <DropdownMenuSeparator className="my-0 h-[0.5px] bg-zinc-600" />
                  <button
                    onClick={() => {
                      const geometry = new BoxGeometry();
                      const material = new PhongMaterial();
                      const newMesh = new Mesh(geometry, material);
                      newMesh.name = "Cube";
                      sceneObjects.push(newMesh);
                      updateObjectInState(newMesh);
                      setSelectedObjectUUID(newMesh.uuid);
                      setOpenAddObjectDropdown(false);
                    }}
                    className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                  >
                    <CubeIcon className="size-3" />
                    <p>Cube</p>
                  </button>
                  <DropdownMenuSeparator className="my-0 h-[0.5px] bg-zinc-600" />
                  <button
                    onClick={() => {
                      const geometry = new RingGeometry();
                      const material = new PhongMaterial();
                      const newMesh = new Mesh(geometry, material);
                      newMesh.name = "Ring";
                      sceneObjects.push(newMesh);
                      updateObjectInState(newMesh);
                      setSelectedObjectUUID(newMesh.uuid);
                      setOpenAddObjectDropdown(false);
                    }}
                    className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                  >
                    <GiRing className="size-3" />
                    <p>Ring</p>
                  </button>
                  <DropdownMenuSeparator className="my-0 h-[0.5px] bg-zinc-600" />
                  <button
                    onClick={() => {
                      const geometry = new SphereGeometry();
                      const material = new PhongMaterial();
                      const newMesh = new Mesh(geometry, material);
                      newMesh.name = "Sphere";
                      sceneObjects.push(newMesh);
                      updateObjectInState(newMesh);
                      setSelectedObjectUUID(newMesh.uuid);
                      setOpenAddObjectDropdown(false);
                    }}
                    className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                  >
                    <PiSphere className="size-3" />
                    <p>Sphere</p>
                  </button>
                  <DropdownMenuSeparator className="my-0 h-[0.5px] bg-zinc-600" />
                  <button
                    onClick={() => {
                      const geometry = new CapsuleGeometry();
                      const material = new PhongMaterial();
                      const newMesh = new Mesh(geometry, material);
                      newMesh.name = "Capsule";
                      sceneObjects.push(newMesh);
                      updateObjectInState(newMesh);
                      setSelectedObjectUUID(newMesh.uuid);
                      setOpenAddObjectDropdown(false);
                    }}
                    className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                  >
                    <BiCapsule className="size-3" />
                    <p>Capsule</p>
                  </button>
                  <DropdownMenuSeparator className="my-0 h-[0.5px] bg-zinc-600" />
                  <button
                    onClick={() => {
                      const geometry = new PyramidGeometry();
                      const material = new PhongMaterial();
                      const newMesh = new Mesh(geometry, material);
                      newMesh.name = "Pyramid";
                      sceneObjects.push(newMesh);
                      updateObjectInState(newMesh);
                      setSelectedObjectUUID(newMesh.uuid);
                      setOpenAddObjectDropdown(false);
                    }}
                    className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                  >
                    <BiPyramid className="size-3" />
                    <p>Pyramid</p>
                  </button>
                  <DropdownMenuSeparator className="my-0 h-[0.5px] bg-zinc-600" />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="bg-zinc-800 text-white hover:bg-zinc-800 focus:bg-zinc-800 data-[state=open]:bg-zinc-800 data-[state=open]:text-blue-300">
                      <button className="flex items-center gap-1.5 border-none text-sm font-medium">
                        <FaPersonFalling className="size-3" />
                        <p>Articulated Models</p>
                      </button>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent
                      className="mb-14 border-zinc-700 bg-zinc-800 shadow-md focus:outline-none"
                      sideOffset={10}
                    >
                      <div className="flex flex-col gap-1 border-none bg-zinc-800">
                        <button
                          onClick={() => {
                            onAddByPath(
                              "/src/models/BMWM4.gltf",
                              "/src/models/BMWM4.bin",
                            );
                          }}
                          className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                        >
                          <SiBmw className="size-3" />
                          <p>BMW M4</p>
                        </button>
                        <button
                          onClick={() => {
                            onAddByPath(
                              "/src/models/LamborghiniSianRoadster.gltf",
                              "/src/models/LamborghiniSianRoadster.bin",
                            );
                          }}
                          className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                        >
                          <SiLamborghini className="size-3" />
                          <p>Lamborghini Sian Roadster</p>
                        </button>
                        <button
                          onClick={() => {
                            onAddByPath(
                              "/src/models/BugattiChiron.gltf",
                              "/src/models/BugattiChiron.bin",
                            );
                          }}
                          className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                        >
                          <SiBugatti className="size-3" />
                          <p>Bugatti Chiron</p>
                        </button>
                        <button
                          onClick={() => {
                            onAddByPath(
                              "/src/models/PorscheCarrera4S.gltf",
                              "/src/models/PorscheCarrera4S.bin",
                            );
                          }}
                          className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                        >
                          <SiPorsche className="size-3" />
                          <p>Porsche Carrera 4S</p>
                        </button>
                        <button
                          onClick={() => {
                            onAddByPath(
                              "/src/models/Humanoid.gltf",
                              "/src/models/Humanoid.bin",
                            );
                          }}
                          className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                        >
                          <FaPerson className="size-3" />
                          <p>Humanoid</p>
                        </button>
                        <button
                          onClick={() => {
                            onAddByPath(
                              "/src/models/IronMan.gltf",
                              "/src/models/IronMan.bin",
                            );
                          }}
                          className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                        >
                          <img
                            src={IronManLogo}
                            className="size-3 invert"
                            alt="IronManLogo"
                          />
                          <p>Iron Man (Marvel)</p>
                        </button>
                        <button
                          onClick={() => {
                            onAddByPath(
                              "/src/models/Batman.gltf",
                              "/src/models/Batman.bin",
                            );
                          }}
                          className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                        >
                          <img
                            src={BatmanLogo}
                            className="size-3 invert"
                            alt="BatmanLogo"
                          />
                          <p>Batman (DC)</p>
                        </button>
                        <button
                          onClick={() => {
                            onAddByPath(
                              "/src/models/Kratos.gltf",
                              "/src/models/Kratos.bin",
                            );
                          }}
                          className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                        >
                          <ImOmega className="mb-0.5 mr-0.5 size-2.5" />
                          <p>Kratos (God of War)</p>
                        </button>
                        <button
                          onClick={() => {
                            onAddByPath(
                              "/src/models/TyrionLannister.gltf",
                              "/src/models/TyrionLannister.bin",
                            );
                          }}
                          className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                        >
                          <img
                            src={GoTLogo}
                            className="size-3 grayscale invert"
                            alt="GoTLogo"
                          />
                          <p>Tyrion Lannister (Game of Thrones)</p>
                        </button>
                        <button
                          onClick={() => {
                            onAddByPath(
                              "/src/models/ArnoDorian.gltf",
                              "/src/models/ArnoDorian.bin",
                            );
                          }}
                          className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                        >
                          <img
                            src={ACLogo}
                            className="size-3 grayscale invert"
                            alt="ACLogo"
                          />
                          <p>Arno Dorian (Assasins Creed)</p>
                        </button>
                        <button
                          onClick={() => {
                            onAddByPath(
                              "/src/models/Ciri.gltf",
                              "/src/models/Ciri.bin",
                            );
                          }}
                          className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                        >
                          <img
                            src={TheWitcherLogo}
                            className="size-3 grayscale invert"
                            alt="TheWitcherLogo"
                          />
                          <p>Ciri (The Witcher)</p>
                        </button>
                        <button
                          onClick={() => {
                            onAddByPath(
                              "/src/models/Among_Us.gltf",
                              "/src/models/Among_Us.bin",
                            );
                          }}
                          className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                        >
                          <TbBrandAmongUs className="size-3" />
                          <p>Amogus (Sus)</p>
                        </button>
                        <button
                          onClick={() => {
                            onAddByPath(
                              "/src/models/Nigersaurus.gltf",
                              "/src/models/Nigersaurus.bin",
                            );
                          }}
                          className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300"
                        >
                          <GiDinosaurBones className="size-3" />
                          <p>Nigersaurus (Lmao)</p>
                        </button>
                      </div>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator className="my-0 h-[0.5px] bg-zinc-600" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-1.5 border-none px-2 py-1 text-sm font-medium text-white hover:text-blue-300">
                        <DownloadIcon className="size-3" />
                        <p>Import Object</p>
                      </button>
                    </DialogTrigger>
                    <ImportObjectDialog onSubmit={onAddByImport} />
                  </Dialog>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tip */}
            <TooltipProvider>
              <Tooltip delayDuration={10}>
                <TooltipTrigger asChild>
                  <button>
                    <MdOutlineTipsAndUpdates className="size-3 text-stone-100" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-700" side="right">
                  <p className="font-medium">
                    <span className="text-blue-300">Tip: </span>
                    Right-click on an object to view more options
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-zinc-800 px-2 py-1">
          <div className="flex items-center gap-1.5">
            <GiCubeforce className="size-3.5 text-stone-100" />
            <p className="mt-0.5 truncate text-sm font-medium text-white">
              Hollow Objects
            </p>
          </div>
        </div>
      )}

      {/* Object Tree */}
      <div className="flex size-full flex-col overflow-y-auto overflow-x-clip">
        {tab === "scene" &&
          sceneObjects.map((sceneObject) => (
            <SceneObjectTree
              type="scene"
              key={sceneObject.uuid}
              sceneObject={sceneObject}
              sceneObjects={sceneObjects}
              selectedObjectUUID={selectedObjectUUID}
              onSelect={setSelectedObjectUUID}
              onAddChild={onAddChild}
              onDelete={onDelete}
              updateObjectInState={updateObjectInState}
            />
          ))}
        {tab === "hollow" &&
          hollowObjects.map((sceneObject) => (
            <SceneObjectTree
              type="hollow"
              key={sceneObject.uuid}
              sceneObject={sceneObject}
              sceneObjects={hollowObjects}
              selectedObjectUUID={selectedObjectUUID}
              onSelect={setSelectedObjectUUID}
              onAddChild={() => {}}
              onDelete={() => {}}
              updateObjectInState={() => {}}
            />
          ))}
      </div>
    </div>
  );
}
