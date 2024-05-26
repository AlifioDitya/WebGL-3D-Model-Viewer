import { ObjectTreeNode } from "@/lib/object/ObjectTreeNode";
import WebGLRenderer from "@/lib/util/WebGLRenderer";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Vector3 } from "@/lib/math/Vector3";
import { Quaternion } from "@/lib/math/Quaternion";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PiCursorClickThin,
  PiKeyboardLight,
  PiMouseLeftClick,
  PiMouseMiddleClick,
  PiMouseRightClick,
} from "react-icons/pi";
import { BiCollapseAlt } from "react-icons/bi";
import { GoDeviceCameraVideo } from "react-icons/go";
import { useFindObjectInTree } from "@/lib/helper/findObjectInTree";
import { Camera } from "@/lib/camera/Camera";

interface CanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  sceneObjects: ObjectTreeNode[];
  updateObjectInState: (obj: ObjectTreeNode) => void;
}

const MOVE_SPEED = 0.1;
const ROTATE_SPEED = 0.002;
const DRAG_MOVE_SPEED = 0.01;
const ZOOM_SPEED = 0.01;

export default function CanvasMain({
  canvasRef,
  sceneObjects,
  updateObjectInState,
}: CanvasProps): JSX.Element {
  const [isRightClickPressed, setIsRightClickPressed] = useState(false);
  const [isLeftClickPressed, setIsLeftClickPressed] = useState(false);
  const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>(
    {},
  );
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);
  const focusedCanvas = useRef<"main" | "overlay" | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const focusedCamera = useRef<Camera | null>(null);
  const [collapseMiniCanvas, setCollapseMiniCanvas] = useState(false);
  const [mainWebGL, setMainWebGL] = useState<WebGLRenderer | null>(null);
  const [overlayWebGL, setOverlayWebGL] = useState<WebGLRenderer | null>(null);
  const findObjectInTree = useFindObjectInTree();

  const scene = useMemo(() => {
    const newScene = new ObjectTreeNode("scene-root");
    sceneObjects.forEach((obj) => {
      newScene.add(obj);
    });
    return newScene;
  }, [sceneObjects]);

  const mainCamera = useMemo(() => {
    return findObjectInTree("main-camera", scene.children) as Camera;
  }, [scene.children, findObjectInTree]);

  const secondaryCamera = useMemo(() => {
    const camera = findObjectInTree(
      "secondary-camera",
      scene.children,
    ) as Camera;
    return camera;
  }, [scene.children, findObjectInTree]);

  const render = useCallback(() => {
    if (mainWebGL) {
      mainWebGL.render(scene, mainCamera);
    }
    if (secondaryCamera && overlayWebGL) {
      overlayWebGL.render(scene, secondaryCamera);
    }
  }, [mainWebGL, overlayWebGL, mainCamera, secondaryCamera, scene]);

  useEffect(() => {
    const mainCanvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!mainCanvas) {
      console.error("Main canvas not found");
      return;
    }

    if (!mainWebGL) {
      const renderer = new WebGLRenderer(mainCanvas);
      renderer.adjustCanvas();
      setMainWebGL(renderer);
    }

    if (overlayCanvas && secondaryCamera && !overlayWebGL) {
      const renderer = new WebGLRenderer(overlayCanvas);
      renderer.adjustCanvas();
      setOverlayWebGL(renderer);
    }
  }, [canvasRef, mainWebGL, overlayWebGL, secondaryCamera]);

  useEffect(() => {
    const mainCanvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!mainCanvas || !mainWebGL || !scene || !mainCamera || !render) {
      return;
    }

    // Handle key down events
    const handleKeyDown = (event: KeyboardEvent) => {
      if (focusedCanvas.current) {
        setKeysPressed((prev) => ({ ...prev, [event.key]: true }));
      }
    };

    // Handle key up events
    const handleKeyUp = (event: KeyboardEvent) => {
      if (focusedCanvas.current) {
        setKeysPressed((prev) => ({ ...prev, [event.key]: false }));
      }
    };

    // Handle mouse down events
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        setIsLeftClickPressed(true);
        lastMousePosition.current = { x: event.clientX, y: event.clientY };
        if (event.target === mainCanvas) {
          focusedCanvas.current = "main";
          focusedCamera.current = mainCamera;
        } else if (event.target === overlayCanvas) {
          focusedCanvas.current = "overlay";
          focusedCamera.current = secondaryCamera;
        }
      }
      if (event.button === 2) {
        setIsRightClickPressed(true);
        lastMousePosition.current = { x: event.clientX, y: event.clientY };
        if (focusedCanvas.current === "main") {
          mainCanvas!.style.cursor = "grabbing";
        } else if (focusedCanvas.current === "overlay") {
          overlayCanvas!.style.cursor = "grabbing";
        }
      }
    };

    // Handle mouse up events
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) {
        setIsLeftClickPressed(false);
        lastMousePosition.current = null;
      }
      if (event.button === 2) {
        setIsRightClickPressed(false);
        lastMousePosition.current = null;
        if (mainCanvas) {
          mainCanvas.style.cursor = "default";
        }
        if (overlayCanvas) {
          overlayCanvas.style.cursor = "default";
        }
      }
    };

    // Handle mouse move events
    const handleMouseMove = (event: MouseEvent) => {
      if (!focusedCamera.current) {
        return;
      }

      if (isLeftClickPressed && lastMousePosition.current) {
        const deltaX = event.clientX - lastMousePosition.current.x;
        const deltaY = event.clientY - lastMousePosition.current.y;

        if (deltaX === 0 && deltaY === 0) {
          return;
        }

        // Create quaternions for rotation
        const yawQuaternion = new Quaternion().setFromEulerAngles(
          new Vector3(0, -deltaX * ROTATE_SPEED, 0),
        );
        const pitchQuaternion = new Quaternion().setFromEulerAngles(
          new Vector3(-deltaY * ROTATE_SPEED, 0, 0),
        );

        // Apply quaternions to the camera rotation
        focusedCamera.current!.quaternion.multiplyQuaternions(
          yawQuaternion,
          focusedCamera.current!.quaternion,
        );
        focusedCamera.current!.quaternion.multiplyQuaternions(
          focusedCamera.current!.quaternion,
          pitchQuaternion,
        );

        // Update camera rotation from quaternion
        focusedCamera.current!.rotation.setFromQuaternion(
          focusedCamera.current!.quaternion,
        );

        lastMousePosition.current = { x: event.clientX, y: event.clientY };
        updateObjectInState(focusedCamera.current);
      } else if (isRightClickPressed && lastMousePosition.current) {
        const deltaX = event.clientX - lastMousePosition.current.x;
        const deltaY = event.clientY - lastMousePosition.current.y;

        if (deltaX === 0 && deltaY === 0) {
          return;
        }

        const moveDirection = new Vector3(
          -deltaX * DRAG_MOVE_SPEED,
          deltaY * DRAG_MOVE_SPEED,
          0,
        );

        const quaternion = focusedCamera.current!.quaternion.clone();
        moveDirection.applyQuaternion(quaternion);

        focusedCamera.current.position.add(moveDirection);

        lastMousePosition.current = { x: event.clientX, y: event.clientY };
        updateObjectInState(focusedCamera.current);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) {
        return;
      }

      if (focusedCamera.current) {
        const direction = new Vector3(0, 0, event.deltaY * ZOOM_SPEED);
        const quaternion = focusedCamera.current.quaternion.clone();

        direction.applyQuaternion(quaternion);

        focusedCamera.current.position.add(direction);

        updateObjectInState(focusedCamera.current);
      }
    };

    // Prevent context menu on right click
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    // Update camera position based on keys pressed
    const updateCameraPosition = () => {
      if (!focusedCamera.current) {
        return;
      }

      const direction = new Vector3();
      if (keysPressed["w"]) {
        direction.z -= MOVE_SPEED;
      }
      if (keysPressed["s"]) {
        direction.z += MOVE_SPEED;
      }
      if (keysPressed["a"]) {
        direction.x -= MOVE_SPEED;
      }
      if (keysPressed["d"]) {
        direction.x += MOVE_SPEED;
      }
      if (keysPressed["e"] || keysPressed[" "]) {
        direction.y += MOVE_SPEED;
      }
      if (keysPressed["q"]) {
        direction.y -= MOVE_SPEED;
      }

      if (direction.isZero()) {
        return;
      }

      const quaternion = focusedCamera.current.quaternion.clone();
      direction.applyQuaternion(quaternion);

      focusedCamera.current.position.add(direction);

      console.log("Input received");

      updateObjectInState(focusedCamera.current);
    };

    // Set up event listeners
    mainCanvas.addEventListener("keydown", handleKeyDown);
    mainCanvas.addEventListener("keyup", handleKeyUp);
    mainCanvas.addEventListener("mousedown", handleMouseDown);
    mainCanvas.addEventListener("mouseup", handleMouseUp);
    mainCanvas.addEventListener("mousemove", handleMouseMove);
    mainCanvas.addEventListener("wheel", handleWheel);
    mainCanvas.addEventListener("contextmenu", handleContextMenu);
    mainCanvas.addEventListener("focus", () => {
      focusedCanvas.current = "main";
      focusedCamera.current = mainCamera;
    });
    mainCanvas.addEventListener("blur", () => {
      focusedCanvas.current = null;
    });

    if (overlayCanvas) {
      overlayCanvas.addEventListener("keydown", handleKeyDown);
      overlayCanvas.addEventListener("keyup", handleKeyUp);
      overlayCanvas.addEventListener("mousedown", handleMouseDown);
      overlayCanvas.addEventListener("mouseup", handleMouseUp);
      overlayCanvas.addEventListener("mousemove", handleMouseMove);
      overlayCanvas.addEventListener("wheel", handleWheel);
      overlayCanvas.addEventListener("contextmenu", handleContextMenu);
      overlayCanvas.addEventListener("focus", () => {
        focusedCanvas.current = "overlay";
        focusedCamera.current = secondaryCamera;
      });
      overlayCanvas.addEventListener("blur", () => {
        focusedCanvas.current = null;
      });
    }

    // Start the update loop
    const intervalId = setInterval(updateCameraPosition, 16);

    // Adjust canvas size on resize
    const resizeObserver = new ResizeObserver(() => {
      if (mainWebGL) {
        mainWebGL.adjustCanvas();
      }
      if (overlayWebGL) {
        overlayWebGL.adjustCanvas();
      }
      render();
    });
    if (mainCanvas) {
      resizeObserver.observe(mainCanvas);
    }
    if (overlayCanvas) {
      resizeObserver.observe(overlayCanvas);
    }

    render();

    // Cleanup on component unmount
    return () => {
      mainCanvas.removeEventListener("keydown", handleKeyDown);
      mainCanvas.removeEventListener("keyup", handleKeyUp);
      mainCanvas.removeEventListener("mousedown", handleMouseDown);
      mainCanvas.removeEventListener("mouseup", handleMouseUp);
      mainCanvas.removeEventListener("mousemove", handleMouseMove);
      mainCanvas.removeEventListener("wheel", handleWheel);
      mainCanvas.removeEventListener("contextmenu", handleContextMenu);
      mainCanvas.removeEventListener("focus", () => {
        focusedCanvas.current = "main";
        focusedCamera.current = mainCamera;
      });
      mainCanvas.removeEventListener("blur", () => {
        focusedCanvas.current = null;
      });

      if (overlayCanvas) {
        overlayCanvas.removeEventListener("keydown", handleKeyDown);
        overlayCanvas.removeEventListener("keyup", handleKeyUp);
        overlayCanvas.removeEventListener("mousedown", handleMouseDown);
        overlayCanvas.removeEventListener("mouseup", handleMouseUp);
        overlayCanvas.removeEventListener("mousemove", handleMouseMove);
        overlayCanvas.removeEventListener("wheel", handleWheel);
        overlayCanvas.removeEventListener("contextmenu", handleContextMenu);
        overlayCanvas.removeEventListener("focus", () => {
          focusedCanvas.current = "overlay";
          focusedCamera.current = secondaryCamera;
        });
        overlayCanvas.removeEventListener("blur", () => {
          focusedCanvas.current = null;
        });
      }

      clearInterval(intervalId);
      resizeObserver.unobserve(mainCanvas);
      if (overlayCanvas) {
        resizeObserver.unobserve(overlayCanvas);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scene,
    canvasRef,
    isRightClickPressed,
    isLeftClickPressed,
    keysPressed,
    mainCamera,
    secondaryCamera,
    mainWebGL,
    overlayWebGL,
    render,
  ]);

  return (
    <div className="relative flex size-full overflow-hidden">
      <TooltipProvider>
        <Tooltip delayDuration={10}>
          <TooltipTrigger asChild>
            <button className="absolute right-3 top-[18px] text-stone-100 hover:text-blue-300 focus:outline-none">
              <InfoCircledIcon className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="mt-2 bg-zinc-700" side="left">
            <p className="font-medium text-blue-300">Controls:</p>
            <ul className="list-inside">
              <li className="flex items-center gap-1.5">
                <PiMouseLeftClick />
                Left-click and Drag: Camera look
              </li>
              <li className="flex items-center gap-1.5">
                <PiMouseRightClick />
                Right-click and Drag: Camera move
              </li>
              <li className="flex items-center gap-1.5">
                <PiMouseMiddleClick />
                Scroll Wheel: Camera zoom
              </li>
              <li className="flex items-center gap-1.5">
                <PiKeyboardLight />
                WASD, E, Q, Space: Move camera
              </li>
              {findObjectInTree("secondary-camera", scene.children) && (
                <>
                  <li className="flex items-center gap-1.5">
                    <PiCursorClickThin />
                    Click Overlay View: Focus secondary camera
                  </li>
                </>
              )}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <canvas
        ref={canvasRef}
        className="grid-pattern size-full bg-[#1E1E1E]"
        id="glcanvas"
        width={800}
        height={600}
        tabIndex={0} // Make the canvas focusable
      ></canvas>
      {findObjectInTree("secondary-camera", scene.children) ? (
        <>
          {collapseMiniCanvas ? (
            <TooltipProvider>
              <Tooltip delayDuration={1}>
                <TooltipTrigger className="absolute bottom-4 right-4">
                  <button className="aspect-square rounded-lg bg-zinc-700 p-2">
                    <GoDeviceCameraVideo
                      className="size-4 text-stone-100"
                      onClick={() => setCollapseMiniCanvas(false)}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-600" side="left">
                  <p>Expand secondary camera view.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              <canvas
                ref={overlayCanvasRef}
                className="grid-pattern absolute bottom-4 right-4 h-48 w-64 rounded-lg border border-gray-500 bg-[#1E1E1E] focus:border-blue-400 focus:outline-none"
                id="overlayCanvas"
                tabIndex={0}
              ></canvas>
              <TooltipProvider>
                <Tooltip delayDuration={1}>
                  <TooltipTrigger className="absolute bottom-[178px] right-6">
                    <button onClick={() => setCollapseMiniCanvas(true)}>
                      <BiCollapseAlt className="size-3 rotate-90 text-stone-100" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-600" side="left">
                    <p>Collapse secondary camera view.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
