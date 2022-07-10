import type { Entity, EntityWithComponent } from '../Entity';
import type { CAnimation, CObject3D, CPlayer, CPosition } from '../components';
import type { System } from '../System';
import type { ThreeRendererSystem } from './ThreeRenderer';
import type { World } from '../World';
import { Controller, type State } from '../../three/controls/Controller';
import {
  Quaternion,
  type Object3D,
  Vector3,
  Mesh,
  BoxBufferGeometry,
  MeshBasicMaterial,
  Color,
  Scene,
} from 'three';
import { consoleObject3D } from '../../three/utils';

export type SupportedComponents = CPlayer &
  CPosition &
  Partial<CAnimation> &
  CObject3D;

const X_AXIS = new Vector3(1, 0, 0);
const Y_AXIS = new Vector3(0, 1, 0);
const Z_AXIS = new Vector3(0, 0, -1);

export class PlayerControllerSystem implements System<SupportedComponents> {
  protected controlled: SupportedComponents | undefined;

  protected requireCameraSync: boolean;
  protected controller: Controller;

  constructor(protected renderer: ThreeRendererSystem, scene: Scene) {
    this.controller = new Controller();
    this.controller.start();
    // TODO setup somewhere else ?
    const camera = this.renderer.camera;
    // scene.add(camera);
    // camera.add(
    //   new Mesh(
    //     new BoxBufferGeometry(1, 1, 1),
    //     new MeshBasicMaterial({ color: new Color(0xff0000) }),
    //   ),
    // );
    // camera.position.set(0, 6, -8);
    // consoleObject3D(camera, 'init');
    // console.log(camera.up);
    // camera.lookAt(0, 0, 0);
    // console.log(camera.up);
    // consoleObject3D(camera, 'init');
    this.renderer.camera.position.set(10, 20, -50);
    this.renderer.camera.lookAt(0, 4, 0);
  }

  init(world: World<SupportedComponents>) {}

  async onEntityAdded(entity: Entity<SupportedComponents>) {
    this.handleAddition(entity, entity);
  }

  onEntityRemoved(entity: Entity<SupportedComponents>) {
    this.handleDeletion(entity, entity);
  }

  onComponentAdded(
    entity: Entity<SupportedComponents>,
    component: Entity<SupportedComponents>,
  ) {
    console.log(`component`, component);
    this.handleAddition(entity, component);
  }

  onComponentRemoved(
    entity: Entity<SupportedComponents>,
    component: Entity<SupportedComponents>,
  ) {
    this.handleDeletion(entity, component);
  }

  async handleAddition(
    entity: EntityWithComponent<SupportedComponents>,
    component: EntityWithComponent<SupportedComponents>,
  ) {
    if (entity.player && entity.position && entity.object3D) {
      console.log(`player found!`, entity);
      this.controlled = entity as SupportedComponents;
      // this.controlled.position.position.set(0, 0, 0);
      // this.controlled.position.rotation.set(0, 0, 0);

      // const touchControls = new TouchControls(
      //   this.renderer.renderer.domElement.parentElement,
      //   this.renderer.renderer.domElement,
      //   this.renderer.camera.object,
      //   { hitTest: false }, // if true need to add to scene
      // );

      // this.playerControls = touchControls;
    }
  }

  async handleDeletion(
    entity: EntityWithComponent<SupportedComponents>,
    component: EntityWithComponent<SupportedComponents>,
  ) {
    if (this.controlled && this.controlled === entity) {
      this.controlled = undefined;
    }
  }

  updatePosition(object: Object3D, state: State, dt: number): boolean {
    const moving = state.pad1.y !== 0;
    if (moving) {
      const forward = new Vector3(0, 0, 1);
      forward.applyQuaternion(object.quaternion);
      forward.normalize();
      forward.multiplyScalar(dt * 12 * -state.pad1.y); // TODO did not get why but need to negate ?
      object.position.add(forward);
    }
    return moving;
  }

  updateQuaternion(object: Object3D, state: State, dt: number) {
    const Q = new Quaternion(); // tmp quaternion to compute changes of rotation based on turn
    const R = object.quaternion.clone(); // current rotation as quaternion

    if (state.pad2.y) {
      Q.setFromAxisAngle(X_AXIS, dt * 0.8 * -state.pad2.y);
      R.multiply(Q);
    }
    if (state.pointer.y) {
      Q.setFromAxisAngle(X_AXIS, dt * 0.8 * state.pointer.y * 2);
      R.multiply(Q);
    }

    if (state.pad2.x) {
      Q.setFromAxisAngle(Y_AXIS, dt * 0.8 * -state.pad2.x);
      R.multiply(Q);
    }

    if (state.pointer.x) {
      Q.setFromAxisAngle(Y_AXIS, dt * 0.8 * -state.pointer.x * 2);
      R.multiply(Q);
    }

    if (state.pad1.x) {
      Q.setFromAxisAngle(Z_AXIS, dt * 0.8 * state.pad1.x);
      R.multiply(Q);
    }
    object.quaternion.copy(R);
  }

  relative(target: Object3D, offset: Vector3) {
    const off = offset.clone();
    off.applyQuaternion(target.quaternion);
    off.add(target.position);
    return off;
  }
  update(dt: number) {
    const state = this.controller.state;
    const camera = this.renderer.camera;
    if (this.controlled) {
      const player = this.controlled.position;

      // if (state.pad1.y !== 0) {
      //   this.updateQuaternion(player, state, dt);
      //   this.updatePosition(player, state, dt);
      // }

      const moveVector = new Vector3();
      moveVector.x = state.pad2.x;
      moveVector.y = state.pad2.y;
      moveVector.z = state.pad1.y < 0 ? -state.pad1.y * 4 : -state.pad1.y * 10;

      const rotationVector = new Vector3();
      rotationVector.x = state.pointer.y; // pitch
      rotationVector.y = -state.pointer.x; // yaw
      rotationVector.z = -state.pad1.x / 2; // roll

      const tmpQuaternion = new Quaternion();
      tmpQuaternion
        .set(
          rotationVector.x * dt,
          rotationVector.y * dt,
          rotationVector.z * dt,
          1,
        )
        .normalize();
      player.quaternion.multiply(tmpQuaternion);

      player.translateX(moveVector.x * dt);
      player.translateY(moveVector.y * dt);
      player.translateZ(moveVector.z * dt);

      if (!moveVector.equals(new Vector3())) {
        if (player.position.y < 7) {
          moveVector.y = 1;
        }
      }

      if (player.position.y < 1) {
        player.position.y = 1;
      }

      if (player.position.x < -20) {
        player.position.x = -20;
      }

      if (player.position.x > 20) {
        player.position.x = 20;
      }

      if (player.position.z < -20) {
        player.position.z = -20;
      }

      if (player.position.z > 20) {
        player.position.z = 20;
      }

      if (player.position.y > 41) {
        player.position.y = 41;
      }

      // if (
      // 	lastPosition.distanceToSquared( scope.object.position ) > EPS ||
      // 	8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS
      // ) {

      // 	scope.dispatchEvent( _changeEvent );
      // 	lastQuaternion.copy( scope.object.quaternion );
      // 	lastPosition.copy( scope.object.position );

      // }

      // player.position.set(0, 0, 0);
      // player.rotation.set(0, 0, 0);

      const cameraPosition = this.relative(player, new Vector3(0, 2, 7));
      if (cameraPosition.y < 1) {
        cameraPosition.y = 1;
      }
      // const cameraLookAt = this.relative(player, new Vector3(0, 0, -7));

      camera.position.copy(cameraPosition);
      // camera.lookAt(cameraLookAt);
      // camera.up = player.up;
      camera.rotation.copy(player.rotation);
    } else {
      this.updateQuaternion(camera, state, dt);
      this.updatePosition(camera, state, dt);

      if (camera.position.y < 1) {
        camera.position.y = 1;
      }

      // ----------------------------------------------------------------------------------------------
      // BASIC
      // ----------------------------------------------------------------------------------------------
      // const Q = new Quaternion(); // tmp quaternion to compute changes of rotation based on turn
      // const R = camera.quaternion.clone(); // current rotation as quaternion

      // const turn = state.pad1.x;
      // if (Math.abs(turn) > 0.1) {
      //   // TODO anim
      // }
      // if (turn > 0) {
      //   Q.setFromAxisAngle(Y_AXIS, -dt);
      //   R.multiply(Q);
      //   camera.quaternion.copy(R);
      //   consoleObject3D(camera, 'turn positive');
      // } else if (turn < 0) {
      //   Q.setFromAxisAngle(Y_AXIS, dt);
      //   R.multiply(Q);
      //   camera.quaternion.copy(R);
      //   consoleObject3D(camera, 'turn negative');
      // }

      // if (state.pad1.y !== 0) {
      //   const forward = new Vector3(0, 0, 1);
      //   forward.applyQuaternion(camera.quaternion);
      //   forward.normalize();
      //   forward.multiplyScalar(dt * 30 * -state.pad1.y); // TODO did not get why but need to negate ?
      //   camera.position.add(forward);
      //   consoleObject3D(camera, 'forward');
      // }
      // ----------------------------------------------------------------------------------------------
    }
  }
}
