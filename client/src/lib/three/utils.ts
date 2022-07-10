import type { Object3D } from 'three';

export function consoleObject3D(object: Object3D, message?: string) {
  if (message) {
    console.log(message);
  }
  console.log({
    x: object.position.x,
    y: object.position.y,
    z: object.position.z,
    rx: object.rotation.x,
    ry: object.rotation.y,
    rz: object.rotation.z,
  });
}
