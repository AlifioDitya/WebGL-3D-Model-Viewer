import { ObjectTreeNode } from "../object/ObjectTreeNode";
import { useMemo } from "react";

const memoizeFindObjectInTree = () => {
  const cache = new Map<string, ObjectTreeNode>();
  return (uuid: string, tree: ObjectTreeNode[]) => {
    const cacheKey = JSON.stringify({ uuid, tree });
    const cacheVal = cache.get(cacheKey);
    if (cacheVal && !cacheVal.dead) {
      return cacheVal;
    }

    const find = (
      uuid: string,
      tree: ObjectTreeNode[],
    ): ObjectTreeNode | null => {
      for (let i = 0; i < tree.length; i++) {
        if (tree[i].uuid === uuid) {
          return tree[i];
        } else {
          const found = find(uuid, tree[i].children);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    const result = find(uuid, tree);
    if (result) {
      cache.set(cacheKey, result);
    }
    return result;
  };
};

export const useFindObjectInTree = () => {
  return useMemo(memoizeFindObjectInTree, []);
};
