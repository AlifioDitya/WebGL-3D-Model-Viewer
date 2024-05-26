import { Camera } from "@/lib/camera/Camera";
import { MdOutlineCamera } from "react-icons/md";
import { PerspectiveCamera } from "@/lib/camera/PerspectiveCamera";
import { OrthographicCamera } from "@/lib/camera/OrthographicCamera";
import { ObliqueCamera } from "@/lib/camera/ObliqueCamera";
import { ObjectTreeNode } from "@/lib/object/ObjectTreeNode";
import { Vector3 } from "@/lib/math/Vector3";

interface ProjectionComponentProps {
  cameraObject: Camera;
  updateObjectInState: (obj: ObjectTreeNode) => void;
  setSelectedObjectUUID: (id: string) => void;
}

export default function ProjectionComponent({
  cameraObject,
  updateObjectInState,
  setSelectedObjectUUID,
}: ProjectionComponentProps): JSX.Element {
  let camType =
    cameraObject instanceof OrthographicCamera
      ? "orthographic"
      : cameraObject instanceof ObliqueCamera
        ? "oblique"
        : "perspective";

  const handleChangeType = (
    type: "orthographic" | "oblique" | "perspective",
  ) => {
    const { rotation, scale, uuid, name } = cameraObject;
    let newCamera: Camera;

    if (type === "orthographic") {
      newCamera = new OrthographicCamera(-2.5, 2.5, -2.5, 2.5, 0.1, 100);
    } else if (type === "oblique") {
      let canvas: HTMLCanvasElement;
      if (cameraObject.uuid === "main-camera") {
        canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
      } else {
        canvas = document.getElementById("overlayCanvas") as HTMLCanvasElement;
      }

      const w = canvas.clientWidth / 100;
      newCamera = new ObliqueCamera(0, w, w, 0, 0.1, 1000, 45, 0.5);
    } else {
      newCamera = new PerspectiveCamera(30, 1, 0.1, 100);
    }

    camType = type;

    newCamera.position = new Vector3(0, 0, 10);
    newCamera.rotation = rotation.clone();
    newCamera.scale = scale.clone();
    newCamera.uuid = uuid;
    newCamera.name = name;

    cameraObject.kill();

    updateObjectInState(newCamera);
    setSelectedObjectUUID(newCamera.uuid);
  };

  return (
    <div className="flex w-full flex-col gap-2 border-y border-y-zinc-700 px-3 pb-2.5 pt-2">
      {/* Component Name */}
      <div className="flex items-center gap-2">
        <MdOutlineCamera className="mb-0.5 size-4 text-stone-100" />
        <p className="text-sm font-medium text-white">Projection</p>
      </div>

      {/* Projection Type */}
      <div className="flex items-center gap-2 self-center">
        <button
          onClick={() => handleChangeType("perspective")}
          className={`${
            camType === "perspective"
              ? "border-DEFAULT border-gray-600 bg-gray-400/60"
              : "bg-zinc-700"
          } rounded-md px-3 py-1`}
        >
          <p className="text-xs text-white">Perspective</p>
        </button>
        <button
          onClick={() => handleChangeType("orthographic")}
          className={`${
            camType === "orthographic"
              ? "border-DEFAULT border-gray-600 bg-gray-400/60"
              : "bg-zinc-700"
          } rounded-md px-3 py-1`}
        >
          <p className="text-xs text-white">Orthographic</p>
        </button>
        <button
          onClick={() => handleChangeType("oblique")}
          className={`${
            camType === "oblique"
              ? "border-DEFAULT border-gray-600 bg-gray-400/60"
              : "bg-zinc-700"
          } rounded-md px-3 py-1`}
        >
          <p className="text-xs text-white">Oblique</p>
        </button>
      </div>
    </div>
  );
}
