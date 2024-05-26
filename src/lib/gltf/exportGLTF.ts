import { ObjectTreeNode } from "../object/ObjectTreeNode";
import { Mesh } from "../object/Mesh";
import { BufferAttribute } from "../geometry/BufferAttribute";
import { encode } from "base64-arraybuffer";

interface GLTFExport {
  asset: {
    version: string;
  };
  scenes: Array<{ nodes: number[] }>;
  nodes: Array<any>;
  meshes: Array<any>;
  accessors: Array<any>;
  bufferViews: Array<any>;
  buffers: Array<any>;
}

export default function exportGLTF(root: ObjectTreeNode) {
  const gltf: GLTFExport = {
    asset: {
      version: "2.0",
    },
    scenes: [{ nodes: [] }],
    nodes: [],
    meshes: [],
    accessors: [],
    bufferViews: [],
    buffers: [],
  };

  const bufferData: Uint8Array[] = [];
  const nodeIndexMap = new Map<ObjectTreeNode, number>();
  let totalBufferLength = 0;
  const CHUNK_SIZE = 1024 * 1024; // 1 MB chunk size for buffer data

  function alignTo4Bytes(offset: number): number {
    return Math.ceil(offset / 4) * 4;
  }

  function addAccessor(attribute: BufferAttribute, name: string): number {
    const bufferViewIndex = addBufferView(attribute, name);
    const accessorIndex = gltf.accessors.length;

    const accessor = {
      bufferView: bufferViewIndex,
      componentType: attribute.dtype,
      count: attribute.count,
      type: getGLTFType(attribute.size),
      max: getMax(attribute),
      min: getMin(attribute),
    };

    gltf.accessors.push(accessor);
    return accessorIndex;
  }

  function addBufferView(attribute: BufferAttribute, name: string): number {
    const alignedOffset = alignTo4Bytes(totalBufferLength);
    const padding = alignedOffset - totalBufferLength;
    if (padding > 0) {
      bufferData.push(new Uint8Array(padding));
      totalBufferLength = alignedOffset;
    }

    const byteOffset = totalBufferLength;
    const byteLength = attribute.data.byteLength;
    const buffer = new Uint8Array(
      attribute.data.buffer,
      attribute.data.byteOffset,
      byteLength,
    );

    // Split buffer into chunks if it exceeds CHUNK_SIZE
    let chunkOffset = 0;
    while (chunkOffset < buffer.length) {
      const chunkSize = Math.min(CHUNK_SIZE, buffer.length - chunkOffset);
      const chunk = buffer.slice(chunkOffset, chunkOffset + chunkSize);
      bufferData.push(chunk);
      chunkOffset += chunkSize;
    }

    totalBufferLength += byteLength;

    const target = name === "indices" ? 34963 : 34962; // 34963 for ELEMENT_ARRAY_BUFFER, 34962 for ARRAY_BUFFER

    const bufferView = {
      buffer: 0,
      byteOffset,
      byteLength,
      target,
    };

    const bufferViewIndex = gltf.bufferViews.length;
    gltf.bufferViews.push(bufferView);
    return bufferViewIndex;
  }

  function getGLTFType(size: number): string {
    switch (size) {
      case 1:
        return "SCALAR";
      case 2:
        return "VEC2";
      case 3:
        return "VEC3";
      case 4:
        return "VEC4";
      default:
        throw new Error(`Unsupported attribute size: ${size}`);
    }
  }

  function getMax(attribute: BufferAttribute): number[] {
    const data = attribute.data;
    const size = attribute.size;
    const max = Array(size).fill(-Infinity);

    for (let i = 0; i < data.length; i += size) {
      for (let j = 0; j < size; j++) {
        max[j] = Math.max(max[j], data[i + j]);
      }
    }

    return max;
  }

  function getMin(attribute: BufferAttribute): number[] {
    const data = attribute.data;
    const size = attribute.size;
    const min = Array(size).fill(Infinity);

    for (let i = 0; i < data.length; i += size) {
      for (let j = 0; j < size; j++) {
        min[j] = Math.min(min[j], data[i + j]);
      }
    }

    return min;
  }

  function processNodeIteratively(root: ObjectTreeNode): number | null {
    const queue: ObjectTreeNode[] = [root];
    const parentMap = new Map<ObjectTreeNode, ObjectTreeNode | null>();
    const childIndicesMap = new Map<ObjectTreeNode, number[]>();

    while (queue.length > 0) {
      const node = queue.shift()!;
      const gltfNode: any = {
        name: node.name,
        translation: node.position.toArray(),
        rotation: node.quaternion.toArray(),
        scale: node.scale.toArray(),
      };

      if (node instanceof Mesh) {
        const geometry = node.geometry;
        const gltfMesh = {
          primitives: [
            {
              attributes: {} as { [key: string]: number },
              indices: undefined as number | undefined,
            },
          ],
        };

        for (const [name, attribute] of Object.entries(geometry.attributes)) {
          const accessorIndex = addAccessor(attribute, name);
          gltfMesh.primitives[0].attributes[name.toUpperCase()] = accessorIndex;
        }

        if (geometry.indices) {
          let indices = geometry.indices;

          // Convert indices to UNSIGNED_SHORT if necessary
          if (
            indices.dtype !== WebGLRenderingContext.UNSIGNED_BYTE &&
            indices.dtype !== WebGLRenderingContext.UNSIGNED_SHORT &&
            indices.dtype !== WebGLRenderingContext.UNSIGNED_INT
          ) {
            const indexData = new Uint16Array(indices.data.length);
            for (let i = 0; i < indices.data.length; i++) {
              indexData[i] = indices.data[i];
            }
            indices = new BufferAttribute(indexData, 1, {
              dtype: WebGLRenderingContext.UNSIGNED_SHORT,
            });
          }

          const accessorIndex = addAccessor(indices, "indices");
          gltfMesh.primitives[0].indices = accessorIndex;
        }

        const meshIndex = gltf.meshes.length;
        gltf.meshes.push(gltfMesh);
        gltfNode.mesh = meshIndex;
      }

      if (node.children.length > 0) {
        childIndicesMap.set(node, []);
        for (const child of node.children) {
          parentMap.set(child, node);
          queue.push(child);
        }
      }

      const nodeIndex = gltf.nodes.length;
      nodeIndexMap.set(node, nodeIndex);
      gltf.nodes.push(gltfNode);

      const parentNode = parentMap.get(node);
      if (parentNode) {
        childIndicesMap.get(parentNode)!.push(nodeIndex);
      }
    }

    for (const [node, indices] of childIndicesMap) {
      if (indices.length > 0) {
        const nodeIndex = nodeIndexMap.get(node)!;
        gltf.nodes[nodeIndex].children = indices;
      }
    }

    return nodeIndexMap.get(root) ?? null;
  }

  const rootNodeIndex = processNodeIteratively(root);
  if (rootNodeIndex !== null) {
    gltf.scenes[0].nodes.push(rootNodeIndex);
  }

  // Ensure the root node is the first element
  if (rootNodeIndex !== null && rootNodeIndex !== 0) {
    const rootNode = gltf.nodes.splice(rootNodeIndex, 1)[0];
    gltf.nodes.unshift(rootNode);

    // Update indices in the children to reflect the new position of the root node
    for (const node of gltf.nodes) {
      if (node.children) {
        node.children = node.children.map((childIndex: number) =>
          childIndex === rootNodeIndex ? 0 : childIndex + 1,
        );
      }
    }

    // Update scene node index to 0
    gltf.scenes[0].nodes = gltf.scenes[0].nodes.map((nodeIndex) =>
      nodeIndex === rootNodeIndex ? 0 : nodeIndex + 1,
    );
  }

  const binaryBuffer = new Uint8Array(totalBufferLength);
  let offset = 0;
  try {
    for (const buffer of bufferData) {
      binaryBuffer.set(buffer, offset);
      offset += buffer.byteLength;
    }
  } catch (e) {
    throw new Error(`Error combining buffer chunks: ${e}`);
  }

  gltf.buffers.push({
    byteLength: totalBufferLength,
    uri: "data:application/octet-stream;base64," + encode(binaryBuffer.buffer),
  });

  let gltfBlob, binBlob;
  try {
    gltfBlob = new Blob([JSON.stringify(gltf)], {
      type: "application/json",
    });
    binBlob = new Blob([binaryBuffer], {
      type: "application/octet-stream",
    });
  } catch (e) {
    throw new Error(`Error creating blobs: ${e}`);
  }

  let gltfUrl, binUrl;
  try {
    gltfUrl = URL.createObjectURL(gltfBlob);
    binUrl = URL.createObjectURL(binBlob);
  } catch (e) {
    throw new Error(`Error creating URLs: ${e}`);
  }

  try {
    const gltfLink = document.createElement("a");
    gltfLink.href = gltfUrl;
    gltfLink.download = root.name.replace(/\s/g, "_") + ".gltf";
    gltfLink.click();

    const binLink = document.createElement("a");
    binLink.href = binUrl;
    binLink.download = root.name.replace(/\s/g, "_") + ".bin";
    binLink.click();
  } catch (e) {
    throw new Error(`Error creating download links: ${e}`);
  }

  return {
    gltf,
    binaryBuffer,
  };
}
