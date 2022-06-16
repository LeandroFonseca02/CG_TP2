import {GLTFLoader} from "./three/GLTFLoader.js";
import * as THREE from "./three/three.module.js";
import * as CANNON from "./teste/cannon-es.js";

export class Enemy{
    constructor(position, speed, scene, world, player) {
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y+0.5,position.z);
        this.mesh.scale.set(1,1,1);
        this.mesh.name = "enemy"
        this.isAlive = true;
        this.speed = speed;
        this.body = this.createBody();
        this.player = player;
        this.animationMixer = null;
        this.animation = null;
        this.playerDead = false;
        this.scene = scene
        this.world = world
        this.scene.add(this.mesh)
        this.world.addBody(this.body)
        this.body.addEventListener('collide', (event)=>{
            if(event.body===this.player.getBody()){
                this.scene.remove(this.mesh)
                this.world.removeBody(this.body)
                // this.isAlive = false;
                this.playerDead = true;
            }else{
                for (let i = 0; i < this.player.getBalls().length ; i++) {
                    if(event.body===this.player.getBalls()[i]){
                        this.scene.remove(this.mesh)
                        this.world.removeBody(this.body)
                        this.scene.remove(this.player.getBallMeshes()[i])
                        this.world.removeBody(this.player.getBalls()[i])
                        this.player.getBallMeshes().splice(i,1)
                        this.player.getBalls().splice(i,1)
                        this.player.getBallTime().splice(i,1)
                        this.isAlive = false;
                    }
                }
            }
        })
        this.world.addEventListener('endContact', (event) => {
            if (
                (event.bodyA === this.body && event.bodyB === this.player.getBody()) ||
                (event.bodyB === this.body && event.bodyA === this.player.getBody())
            ) {
                this.scene.remove(this.mesh)
                this.world.removeBody(this.body)
                // this.isAlive = false;
                this.playerDead = true;
            }else{
                for (let i = 0; i < this.player.getBalls().length ; i++) {
                    if(
                        (event.bodyA === this.body && event.bodyB === this.player.getBalls()[i]) ||
                        (event.bodyB === this.body && event.bodyA === this.player.getBalls()[i])){
                        this.scene.remove(this.mesh)
                        this.world.removeBody(this.body)
                        this.scene.remove(this.player.getBallMeshes()[i])
                        this.world.removeBody(this.player.getBalls()[i])
                        this.player.getBallMeshes().splice(i,1)
                        this.player.getBalls().splice(i,1)
                        this.player.getBallTime().splice(i,1)
                        this.isAlive = false;
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
            let model = gltf.scene;
            model.position.set(0,0.6,0);
            model.rotation.set(0,Math.PI,0);
            model.scale.set(1,1,1);
            mesh.add(model);


            const clips = [];
            this.animationMixer = new THREE.AnimationMixer(model);
            const animations = gltf.animations;

            animations.map((v,i) => {
                clips[i] = this.animationMixer.clipAction(v)
            })

            clips[0].play();



        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    createBody(){
        const halfExtents = new CANNON.Vec3(0.35, 0.4, 0.35);
        const boxShape = new CANNON.Box(halfExtents);
        const boxGeometry = new THREE.BoxBufferGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        const boxBody = new CANNON.Body({ isTrigger: true})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x, this.mesh.position.y+1, this.mesh.position.z)
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
        this.mesh.position.x += this.dx*this.speed
        this.mesh.position.z += this.dz*this.speed
        if(this.lenght > 3){
            this.mesh.quaternion.rotateTowards(this.targetQuaternion, delta*2);
        }

    }
    update(dt,delta){
        if(this.animationMixer !== null) this.animationMixer.update(delta);
        this.calculate();
        this.movement(dt);
        this.body.position.set(this.mesh.position.x, this.mesh.position.y+1, this.mesh.position.z);
        this.body.quaternion.copy(this.mesh.quaternion);
    }
    getMesh(){return this.mesh;}
}
