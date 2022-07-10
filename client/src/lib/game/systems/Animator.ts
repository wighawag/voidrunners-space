import type { Entity, EntityWithComponent } from '../Entity';
import type { CAnimation, CObject3D, CPosition } from '../components';
import type { System } from '../System';
import { removeIfPresent } from '../../utils/array';
import type { World } from '../World';

export type SupportedComponents = CAnimation & (CObject3D & CPosition);

export class Animator implements System<SupportedComponents> {
  protected animatables: CAnimation[] = [];
  protected positionables: (CPosition & CObject3D)[] = [];

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
    this.handleAddition(entity, component);
  }

  onComponentRemoved(
    entity: Entity<SupportedComponents>,
    component: Entity<SupportedComponents>,
  ) {
    if (component.animation || component.object3D || component.position) {
      this.handleDeletion(entity, component);
    }
  }

  async handleAddition(
    entity: EntityWithComponent<SupportedComponents>,
    component: EntityWithComponent<SupportedComponents>,
  ) {
    if (component.animation) {
      this.animatables.push(entity as CAnimation);
    }
    if (component.object3D || component.position) {
      if (entity.object3D && entity.position) {
        this.positionables.push(entity as CObject3D & CPosition);
      }
    }
  }

  async handleDeletion(
    entity: EntityWithComponent<SupportedComponents>,
    component: EntityWithComponent<SupportedComponents>,
  ) {
    if (!entity.animation) {
      removeIfPresent(this.animatables, entity);
    }
    if (!(entity.object3D && entity.position)) {
      removeIfPresent(this.positionables, entity);
    }
  }

  update(delta: number) {
    for (const entity of this.animatables) {
      entity.animation.update(delta);
    }

    for (const entity of this.positionables) {
      entity.object3D.position.lerp(entity.position.position, 0.1);
      entity.object3D.quaternion.slerp(entity.position.quaternion, 0.1);
      // entity.object3D.lookAt(pos);
      // TODO lerp // or lerp in another comm
    }
  }
}
