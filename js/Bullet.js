import * as CANNON from "./teste/cannon-es.js";
import * as THREE from "./three/three.module.js";

export class Bullet{
    constructor(player) {
        this.radius = 0.1
        const ballShape = new CANNON.Sphere(this.radius)
        const ballGeometry = new THREE.SphereBufferGeometry(ballShape.radius, 32, 32)
        const material = new THREE.MeshNormalMaterial();
        this.ballBody = new CANNON.Body({ mass: 0.1})
        this.ballBody.addShape(ballShape)
        this.ballMesh = new THREE.Mesh(ballGeometry, material)
        this.ballMesh.castShadow = true
        this.ballMesh.receiveShadow = true
    }

    update(){
        this.ballMesh.position.copy(this.ballBody.position)
        this.ballMesh.quaternion.copy(this.ballBody.quaternion)
    }

    getBody(){
        return this.ballBody;
    }

    getMesh(){
        return this.ballMesh
    }

    add(scene, world){
        scene.add(this.ballMesh)
        world.addBody(this.ballBody)
    }

    remove(scene, world){
        scene.remove(this.ballMesh)
        world.remove(this.ballBody)
    }
}
