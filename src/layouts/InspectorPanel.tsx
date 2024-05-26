import AnimatorComponent from "@/components/AnimatorComponent";
import LightComponent from "@/components/LightComponent";
import MaterialComponent from "@/components/MaterialComponent";
import ProjectionComponent from "@/components/ProjectionComponent";
import TransformComponent from "@/components/TransformComponent";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Camera } from "@/lib/camera/Camera";
import { useFindObjectInTree } from "@/lib/helper/findObjectInTree";
import { Light, LightType } from "@/lib/light/Light";
import { Mesh } from "@/lib/object/Mesh";
import { ObjectTreeNode } from "@/lib/object/ObjectTreeNode";
interface InspectorPanelProps {
  sceneObjects: ObjectTreeNode[];
  selectedObjectUUID: string | null;
  setSelectedObjectUUID: (id: string) => void;
  updateObjectInState: (obj: ObjectTreeNode) => void;
}

export default function InspectorPanel({
  sceneObjects,
  selectedObjectUUID,
  setSelectedObjectUUID,
  updateObjectInState,
}: InspectorPanelProps): JSX.Element {
  const findObjectInTree = useFindObjectInTree();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedObjectUUID) {
      const obj = findObjectInTree(selectedObjectUUID, sceneObjects);
      if (obj) {
        obj.name = e.target.value;
        updateObjectInState(obj);
        setSelectedObjectUUID(obj.uuid);
      }
    }
  };

  const handleEnableChange = () => {
    if (!selectedObjectUUID) {
      return;
    }

    const obj = findObjectInTree(selectedObjectUUID, sceneObjects);
    if (obj) {
      obj.enable = !obj.enable;
      updateObjectInState(obj);
      setSelectedObjectUUID(obj.uuid);
    }
  };

  const currNode =
    selectedObjectUUID && findObjectInTree(selectedObjectUUID, sceneObjects);

  return (
    <div className="flex h-full min-w-[25%] flex-col border-l border-l-zinc-700 bg-zinc-800/70 py-1">
      {/* Object Name and Enable */}
      {
        <div className="flex w-full items-center gap-2 p-2">
          <Checkbox
            className="aspect-square size-4 bg-zinc-700 hover:bg-zinc-700/70 data-[state=checked]:bg-zinc-700 data-[state=checked]:text-white"
            checked={currNode ? currNode.enable : false}
            onClick={handleEnableChange}
          />
          <Input
            type="text"
            placeholder=""
            value={currNode ? currNode.name : ""}
            className="h-fit w-full border-none bg-zinc-800 px-2 py-1 text-white"
            onChange={handleNameChange}
          />
        </div>
      }
      {/* Projection Component */}
      {currNode instanceof Camera && (
        <ProjectionComponent
          updateObjectInState={updateObjectInState}
          setSelectedObjectUUID={setSelectedObjectUUID}
          cameraObject={currNode as Camera}
        />
      )}
      {/* Transform Component */}
      {currNode &&
        !(
          currNode instanceof Light &&
          (currNode as Light).type === LightType.Directional
        ) && (
          <TransformComponent
            updateObjectInState={updateObjectInState}
            sceneObjects={sceneObjects}
            selectedObjectUUID={selectedObjectUUID}
            setSelectedObjectUUID={setSelectedObjectUUID}
          />
        )}
      {/* Animator Component */}
      {!(currNode instanceof Light || currNode instanceof Camera) &&
        selectedObjectUUID && (
          <AnimatorComponent
            updateObjectInState={updateObjectInState}
            sceneObjects={sceneObjects}
            selectedObjectUUID={selectedObjectUUID}
            setSelectedObjectUUID={setSelectedObjectUUID}
          />
        )}
      {/* Material Component */}
      {currNode instanceof Mesh && (
        <MaterialComponent
          selectedObjectUUID={selectedObjectUUID}
          sceneObjects={sceneObjects}
          updateObjectInState={updateObjectInState}
        />
      )}
      {/* Light Component */}
      {currNode instanceof Light && (
        <LightComponent
          updateObjectInState={updateObjectInState}
          selectedObjectUUID={selectedObjectUUID}
          sceneObjects={sceneObjects}
        />
      )}
    </div>
  );
}
