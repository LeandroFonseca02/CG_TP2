import * as THREE from "../three/three.module.js";
import Utils from "./PortalUtils.js";

const _vector1 = new THREE.Vector3();
const _vector2 = new THREE.Vector3();
const _vector3 = new THREE.Vector3();

class PortalTraveller {
  constructor(camera) {
    this.camera = camera;

    /*
      Stores data about each portal. Keyed by portal's id.
      Data is of format:
      {
        previousDot (previous dot product with camera),
        canTeleport (whether or not this traveller can teleport through the portal)
      }
    */
    this.portalData = null;
  }

  // NOTE: portals need to be static (as in none of their properties change) for this to work
  setPortals(portals) {
    this.portalData = new Map();
    for (let i = 0; i < portals.length; i++) {
      const portal = portals[i];
      this.portalData.set(portal.id, {
        previousDot: null,
        previousInRange: false,
      });
    }
  }

  update(portals) {
    this.camera.getWorldPosition(_vector1);
    const cameraWorldPos = _vector1;
    for (let i = 0; i < portals.length; i++) {
      const portal = portals[i];

      portal.mesh.getWorldPosition(_vector2);
      _vector2.subVectors(cameraWorldPos, _vector2);
      const portalToCamera = _vector2;
      portal.mesh.getWorldDirection(_vector3);
      const portalWorldDir = _vector3;

      const data = this.portalData.get(portal.id);
      const previousDot = data.previousDot;
      const dot = portalToCamera.dot(portalWorldDir);
      const previousDotSign = Utils.sgn(previousDot);
      const dotSign = Utils.sgn(dot);

      portalWorldDir.multiplyScalar(dot);

      // Check if camera is colliding with portal's collision bbox (which extends in front and behind the portal surface)
      // NOTE: an object going really fast could be a problem here
      const inRange = portal.globalCollisionBox.containsPoint(cameraWorldPos);

      // Make sure we are either currently in front/behind portal, or that we were last frame (don't want to teleport if we are off to the side)
      if (
        previousDot !== null &&
        dotSign !== previousDotSign &&
        (portal.doubleSided || dotSign < 0) &&
        (inRange || data.previousInRange)
      ) {
        // Valid teleport!
        data.previousDot = null;
        data.previousInRange = false;
        const dest = portal.destination;
        const destData = this.portalData.get(dest.id);
        // If dot is zero, don't multiply by -1
        destData.previousDot = dotSign === 0.0 ? dot : -1 * dot;
        destData.previousInRange = inRange;
        // Teleport camera
        const newWorldMatrix = portal.destinationTransform
          .clone()
          .multiply(this.camera.matrixWorld);
        // Ensure camera values are up to date
        newWorldMatrix.decompose(
          this.camera.position,
          this.camera.quaternion,
          this.camera.scale
        );
        this.camera.updateMatrix();
        this.camera.updateWorldMatrix(true);

        this.camera.getWorldPosition(cameraWorldPos);

        for (let j = 0; j < portals.length; j++) {
          if (j === i) continue;
          this.portalData.get(portals[j].id).previousDot = null;
        }
      } else {
        // Invalid, but update data
        this.portalData.get(portal.id).previousDot = dot;
        data.previousInRange = inRange;
      }
    }
  }
}

export default PortalTraveller;