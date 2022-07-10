import { World } from './World';
import { ThreeRendererSystem } from './systems/ThreeRenderer';
import { ThreeSceneSystem } from './systems/ThreeScene';
import type { ComponentTypes } from './components';
import { ThreeLoaderSystem } from './systems/ThreeLoader';
import { createScene } from './scene';
import { PlayerControllerSystem } from './systems/PlayerController';
import { connection } from '../../state';
import { MultiplayerSystem } from './systems/MultiplayerSystem';
import { Animator } from './systems/Animator';

export async function start() {
  const { scene, ground } = createScene();

  const renderer = new ThreeRendererSystem(scene, ground);
  const world = new World<ComponentTypes>([
    new ThreeSceneSystem(scene),
    new ThreeLoaderSystem(),
    new PlayerControllerSystem(renderer, scene),
    new Animator(),
    new MultiplayerSystem(connection),
    renderer,
  ]);

  world.animate();

  (window as any).world = world;
}
