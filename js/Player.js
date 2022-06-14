import * as THREE from "./three/three.module.js";
import * as CANNON from "./teste/cannon-es.js";
import {PointerLockControlsCannon} from "./teste/PointerLockControlsCannon.js";
import {GLTFLoader} from "./three/GLTFLoader.js";

export class Player{
    constructor(camera) {
        this.radius = 0.3
        this.body = this.createBody()
        this.controls = new PointerLockControlsCannon(camera, this.body)
        this.camera = camera
        this.balls = []
        this.ballMeshes = []
        this.lastShot = 0
        this.animationMixer = null;
        this.animation = null;
        this.ballMesh = this.loadBulletMesh();
    }

    createBody(){
        const sphereShape = new CANNON.Sphere(this.radius)
        const sphereBody = new CANNON.Body({ mass: 5})
        sphereBody.addShape(sphereShape)
        sphereBody.position.set(0, 5, 0)
        sphereBody.linearDamping = 0.9
        return  sphereBody;
    }

    loadBulletMesh(){
        let loader = new GLTFLoader();
        let mesh = new THREE.Mesh();

        loader.load('./models/bullet/energy.glb', (gltf) => {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = false;
                    child.receiveShadow = false;
                }
            })
            let model = gltf.scene;
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(0.08,0.08,0.08);
            mesh.add(model);

        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    update(dt){
        this.controls.update(dt)
        this.updateBallsPosition()
    }

    updateBallsPosition(){
        for (let i = 0; i < this.balls.length; i++) {
            this.ballMeshes[i].position.copy(this.balls[i].position)
            this.ballMeshes[i].quaternion.copy(this.balls[i].quaternion)

        }
    }

    getMesh(){
        return this.controls.getObject()
    }

    getBody(){
        return this.body
    }

    getShootDirection() {
        const vector = new THREE.Vector3(0, 0, 1)
        vector.unproject(this.camera)
        const ray = new THREE.Ray(this.body.position, vector.sub(this.body.position).normalize())
        return ray.direction
    }

    shoot(){
        const shot = new Date().valueOf();
        if(this.lastShot===0 || shot-this.lastShot>600){
            const shootVelocity = 90
            const ballShape = new CANNON.Sphere(0.1)
            const ballGeometry = new THREE.SphereBufferGeometry(ballShape.radius, 32, 32)
            const material = new THREE.MeshNormalMaterial();
            const ballBody = new CANNON.Body({ mass: 0.1})
            ballBody.addShape(ballShape)
            const ballMesh = this.ballMesh.clone();
            ballMesh.castShadow = true
            ballMesh.receiveShadow = true

            this.balls.push(ballBody)
            this.ballMeshes.push(ballMesh)

            const shootDirection = this.getShootDirection()
            ballBody.velocity.set(
                shootDirection.x * shootVelocity,
                shootDirection.y * shootVelocity,
                shootDirection.z * shootVelocity
            )

            // Move the ball outside the player sphere
            const x = this.body.position.x + shootDirection.x * (this.radius * 1.02 + ballShape.radius)
            const y = this.body.position.y + shootDirection.y * (this.radius * 1.02 + ballShape.radius)
            const z = this.body.position.z + shootDirection.z * (this.radius * 1.02 + ballShape.radius)
            ballBody.position.set(x, y, z)
            ballMesh.position.copy(ballBody.position)
            this.lastShot=shot;
        }
    }

    getBalls(){
        return this.balls
    }

    getBallMeshes(){
        return this.ballMeshes
    }
}
