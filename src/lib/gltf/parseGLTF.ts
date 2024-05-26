import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { BufferGeometry } from "../geometry/BufferGeometry";
import { BufferAttribute } from "../geometry/BufferAttribute";
import { Mesh } from "../object/Mesh";
import { ObjectTreeNode } from "../object/ObjectTreeNode";
import { PhongMaterial } from "../material/PhongMaterial";

// Interface for glTF structure
interface GLTFImport {
  nodes: any[];
  meshes: any[];
  accessors: any[];
  bufferViews: any[];
  buffers: any[];
}

function getComponentTypeSize(componentType: number): number {
  switch (componentType) {
    case 5120: // BYTE
    case 5121: // UNSIGNED_BYTE
      return 1;
    case 5122: // SHORT
    case 5123: // UNSIGNED_SHORT
      return 2;
    case 5125: // UNSIGNED_INT
      return 4;
    case 5126: // FLOAT
      return 4;
    default:
      throw new Error(`Unknown component type: ${componentType}`);
  }
}

function getNumComponents(type: string): number {
  switch (type) {
    case "SCALAR":
      return 1;
    case "VEC2":
      return 2;
    case "VEC3":
      return 3;
    case "VEC4":
      return 4;
    case "MAT2":
      return 4;
    case "MAT3":
      return 9;
    case "MAT4":
      return 16;
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

export async function parseGLTFFromFiles(
  gltfFile: File,
  binFile?: File,
  scaleDown?: boolean,
) {
  const gltfData: GLTFImport = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        resolve(JSON.parse(reader.result as string));
      } else {
        reject("Failed to read gltf file");
      }
    };
    reader.readAsText(gltfFile);
  });

  let binBuffer: ArrayBuffer | null = null;
  if (binFile) {
    binBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as ArrayBuffer);
        } else {
          reject("Failed to read bin file");
        }
      };
      reader.readAsArrayBuffer(binFile);
    });
  }

  const nodes = gltfData.nodes.map((node, index) => {
    const position = new Vector3(...(node.translation || [0, 0, 0]));
    const rotation = new Quaternion(...(node.rotation || [0, 0, 0, 1]));
    const scale = new Vector3(...(node.scale || [1, 1, 1]));

    // Create either an ObjectTreeNode or a Mesh if the node has a mesh
    let treeNode: ObjectTreeNode;
    if (node.mesh !== undefined) {
      const meshData = gltfData.meshes[node.mesh];
      const geometry = new BufferGeometry();

      meshData.primitives.forEach((primitive: any) => {
        const positionAccessor =
          gltfData.accessors[primitive.attributes.POSITION];
        const positionBufferView =
          gltfData.bufferViews[positionAccessor.bufferView];

        const componentTypeSize = getComponentTypeSize(
          positionAccessor.componentType,
        );
        const numComponents = getNumComponents(positionAccessor.type);
        const bufferViewOffset = positionBufferView.byteOffset || 0;
        const accessorOffset = positionAccessor.byteOffset || 0;
        const byteOffset = bufferViewOffset + accessorOffset;

        // Validate the length
        const expectedLength = positionAccessor.count * numComponents;
        const totalBytes = expectedLength * componentTypeSize;

        // Ensure byteOffset and byteLength are within the bounds of binBuffer
        if (binBuffer && byteOffset + totalBytes > binBuffer.byteLength) {
          throw new Error(
            `Invalid byteOffset and length: exceeds buffer bounds`,
          );
        }

        const positionArray = binBuffer
          ? new Float32Array(binBuffer, byteOffset, expectedLength)
          : new Float32Array(expectedLength); // Default to empty array if no binBuffer

        geometry.setAttribute(
          "position",
          new BufferAttribute(positionArray, numComponents),
        );

        // Parse normals if provided
        if (primitive.attributes.NORMAL !== undefined) {
          const normalAccessor =
            gltfData.accessors[primitive.attributes.NORMAL];
          const normalBufferView =
            gltfData.bufferViews[normalAccessor.bufferView];
          const normalBufferOffset = normalBufferView.byteOffset || 0;
          const normalAccessorOffset = normalAccessor.byteOffset || 0;
          const normalByteOffset = normalBufferOffset + normalAccessorOffset;
          const normalExpectedLength =
            normalAccessor.count * getNumComponents(normalAccessor.type);
          const normalTotalBytes =
            normalExpectedLength *
            getComponentTypeSize(normalAccessor.componentType);

          if (
            binBuffer &&
            normalByteOffset + normalTotalBytes > binBuffer.byteLength
          ) {
            throw new Error(
              `Invalid normal byteOffset and length: exceeds buffer bounds`,
            );
          }

          const normalArray = binBuffer
            ? new Float32Array(
                binBuffer,
                normalByteOffset,
                normalExpectedLength,
              )
            : new Float32Array(normalExpectedLength); // Default to empty array if no binBuffer

          geometry.setAttribute(
            "normal",
            new BufferAttribute(
              normalArray,
              getNumComponents(normalAccessor.type),
            ),
          );
        } else {
          geometry.calculateNormals(); // Calculate normals if not provided
        }

        // Parse indices if provided
        if (primitive.indices !== undefined) {
          const indexAccessor = gltfData.accessors[primitive.indices];
          const indexBufferView =
            gltfData.bufferViews[indexAccessor.bufferView];
          const indexBufferOffset = indexBufferView.byteOffset || 0;
          const indexAccessorOffset = indexAccessor.byteOffset || 0;
          const indexByteOffset = indexBufferOffset + indexAccessorOffset;
          const indexExpectedLength =
            indexAccessor.count * getNumComponents(indexAccessor.type);
          const indexTotalBytes =
            indexExpectedLength *
            getComponentTypeSize(indexAccessor.componentType);

          if (
            binBuffer &&
            indexByteOffset + indexTotalBytes > binBuffer.byteLength
          ) {
            throw new Error(
              `Invalid index byteOffset and length: exceeds buffer bounds`,
            );
          }

          let indexArray;
          switch (indexAccessor.componentType) {
            case 5121: // UNSIGNED_BYTE
              indexArray = binBuffer
                ? new Uint8Array(
                    binBuffer,
                    indexByteOffset,
                    indexExpectedLength,
                  )
                : new Uint8Array(indexExpectedLength); // Default to empty array if no binBuffer
              break;
            case 5123: // UNSIGNED_SHORT
              indexArray = binBuffer
                ? new Uint16Array(
                    binBuffer,
                    indexByteOffset,
                    indexExpectedLength,
                  )
                : new Uint16Array(indexExpectedLength); // Default to empty array if no binBuffer
              break;
            case 5125: // UNSIGNED_INT
              // eslint-disable-next-line no-case-declarations
              const indices = binBuffer
                ? new Uint32Array(
                    binBuffer,
                    indexByteOffset,
                    indexExpectedLength,
                  )
                : new Uint32Array(indexExpectedLength); // Default to empty array if no binBuffer
              indexArray = new Uint16Array(indices.length);
              for (let i = 0; i < indices.length; i++) {
                indexArray[i] = indices[i];
              }
              break;
            default:
              throw new Error(
                `Unsupported index component type: ${indexAccessor.componentType}`,
              );
          }

          geometry.setIndices(new BufferAttribute(indexArray, 1));
        }
      });

      const material = new PhongMaterial();
      const mesh = new Mesh(geometry, material);
      mesh.name = node.name || `Node_${index}`;
      mesh.position = position;
      mesh.quaternion = rotation;
      mesh.scale = scale;
      if (scaleDown) {
        mesh.scale.set(0.07, 0.07, 0.07);
      }
      treeNode = mesh;
    } else {
      treeNode = new ObjectTreeNode(node.name || `Node_${index}`);
      treeNode.position = position;
      treeNode.quaternion = rotation;
      treeNode.scale = scale;
    }

    return treeNode;
  });

  // Create hierarchy
  gltfData.nodes.forEach((node, index) => {
    const treeNode = nodes[index];

    if (node.children) {
      node.children.forEach((childIndex: number) => {
        const childNode = nodes[childIndex];
        treeNode.add(childNode);
      });
    }
  });

  return nodes;
}

export async function parseGLTFFromPath(
  gltfPath: string,
  binPath?: string,
  scaleDown?: boolean,
) {
  const gltfResponse = await fetch(gltfPath);
  const gltfData: GLTFImport = await gltfResponse.json();

  let binBuffer: ArrayBuffer | null = null;
  if (binPath) {
    const binResponse = await fetch(binPath);
    binBuffer = await binResponse.arrayBuffer();
  }

  const nodes = gltfData.nodes.map((node, index) => {
    const position = new Vector3(...(node.translation || [0, 0, 0]));
    const rotation = new Quaternion(...(node.rotation || [0, 0, 0, 1]));
    const scale = new Vector3(...(node.scale || [1, 1, 1]));

    // Create either an ObjectTreeNode or a Mesh if the node has a mesh
    let treeNode: ObjectTreeNode;
    if (node.mesh !== undefined) {
      const meshData = gltfData.meshes[node.mesh];
      const geometry = new BufferGeometry();

      meshData.primitives.forEach((primitive: any) => {
        const positionAccessor =
          gltfData.accessors[primitive.attributes.POSITION];
        const positionBufferView =
          gltfData.bufferViews[positionAccessor.bufferView];

        const componentTypeSize = getComponentTypeSize(
          positionAccessor.componentType,
        );
        const numComponents = getNumComponents(positionAccessor.type);
        const bufferViewOffset = positionBufferView.byteOffset || 0;
        const accessorOffset = positionAccessor.byteOffset || 0;
        const byteOffset = bufferViewOffset + accessorOffset;

        // Validate the length
        const expectedLength = positionAccessor.count * numComponents;
        const totalBytes = expectedLength * componentTypeSize;

        // Ensure byteOffset and byteLength are within the bounds of binBuffer
        if (binBuffer && byteOffset + totalBytes > binBuffer.byteLength) {
          throw new Error(
            `Invalid byteOffset and length: exceeds buffer bounds`,
          );
        }

        const positionArray = binBuffer
          ? new Float32Array(binBuffer, byteOffset, expectedLength)
          : new Float32Array(expectedLength); // Default to empty array if no binBuffer

        geometry.setAttribute(
          "position",
          new BufferAttribute(positionArray, numComponents),
        );

        // Parse normals if provided
        if (primitive.attributes.NORMAL !== undefined) {
          const normalAccessor =
            gltfData.accessors[primitive.attributes.NORMAL];
          const normalBufferView =
            gltfData.bufferViews[normalAccessor.bufferView];
          const normalBufferOffset = normalBufferView.byteOffset || 0;
          const normalAccessorOffset = normalAccessor.byteOffset || 0;
          const normalByteOffset = normalBufferOffset + normalAccessorOffset;
          const normalExpectedLength =
            normalAccessor.count * getNumComponents(normalAccessor.type);
          const normalTotalBytes =
            normalExpectedLength *
            getComponentTypeSize(normalAccessor.componentType);

          if (
            binBuffer &&
            normalByteOffset + normalTotalBytes > binBuffer.byteLength
          ) {
            throw new Error(
              `Invalid normal byteOffset and length: exceeds buffer bounds`,
            );
          }

          const normalArray = binBuffer
            ? new Float32Array(
                binBuffer,
                normalByteOffset,
                normalExpectedLength,
              )
            : new Float32Array(normalExpectedLength); // Default to empty array if no binBuffer

          geometry.setAttribute(
            "normal",
            new BufferAttribute(
              normalArray,
              getNumComponents(normalAccessor.type),
            ),
          );
        } else {
          geometry.calculateNormals(); // Calculate normals if not provided
        }

        // Parse indices if provided
        if (primitive.indices !== undefined) {
          const indexAccessor = gltfData.accessors[primitive.indices];
          const indexBufferView =
            gltfData.bufferViews[indexAccessor.bufferView];
          const indexBufferOffset = indexBufferView.byteOffset || 0;
          const indexAccessorOffset = indexAccessor.byteOffset || 0;
          const indexByteOffset = indexBufferOffset + indexAccessorOffset;
          const indexExpectedLength =
            indexAccessor.count * getNumComponents(indexAccessor.type);
          const indexTotalBytes =
            indexExpectedLength *
            getComponentTypeSize(indexAccessor.componentType);

          if (
            binBuffer &&
            indexByteOffset + indexTotalBytes > binBuffer.byteLength
          ) {
            throw new Error(
              `Invalid index byteOffset and length: exceeds buffer bounds`,
            );
          }

          let indexArray;
          switch (indexAccessor.componentType) {
            case 5121: // UNSIGNED_BYTE
              indexArray = binBuffer
                ? new Uint8Array(
                    binBuffer,
                    indexByteOffset,
                    indexExpectedLength,
                  )
                : new Uint8Array(indexExpectedLength); // Default to empty array if no binBuffer
              break;
            case 5123: // UNSIGNED_SHORT
              indexArray = binBuffer
                ? new Uint16Array(
                    binBuffer,
                    indexByteOffset,
                    indexExpectedLength,
                  )
                : new Uint16Array(indexExpectedLength); // Default to empty array if no binBuffer
              break;
            case 5125: // UNSIGNED_INT
              // eslint-disable-next-line no-case-declarations
              const indices = binBuffer
                ? new Uint32Array(
                    binBuffer,
                    indexByteOffset,
                    indexExpectedLength,
                  )
                : new Uint32Array(indexExpectedLength); // Default to empty array if no binBuffer
              indexArray = new Uint16Array(indices.length);
              for (let i = 0; i < indices.length; i++) {
                indexArray[i] = indices[i];
              }
              break;
            default:
              throw new Error(
                `Unsupported index component type: ${indexAccessor.componentType}`,
              );
          }

          geometry.setIndices(new BufferAttribute(indexArray, 1));
        }
      });

      const material = new PhongMaterial();
      const mesh = new Mesh(geometry, material);
      mesh.name = node.name || `Node_${index}`;
      mesh.position = position;
      mesh.quaternion = rotation;
      mesh.scale = scale;
      if (scaleDown) {
        mesh.scale.set(0.07, 0.07, 0.07);
      }
      treeNode = mesh;
    } else {
      treeNode = new ObjectTreeNode(node.name || `Node_${index}`);
      treeNode.position = position;
      treeNode.quaternion = rotation;
      treeNode.scale = scale;
    }

    return treeNode;
  });

  // Create hierarchy
  gltfData.nodes.forEach((node, index) => {
    const treeNode = nodes[index];

    if (node.children) {
      node.children.forEach((childIndex: number) => {
        const childNode = nodes[childIndex];
        treeNode.add(childNode);
      });
    }
  });

  return nodes;
}
