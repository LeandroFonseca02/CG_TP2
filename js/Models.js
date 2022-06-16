import {GLTFLoader} from './three/GLTFLoader.js';
import * as THREE from './three/three.module.js';
import {Vector2} from './three/three.module.js';
import * as CANNON from "./cannon/cannon-es.js";
import {loadingManager} from './main.js';


export class ModelAudio{
    constructor(){}
    addSound(){}
}

export class AnimatedModel{
    constructor(){}
}

export class RigidModel{
    constructor() {
    }
}

export class House extends RigidModel{
    constructor(position, rotation) {
        super();
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(0.4,0.4,0.4);
        this.body = this.createBody();

    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/house/house.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene;
            model.children[0].children[0].material.metalness = 0.4;
            model.children[0].children[1].material.metalness = 0.4;
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    createBody(){
        const halfExtents = new CANNON.Vec3(1.45, 1.2, 1.52);
        const boxShape = new CANNON.Box(halfExtents);
        const boxBody = new CANNON.Body({ mass: 0})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x+0.65, this.mesh.position.y+0.3, this.mesh.position.z-0.8);
        boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), this.mesh.rotation.y)
        return boxBody;
}

    update(){
    }

    getMesh(){return this.mesh;}

    getBody(){return this.body;}


}

export class WaterTower extends RigidModel{
    constructor(position, rotation) {
        super();
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(0.25,0.25,0.25);
        this.body = this.createBody();

    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/water-tower/water-tower.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene;
            model.children[0].material.metalness = 0.6;
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    createBody(){
        const halfExtents = new CANNON.Vec3(0.3, 1.2, 0.3);
        const boxShape = new CANNON.Box(halfExtents);
        const boxBody = new CANNON.Body({ mass: 0})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x, this.mesh.position.y+0.3, this.mesh.position.z)
        boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), this.mesh.rotation.y)
        return boxBody;
    }

    update(){
    }

    getMesh(){return this.mesh;}

    getBody(){return this.body;}


}

export class Container extends RigidModel{
    constructor(position, rotation) {
        super();
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(0.0075,0.0075,0.0075);
        this.body = this.createBody();

    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/container/container.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene;
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    createBody(){
        const halfExtents = new CANNON.Vec3(0.75, 0.3, 0.38);
        const boxShape = new CANNON.Box(halfExtents);
        const boxBody = new CANNON.Body({ mass: 0})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x-0.39, this.mesh.position.y-0.3, this.mesh.position.z+0.2)
        boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), -this.mesh.rotation.y)
        return boxBody;
    }

    update(){
    }

    getMesh(){return this.mesh;}

    getBody(){return this.body;}


}

export class Sofa extends RigidModel{
    constructor(position, rotation) {
        super();
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(0.2,0.2,0.2);
        this.body = this.createBody();

    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/sofa/sofa.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene;
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    createBody(){
        const halfExtents = new CANNON.Vec3(0.1, 0.12, 0.36);
        const boxShape = new CANNON.Box(halfExtents);
        const boxBody = new CANNON.Body({ mass: 0})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x, this.mesh.position.y+0.1, this.mesh.position.z)
        boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), this.mesh.rotation.y)
        return boxBody;
    }

    update(){
    }

    getMesh(){return this.mesh;}

    getBody(){return this.body;}


}

export class Stop extends RigidModel{
    constructor(position, rotation) {
        super();
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(0.07,0.07,0.07);
        this.body = this.createBody();

    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/stop/stop.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene;
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    createBody(){
        const halfExtents = new CANNON.Vec3(0.03, 0.02, 0.3);
        const boxShape = new CANNON.Box(halfExtents);
        const boxBody = new CANNON.Body({ mass: 0})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x, this.mesh.position.y+0.1, this.mesh.position.z+0.2)
        return boxBody;
    }

    update(){
    }

    getMesh(){return this.mesh;}

    getBody(){return this.body;}


}

export class DeadTree extends RigidModel{
    constructor(position, rotation, type) {
        super();
        this.type = type;
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(0.2,0.2,0.2);
        this.body = this.createBody();

    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();
        let url = './models/dead-tree/';

        switch (this.type){
            case 1:
                url += 'dead-tree1.glb';
                this.bodySize = new CANNON.Vec3(0.12, 0.7, 0.17);
                break;
            case 2:
                url += 'dead-tree2.glb';
                this.bodySize = new CANNON.Vec3(0.12, 0.7, 0.12);
                break;
            case 3:
                url += 'dead-tree3.glb';
                this.bodySize = new CANNON.Vec3(0.12, 0.7, 0.12);
                break;
            case 4:
                url += 'dead-tree4.glb';
                this.bodySize = new CANNON.Vec3(0.15, 0.7, 0.12);
                break;
        }


        loader.load(url, function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene;
            model.children[0].material.metalness = 0.2;
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    createBody(){
        const boxShape = new CANNON.Box(this.bodySize);
        const boxBody = new CANNON.Body({ mass: 0})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x, this.mesh.position.y+0.1, this.mesh.position.z)
        boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), this.mesh.rotation.y)
        return boxBody;
    }

    update(){
    }

    getMesh(){return this.mesh;}

    getBody(){return this.body;}


}

export class Car extends RigidModel{
    constructor(position, rotation) {
        super();
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(0.25,0.25,0.25);
        this.body = this.createBody();

    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/car/car.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene;
            model.children[0].children[0].material.metalness = 0
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    createBody(){
        const halfExtents = new CANNON.Vec3(0.25, 0.3, 0.45);
        const boxShape = new CANNON.Box(halfExtents);
        const boxBody = new CANNON.Body({ mass: 0})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x, this.mesh.position.y+0.1, this.mesh.position.z)
        boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), -this.mesh.rotation.y)
        return boxBody;
    }

    update(){
    }

    getMesh(){return this.mesh;}

    getBody(){return this.body;}


}

export class WashingMachine extends RigidModel{
    constructor(position, rotation) {
        super();
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(0.2,0.2,0.2);
        this.body = this.createBody();

    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/washing-machine/washing-machine.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene;
            model.position.set(0,0.6,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    createBody(){
        const halfExtents = new CANNON.Vec3(0.1, 0.25, 0.1);
        const boxShape = new CANNON.Box(halfExtents);
        const boxBody = new CANNON.Body({ mass: 0})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
        boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), this.mesh.rotation.y)
        return boxBody;
    }

    update(){
    }

    getMesh(){return this.mesh;}

    getBody(){return this.body;}


}

export class Ground extends RigidModel{
    constructor(position, rotation) {
        super();
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(1,1,1);
        this.body = this.createBody();

    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();
        let alpha = 20;

        loader.load('./models/ground/ground.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene;
            model.children[0].material.map.repeat = new Vector2(alpha,alpha)
            model.children[0].material.metalnessMap.repeat = new Vector2(alpha,alpha)
            model.children[0].material.normalMap.repeat = new Vector2(alpha,alpha)
            model.children[0].material.roughnessMap.repeat = new Vector2(alpha,alpha)
            model.position.set(0,1,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    createBody(){
        const halfExtents = new CANNON.Vec3(12, 1, 12);
        const boxShape = new CANNON.Box(halfExtents);
        const boxBody = new CANNON.Body({ mass: 0})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
        boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), this.mesh.rotation.y)
        return boxBody;
    }

    update(){
    }

    getMesh(){return this.mesh;}

    getBody(){return this.body;}


}

export class Fence extends RigidModel{
    constructor(position, rotation) {
        super();
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(0.2,0.2,0.2);
        this.body = this.createBody();

    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/fence/fence-wall.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene;
            model.children[0].material.metalness = 0.8;
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    createBody(){
        const halfExtents = new CANNON.Vec3(9.4, 0.8, 0.1);
        const boxShape = new CANNON.Box(halfExtents);
        const boxBody = new CANNON.Body({ mass: 0})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
        boxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), this.mesh.rotation.y)
        return boxBody;
    }

    update(){
    }

    getMesh(){return this.mesh;}

    getBody(){return this.body;}


}
