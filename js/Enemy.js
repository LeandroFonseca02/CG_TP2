import {GLTFLoader} from "./three/GLTFLoader.js";
import * as THREE from "./three/three.module.js";
import * as CANNON from "./teste/cannon-es.js";

export class Enemy{
    constructor(position, speed, scene, world, player) {
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.scale.set(0.5,0.5,0.5);
        this.speed = speed;
        this.body = this.createBody();
        this.player = player;
        this.scene = scene
        this.world = world
        this.scene.add(this.mesh)
        this.world.addBody(this.body)
        this.body.addEventListener('collide', (event)=>{
            if(event.body===this.player.getBody()){
                this.scene.remove(this.mesh)
                this.world.removeBody(this.body)
            }else{
                for (let i = 0; i < this.player.getBalls().length ; i++) {
                    if(event.body===this.player.getBalls()[i]){
                        this.scene.remove(this.mesh)
                        this.world.removeBody(this.body)
                    }
                }
            }
        })
    }

    load() {
        let loader = new GLTFLoader();
        let mesh = new THREE.Mesh();

        loader.load('./models/boneco/ghost.glb',  (gltf) => {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            let model = gltf.scene.children[0];
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            model.material.metalness=0;
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    createBody(){
        const halfExtents = new CANNON.Vec3(0.5, 0.5, 0.5);
        const boxShape = new CANNON.Box(halfExtents);
        const boxGeometry = new THREE.BoxBufferGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        const boxBody = new CANNON.Body({ isTrigger: true})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x, this.mesh.position.y+2, this.mesh.position.z)
        return boxBody;
    }

    getBody(){
        return this.body;
    }

    calculate(){
        this.dx = this.player.controls.yawObject.position.x-this.mesh.position.x

        this.dz = this.player.controls.yawObject.position.z-this.mesh.position.z
        this.lenght = Math.sqrt(this.dx*this.dx+this.dz*this.dz)

        if(this.lenght){
            this.dx /= this.lenght
            this.dz /= this.lenght
        }

    }

    movement(delta){
        this.rotationMatrix = new THREE.Matrix4();
        this.targetQuaternion = new THREE.Quaternion();
        this.rotationMatrix.lookAt(this.player.controls.yawObject.position, this.mesh.position, this.mesh.up);
        this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix);
        this.mesh.quaternion.rotateTowards(this.targetQuaternion, delta*2);
        this.mesh.position.x += this.dx*this.speed
        this.mesh.position.z += this.dz*this.speed
    }
    update(delta){
        this.calculate();
        this.movement(delta);
        this.body.position.set(this.mesh.position.x, this.mesh.position.y+2, this.mesh.position.z);
        this.body.quaternion.copy(this.mesh.quaternion);
    }
    getMesh(){return this.mesh;}
}
