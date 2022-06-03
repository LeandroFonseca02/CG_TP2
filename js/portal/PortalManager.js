import * as THREE from "../three/three.module.js";
import PortalTraveller from "./PortalTraveller.js";
import Portal from "./Portal.js";
import {Vector2} from "../three/three.module.js";


let fullscreenQuadVert = "#version 300 es\n" +
    "in vec2 position;\n" +
    "// out vec2 texcoords; // texcoords are in the normalized [0,1] range for the viewport-filling quad part of the triangle\n" +
    "\n" +
    "void main() {\n" +
    "  gl_Position = vec4(position, 1.0, 1.0);\n" +
    "  // textcoords = 0.5 * gl_Position.xy + vec2(0.5);\n" +
    "}";
let fullscreenQuadFrag = "#version 300 es\n" +
    "precision highp float;\n" +
    "\n" +
    "out vec4 outColor;\n" +
    "\n" +
    "void main() {\n" +
    "  outColor = vec4(1.0, 0, 0, 1.0);\n" +
    "}";

class PortalManager {
  constructor(canvas,scene, renderer,camera) {

    /* ----- OPTIONS ----- */
    this.maxPortalRecursion = 2;
    this.destinationNearPlaneOffset = 0.02;
    this.destinationObliqueCutoff = 0.009;
    this.renderPortals = true;
    this.portalTeleporting = true;
    this._doubleSidedPortals = false;
    this.drawPortalCameras = false;
    this.drawPortalColliders = false;
    this.frustumCullPortals = true;
    this.portalObliqueViewFrustum = true;

    this._cameraNearDistance = 0.005;

    /* ----- OBJECTS ----- */
    this.scene = scene;

    this.camera = camera

    this._tempCamera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      this._cameraNearDistance,
      50
    );
    // Since we'll be updating tempCamera matrices anyway, no need for auto updates
    this._tempCamera.matrixAutoUpdate = false;

    this.renderer = renderer;
    this.screenSize = new Vector2(canvas.clientWidth,canvas.clientHeight);

    if (this.scene.background) this.scene.background = null;

    this._clock = new THREE.Clock();

    this._portalColliderHelper = new THREE.Box3Helper(
      new THREE.Box3(),
      "#00ff00"
    );
    this._portalColliderHelper.matrixAutoUpdate = false;
    this._portalCameraHelpers = [];
    this._portalCameras = []; // These cameras are just used for the camera helpers, not in the actual rendering
    this._portals = [];
    this._portalPrimitives = [];
    this._travellers = [new PortalTraveller(this.camera)];
    this._tempGroup = new THREE.Group();
    this._tempGroup.matrixAutoUpdate = false;


    // Quad rendered as scene background
    const fullScreenQuadGeometry = new THREE.BufferGeometry();
    const vertices = [-1, -1, 3, -1, -1, 3];
    fullScreenQuadGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 2)
    );

    this.fullScreenQuad = new THREE.Mesh(
      fullScreenQuadGeometry,
      new THREE.RawShaderMaterial({
        vertexShader: fullscreenQuadVert,
        fragmentShader: fullscreenQuadFrag,
        // colorWrite: false,
      })
    );
    this.fullScreenQuad.frustumCulled = false;

    this.orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  get cameraNearDistance() {
    return this._cameraNearDistance;
  }
  set cameraNearDistance(value) {
    this._cameraNearDistance = value;
    this.camera.near = value;
    this._tempCamera.near = value;
    this.camera.updateProjectionMatrix();
    this._tempCamera.updateProjectionMatrix();
  }

  get doubleSidedPortals() {
    return this._doubleSidedPortals;
  }
  set doubleSidedPortals(value) {
    if (value !== true && value !== false) {
      console.error("'doubleSidedPortals' expects a boolean value");
      return;
    }
    this._doubleSidedPortals = value;

    // Update each portal
    // NOTE: Might be more efficient to just use one static, shared material across every portal (although this would make them less flexible)
    for (let i = 0; i < this._portals.length; i++) {
      this._portals[i].doubleSided = value;
    }
  }

  getPortals() {
    return this._portals;
  }

  extractPortalsFromObject(object) {
    const portalMap = new Map();
    // Find and create portals
    object.traverse((obj) => {
      if (obj.type === "Group") return;
      if (obj.name.length >= 2 && obj.name.substring(0, 2) === "p_") {
        const portal = new Portal(obj, {
          doubleSided: this.doubleSidedPortals,
        });
        portalMap.set(obj.name, portal);
      }
    });

    // Assign destinations
    portalMap.forEach((portal) => {
      if (
        !portal.mesh.userData ||
        portal.mesh.userData.destination === undefined
      ) {
        console.warn("Portal missing destination");
        return;
      }
      portal.destination = portalMap.get(portal.mesh.userData.destination);
    });

    this.setPortals([...portalMap.values()]);
  }

  setPortals(portals) {
    // Make shallow copy
    this._portals = [...portals];
    this._portalPrimitives = [];
    for (let i = 0; i < portals.length; i++) {
      this._portalPrimitives.push(portals[i].mesh);
    }

    for (let i = 0; i < this._travellers.length; i++) {
      this._travellers[i].setPortals(this._portals);
    }

    // Remove previous helpers
    for (let i = 0; i < this._portalCameraHelpers.length; i++) {
      this.scene.remove(this._portalCameraHelpers[i]);
    }

    this._portalCameraHelpers = [];
    this._portalCameras = [];
    for (let i = 0; i < this._portals.length; i++) {
      const canvas = this.renderer.domElement;
      const cam = new THREE.PerspectiveCamera(
        75,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        10
      );
      const helper = new THREE.CameraHelper(cam);
      helper.visible = false;
      this.scene.add(helper);
      this._portalCameraHelpers.push(helper);
      this._portalCameras.push(cam);
    }

    return this._portals;
  }

  update() {
    this.deltaTime = this._clock.getDelta(); // Get time since last frame

    if (this._resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
      this._tempCamera.aspect = canvas.clientWidth / canvas.clientHeight;
      this._tempCamera.updateProjectionMatrix();

      this.renderer.getSize(this.screenSize);
    }

    for (let i = 0; i < this._portals.length; i++) {
      this._portals[i].update();
    }

    if (this.portalTeleporting) {
      for (let i = 0; i < this._travellers.length; i++) {
        this._travellers[i].update(this._portals);
      }
    }
  }

  render() {
    this.renderer.clear();
    if (this.renderPortals) {
      this._recursivePortalRender(
        this.camera.matrixWorld,
        this.camera.matrixWorldInverse,
        this.camera.projectionMatrix,
        0,
        null
      );
    } else {
      this._draw(
        this.scene,
        this.camera.matrixWorld,
        this.camera.projectionMatrix
      );
    }

    if (this.drawPortalCameras) {
      this._debugDrawPortalCameras();
    }
    if (this.drawPortalColliders) {
      this._debugDrawPortalColliders();
    }
    this.renderer.info.reset();
  }

  _recursivePortalRender(
    cameraWorldMatrix,
    cameraWorldMatrixInverse,
    cameraProjectionMatrix,
    recursionLevel,
    skipPortal = null
  ) {
    const gl = this.renderer.getContext();
    // Enable writing to depth/color buffers
    gl.colorMask(false, false, false, false);
    // Enable stencil
    gl.enable(gl.STENCIL_TEST);
    // Disable writing to stencil
    gl.stencilMask(0);
    // Only draw in areas where stencil value == recursionLevel
    gl.stencilFunc(gl.EQUAL, recursionLevel, 0xff);
    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);

    // Render each portal to depth buffer
    this._drawMultiple(
      this._portalPrimitives,
      cameraWorldMatrix,
      cameraProjectionMatrix,
      skipPortal ? [skipPortal.mesh] : undefined
    );

    gl.colorMask(true, true, true, true);

    this._draw(
      this.scene,
      cameraWorldMatrix,
      cameraProjectionMatrix,
      this._portalPrimitives
    );

    // Base case - max recursion level reached
    if (recursionLevel === this.maxPortalRecursion) return;

    // Update frustum
    const projScreenMatrix = cameraWorldMatrixInverse
      .clone()
      .premultiply(cameraProjectionMatrix);
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(projScreenMatrix);

    for (let i = 0; i < this._portals.length; i++) {
      const portal = this._portals[i];

      if (portal === skipPortal) continue;

      // Check if portal is visible from camera. If not, skip it
      if (this.frustumCullPortals && !frustum.intersectsObject(portal.mesh)) {
        continue;
      }

      // Increment stencil buffer within visible portal frame
      gl.enable(gl.DEPTH_TEST);
      gl.colorMask(false, false, false, false);
      gl.stencilMask(0xff);
      gl.depthMask(false);
      gl.stencilFunc(gl.EQUAL, recursionLevel, 0xff);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
      gl.depthFunc(gl.EQUAL);
      this._draw(portal.mesh, cameraWorldMatrix, cameraProjectionMatrix);

      // Clear depth buffer within portal frame (where stencil buffer was just incremented)
      gl.stencilMask(0);
      gl.stencilFunc(gl.EQUAL, recursionLevel + 1, 0xff);
      gl.depthMask(true);
      gl.depthFunc(gl.ALWAYS);
      this._draw(
        this.fullScreenQuad,
        this.orthographicCamera.matrixWorld,
        this.orthographicCamera.projectionMatrix
      );

      // Now generate view matrix for portal destination
      const destWorldMatrix = portal.destinationTransform
        .clone()
        .multiply(cameraWorldMatrix);
      const destWorldMatrixInverse = destWorldMatrix.clone().invert();

      // Render from destination view
      this._recursivePortalRender(
        destWorldMatrix,
        destWorldMatrixInverse,
        this.portalObliqueViewFrustum
          ? portal.destination.getAlignedProjectionMatrix(
              destWorldMatrix,
              destWorldMatrixInverse,
              cameraProjectionMatrix,
              this.destinationNearPlaneOffset,
              this.destinationObliqueCutoff
            )
          : cameraProjectionMatrix,
        recursionLevel + 1,
        portal.destination // We can skip rendering the portal destination when drawing from its perspective
      );

      // Now we decrement stencil buffer to cleanup the incremented values.
      // This is necessary so stencil values relative to this portal are reset for the next portal in the for-loop

      // Disable color writing
      gl.colorMask(false, false, false, false);
      gl.disable(gl.DEPTH_TEST);
      gl.depthMask(false);
      // Enable stencil test/writing
      gl.enable(gl.STENCIL_TEST);
      gl.stencilMask(0xff);
      // Fail when inside this portals frame
      gl.stencilFunc(gl.NOTEQUAL, recursionLevel + 1, 0xff);
      // Decrement regardless of depth test
      gl.stencilOp(gl.DECR, gl.KEEP, gl.KEEP);

      this._draw(portal.mesh, cameraWorldMatrix, cameraProjectionMatrix);
    }

    // Reset values
    gl.colorMask(true, true, true, true);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);
    gl.disable(gl.STENCIL_TEST);
    gl.stencilMask(0);
  }

  _draw(object, cameraWorldMatrix, cameraProjectionMatrix, hideObjects) {
    // NOTE: no need to manually update camera.matrixWorldInverse since the renderer will automatically do that
    this._tempCamera.matrixWorld.copy(cameraWorldMatrix);

    this._tempCamera.projectionMatrix = cameraProjectionMatrix;
    this._tempCamera.projectionMatrixInverse
      .copy(cameraProjectionMatrix)
      .invert();

    if (hideObjects !== undefined) {
      for (let i = 0; i < hideObjects.length; i++) {
        if (hideObjects[i].visible === false)
          console.warn(
            "Object in 'hideObjects' is already hidden and is being unhidden by _draw call"
          );
        hideObjects[i].visible = false;
      }
    }
    this.renderer.render(object, this._tempCamera);
    if (hideObjects !== undefined) {
      for (let i = 0; i < hideObjects.length; i++) {
        hideObjects[i].visible = true;
      }
    }
  }

  // Draw multiple objects. Sets 'objects' to be children of temp group and then calls normal _draw func on that group
  _drawMultiple(
    objects,
    cameraWorldMatrix,
    cameraProjectionMatrix,
    hideObjects
  ) {
    this._tempGroup.children = objects;
    this._draw(
      this._tempGroup,
      cameraWorldMatrix,
      cameraProjectionMatrix,
      hideObjects
    );
  }

  _debugDrawPortalColliders() {
    const helper = this._portalColliderHelper;
    for (let i = 0; i < this._portals.length; i++) {
      const portal = this._portals[i];
      helper.box = portal.globalCollisionBox.clone();
      helper.updateMatrix();
      helper.updateMatrixWorld(true);
      this.renderer.render(helper, this.camera);
    }
  }

  // TODO: It should be possible to render each camera helper using one camera (and one helper).
  // However for some reason this results in only the last helper in the list being drawn
  _debugDrawPortalCameras() {
    const inverseProjection = this.camera.projectionMatrixInverse.clone();
    for (let i = 0; i < this._portals.length; i++) {
      const portal = this._portals[i];
      const destWorldMatrix = portal.destinationTransform
        .clone()
        .multiply(this.camera.matrixWorld);
      const cam = this._portalCameras[i];
      cam.matrixWorld.copy(destWorldMatrix);
      cam.projectionMatrixInverse = inverseProjection;
      const helper = this._portalCameraHelpers[i];
      helper.update();
      helper.visible = true;
      this.renderer.render(helper, this.camera);
      helper.visible = false;
    }
    // const inverseProjection = this.camera.projectionMatrixInverse.clone();
    // const helper = this._testCameraHelper;
    // for (let i = 0; i < this._portals.length; i++) {
    //   const portal = this._portals[i];
    //   const destWorldMatrix = portal.getDestCameraWorldMatrix(
    //     this.camera.matrixWorld
    //   );
    //   this._tempCamera.matrixWorld.copy(destWorldMatrix);
    //   this._tempCamera.projectionMatrixInverse.copy(inverseProjection);
    //   helper.update();
    //   this.renderer.render(helper, this.camera);
    // }
  }

  _resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = (canvas.clientWidth * pixelRatio) | 0;
    const height = (canvas.clientHeight * pixelRatio) | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
}

export default PortalManager;