import { ObjectTreeNode } from "../object/ObjectTreeNode";

// Created to prevent circular dependency
export function isMesh(node: ObjectTreeNode) {
  return "geometry" in node;
}

export function isLight(node: ObjectTreeNode) {
  return "color" in node;
}

export function isCamera(node: ObjectTreeNode) {
  return "_projectionMatrix" in node;
}

export function isPureObject(node: ObjectTreeNode) {
  return !isMesh(node) && !isLight(node) && !isCamera(node);
}
