import { CSSProperties, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import logo from "./assets/logo.png";
import ObjectTreePanel from "./layouts/ObjectTreePanel";
import { ObjectTreeNode } from "./lib/object/ObjectTreeNode";
import InspectorPanel from "./layouts/InspectorPanel";
import { Light, LightType } from "./lib/light/Light";
import { Color } from "./lib/light/Color";
import CanvasMain from "./layouts/CanvasMain";
import { PerspectiveCamera } from "./lib/camera/PerspectiveCamera";
import { ExpandedStateProvider } from "./context/ExpandedStateContext";
import { parseGLTFFromPath } from "./lib/gltf/parseGLTF";
import { toast } from "react-toastify";
import { Camera } from "./lib/camera/Camera";
import { MathUtils } from "./lib/math/MathUtils";

function App(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [splash, setSplash] = useState<boolean>(true);
  const [selectedObjectUUID, setSelectedObjectUUID] = useState<string | null>(
    null,
  );
  const [tab, setTab] = useState<"scene" | "hollow">("scene");
  const hollowObjectsSet = useRef<boolean>(false);

  // Scene Objects
  const [sceneObjects, setSceneObjects] = useState<ObjectTreeNode[]>(() => {
    let aspect = 1;
    if (canvasRef.current) {
      aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
    }
    const mainCamera = new PerspectiveCamera(30, aspect, 0.1, 100);
    mainCamera.name = "Main Camera";
    mainCamera.uuid = "main-camera";
    mainCamera.position.set(0, 0, 10);

    const lightColor = new Color(255, 255, 255);
    const directionalLight = new Light(lightColor, 0.75, LightType.Directional);
    directionalLight.name = "Directional Light";

    return [mainCamera, directionalLight];
  });

  const [hollowObjects, setHollowObjects] = useState<ObjectTreeNode[]>(() => {
    let aspect = 1;
    if (canvasRef.current) {
      aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
    }

    const mainCamera = new PerspectiveCamera(30, aspect, 0.1, 100);
    mainCamera.name = "Main Camera";
    mainCamera.uuid = "main-camera";
    mainCamera.position.set(0, 0, 10);

    const lightColor = Color.white;
    const directionalLight = new Light(lightColor, 0.5, LightType.Directional);
    directionalLight.name = "Directional Light";

    return [mainCamera, directionalLight];
  });

  const fetchWithRetry = async (
    fetchFunction: () => Promise<ObjectTreeNode[]>,
    retries: number = 5,
    delay: number = 1000,
  ): Promise<ObjectTreeNode[]> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fetchFunction();
      } catch (error: any) {
        console.error(`Attempt ${attempt + 1} failed: ${error.message}`);
        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw new Error(`Failed to fetch after ${retries} attempts`);
  };

  // Fill the hollow objects
  useEffect(() => {
    if (hollowObjectsSet.current) {
      return;
    }

    const fetchAndSetObject = async (
      gltfPath: string,
      binPath: string,
      position: [number, number, number],
      scale?: [number, number, number],
      rotation?: [number, number, number],
    ) => {
      const objects = await fetchWithRetry(() =>
        parseGLTFFromPath(gltfPath, binPath),
      );
      const object = objects[0];
      object.position.set(...position);
      if (scale) {
        object.scale.set(...scale);
      }
      if (rotation) {
        object.rotation = object.rotation.setFromArray(
          rotation.map((r) => MathUtils.DEGTORAD * r),
        );
      }
      setHollowObjects((prev) => [...prev, object]);
    };

    fetchAndSetObject(
      "/src/models/Skull.gltf",
      "/src/models/Skull.bin",
      [0, 0, -2.5],
    ).catch((error) => toast.error(`Skull Hollow Object: ${error.message}`));

    fetchAndSetObject(
      "/src/models/VeniceMask.gltf",
      "/src/models/VeniceMask.bin",
      [1.85, -0.6, -2.5],
    ).catch((error) =>
      toast.error(`Venice Mask Hollow Object: ${error.message}`),
    );

    fetchAndSetObject(
      "/src/models/AfricanMasks.gltf",
      "/src/models/AfricanMasks.bin",
      [0, -2.75, -2.5],
    ).catch((error) =>
      toast.error(`African Masks Hollow Object: ${error.message}`),
    );

    fetchAndSetObject(
      "/src/models/HollowCube.gltf",
      "/src/models/HollowCube.bin",
      [0, 1.75, -2.5],
    ).catch((error) =>
      toast.error(`Hollow Cube Hollow Object: ${error.message}`),
    );

    fetchAndSetObject(
      "/src/models/Torus.gltf",
      "/src/models/Torus.bin",
      [-1.75, 0, -2.5],
      [0.25, 0.25, 0.25],
    ).catch((error) => toast.error(`Torus Hollow Object: ${error.message}`));

    fetchAndSetObject(
      "/src/models/CookieCutter.gltf",
      "/src/models/CookieCutter.bin",
      [-1.4, 1.3, 0],
      [0.4, 0.4, 0.9],
      [10, 20, 20],
    ).catch((error) =>
      toast.error(`Cookie Cutter Hollow Object: ${error.message}`),
    );

    fetchAndSetObject(
      "/src/models/Tetrakis.gltf",
      "/src/models/Tetrakis.bin",
      [1.4, -1.3, 0],
      [0.4, 0.4, 0.9],
      [1, 1, 1],
    ).catch((error) => toast.error(`Tetrakis Hollow Object: ${error.message}`));

    hollowObjectsSet.current = true;
  }, [hollowObjects]);

  useEffect(() => {
    setTimeout(() => {
      setSplash(false);
    }, 1000);
  }, []);

  const containerStyles: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    position: "relative",
  };

  const updateObjectInState = (obj: ObjectTreeNode) => {
    const updateNonNode = (
      nodes: ObjectTreeNode[],
      node: Camera | Light,
    ): ObjectTreeNode[] => {
      const idx = nodes.findIndex((n) => n.uuid === node.uuid);
      if (idx === -1) {
        return nodes;
      }

      const newNodes = nodes.map((n) => {
        if (n.uuid === node.uuid) {
          return node;
        }
        return n;
      });

      return newNodes;
    };

    const updateNode = (
      nodes: ObjectTreeNode[],
      node: ObjectTreeNode, // Pure ObjectTreeNode or Mesh
    ): ObjectTreeNode[] => {
      return nodes.map((n) => {
        if (n instanceof Light || n instanceof Camera) {
          return n;
        }

        // Object is Mesh / Pure ObjectTreeNode
        const newNode = n.clone(false);
        return newNode.cloneAndChange(n, node);
      });
    };

    if (obj instanceof Camera || obj instanceof Light) {
      setSceneObjects(updateNonNode(sceneObjects, obj));
      setHollowObjects(updateNonNode(hollowObjects, obj));
      return;
    }

    setSceneObjects(updateNode(sceneObjects, obj));
    setHollowObjects(updateNode(hollowObjects, obj));
  };

  return splash ? (
    <motion.div
      className="flex h-screen w-screen items-center justify-center bg-zinc-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div style={containerStyles}>
        <motion.img
          src={logo}
          alt="Logo"
          className="absolute opacity-60"
          style={{ top: "50%", left: "50%", translate: "-50% -50%" }}
          initial={{ scale: 0.1 }}
          animate={{ scale: 0.16 }}
          transition={{ duration: 0.75 }}
        />
      </div>
    </motion.div>
  ) : (
    <ExpandedStateProvider>
      <div className="fadeIn flex h-screen w-screen overflow-hidden bg-zinc-950">
        <ObjectTreePanel
          tab={tab}
          setTab={setTab}
          selectedObjectUUID={selectedObjectUUID}
          setSelectedObjectUUID={setSelectedObjectUUID}
          sceneObjects={sceneObjects}
          setSceneObjects={setSceneObjects}
          hollowObjects={hollowObjects}
          updateObjectInState={updateObjectInState}
        />
        <CanvasMain
          canvasRef={canvasRef}
          sceneObjects={tab === "scene" ? sceneObjects : hollowObjects}
          updateObjectInState={updateObjectInState}
        />
        <InspectorPanel
          updateObjectInState={updateObjectInState}
          sceneObjects={tab === "scene" ? sceneObjects : hollowObjects}
          selectedObjectUUID={selectedObjectUUID}
          setSelectedObjectUUID={setSelectedObjectUUID}
        />
      </div>
    </ExpandedStateProvider>
  );
}

export default App;
