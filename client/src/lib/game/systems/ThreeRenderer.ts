import type { Entity } from '../Entity';
import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Mesh,
  AxesHelper,
} from 'three';
import WebGL from 'three/examples/jsm/capabilities/WebGL';
import type { System } from '../System';
import type { World } from '../World';
import MeshReflectorMaterial from '../../three/MeshReflectorMaterial';

export type SupportedComponents = {};

export class ThreeRendererSystem implements System<SupportedComponents> {
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;

  constructor(protected scene: Scene, protected ground?: Mesh) {
    this.renderer = new WebGLRenderer({
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    const container = document.querySelector('#scene-container');
    container.appendChild(this.renderer.domElement);

    const camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      20000,
    );

    ground.material = new MeshReflectorMaterial(
      this.renderer,
      camera,
      scene,
      ground,
      {
        mirror: 0.2,
        resolution: 512,
        mixStrength: 5,
        blur: [1, 1],
        // planeNormal: new Vector3(0, 1, 0),
        // reflectorOffset: 10
      },
    );

    this.camera = camera;

    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    if (WebGL.isWebGLAvailable()) {
    } else {
      const warning = WebGL.getWebGLErrorMessage();
      document.body.appendChild(warning);
      this.renderer.domElement.style.display = 'none';
    }

    const axesHelper = new AxesHelper(5);
    // this.scene.add(axesHelper);
  }

  init(world: World<SupportedComponents>) {}

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }

  private render() {
    (this.ground.material as any).update();
    this.renderer.render(this.scene, this.camera);
  }

  async onEntityAdded(entity: Entity<SupportedComponents>) {}

  onEntityRemoved(entity: Entity<SupportedComponents>) {}

  onComponentAdded(
    entity: Entity<SupportedComponents>,
    component: Entity<SupportedComponents>,
  ) {}

  onComponentRemoved(
    entity: Entity<SupportedComponents>,
    component: Entity<SupportedComponents>,
  ) {}

  update(delta: number) {
    this.render();
  }
}
