import {GLTFLoader} from './three/GLTFLoader.js';
import * as THREE from './three/three.module.js';
import {Water} from './three/Water2.js';
import {Vector2} from './three/three.module.js';
import * as CANNON from "./teste/cannon-es.js";
import {loadingManager} from './teste.js';


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

// classe que define os candeeiros do nosso cenário
export class Lamp {
    constructor(position, rotation) {
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(0.08,0.08,0.08);
    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/lamp/lamp.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene.children[0];
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }
    update(){
    }

    getMesh(){return this.mesh;}

}

// classe que define os patos do nosso cenário
export class Duck extends ModelAudio {
    constructor(position, rotation, haveSound) {
        super();
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(10,10,10);
        this.haveSound = 0;
        this.haveSound = haveSound;
    }


    load(){
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/duck/duck.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            let model = gltf.scene;

            mesh.add(model);
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    addSound(camera){
        if(this.haveSound === 1){
            const listener = new THREE.AudioListener();
            camera.add( listener );
            const sound = new THREE.PositionalAudio( listener );
            const audioLoader = new THREE.AudioLoader();
            const mesh = this.getMesh();
            audioLoader.load( './sounds/duck.mp3', function( buffer ) {
                sound.setBuffer( buffer );
                sound.setRefDistance(7);
                sound.setMaxDistance(0.1);
                sound.play(1);
                mesh.add(sound);
            }.bind(this.mesh));
        }
    }

    update(){
    }

    getMesh(){return this.mesh;}

}

// classe que define as diversões do nosso cenário
export class Playground {
    constructor(position, rotation) {
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(10,10,10);
    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/playground/playground.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene.children[0];
            for (let i = 0; i < 6; i++) {
                model.children[i].material.metalness = 0.5;
            }

            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model)
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }
    update(){
    }

    getMesh(){return this.mesh;}

}

// classe que define os árvores do nosso cenário
export class Tree {
    constructor(position, rotation, scale) {
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        if(scale > 0){
            this.mesh.scale.set(  0.5*scale,0.5*scale,0.5*scale);
        }else{
            this.mesh.scale.set(0.5,0.5,0.5);
        }

    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/tree/tree.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene;
            model.children[0].children[0].material.metalness = 0.3;
            model.children[0].children[1].material.metalness = 0.3;
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh
    }
    update(){
    }

    getMesh(){return this.mesh;}

}

// classe que define os caixotes do lixo do nosso cenário
export class TrashBin {
    constructor(position, rotation) {
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(0.08,0.08,0.08);
    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/trash/trash.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene.children[0];
            model.material.metalness = 0;
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    update(){
    }

    getMesh(){return this.mesh;}

}

// classe que define o parque do nosso cenário
export class Jardim {
    constructor(position) {
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
    }
    load(){
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Group();
        let grass_alpha = 30;
        loader.load( './models/lake/lago-muro.glb', function ( gltf ) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.receiveShadow = true;
                }
            })
            const model = gltf.scene.children[0];
            model.children[0].material.map.repeat = new Vector2(grass_alpha,grass_alpha)
            model.children[0].material.metalnessMap.repeat = new Vector2(grass_alpha,grass_alpha)
            model.children[0].material.normalMap.repeat = new Vector2(grass_alpha,grass_alpha)
            model.children[0].material.roughnessMap.repeat = new Vector2(grass_alpha,grass_alpha)
            model.children[1].material.map.repeat = new Vector2(grass_alpha,grass_alpha)
            model.children[1].material.metalnessMap.repeat = new Vector2(grass_alpha,grass_alpha)
            model.children[1].material.normalMap.repeat = new Vector2(grass_alpha,grass_alpha)
            model.children[1].material.roughnessMap.repeat = new Vector2(grass_alpha,grass_alpha)
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(200,200,200);
            mesh.add(model);
        }, undefined, function ( error ) {
            console.error( error );
        } );

        const params = {
            color: '#ffffff',
            scale: 4,
            flowX: 1,
            flowY: 1
        };

        const waterGeometry = new THREE.BoxGeometry( 140,140,1 ); //190,200

        const water = new Water( waterGeometry, {
            color: params.color,
            scale: params.scale,
            flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
            textureWidth: 1024,
            textureHeight: 1024
        } );

        water.position.set(-40,-2,-50)
        water.rotation.x = Math.PI * - 0.5;
        mesh.add(water);
        return mesh;
    }

    update(){
    }

    getMesh(){return this.mesh;}

}

// classe que define os bancos de jardim do nosso cenário
export class Banco {
    constructor(position, rotation) {
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(10,10,10);
        this.geometry = this.mesh.getObjectByName('Cube001');
        console.log(this.geometry)
    }

    load() {
        let loader = new GLTFLoader();
        let mesh = new THREE.Group();
        let model;

        loader.load('./models/bench/bench.glb', function (gltf) {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
            model = gltf.scene.children[0];
            model.position.set(0,0,0);
            model.rotation.set(0,0,0);
            model.scale.set(1,1,1);
            mesh.add(model);
        }, undefined, function (error) {
            console.error(error);
        });
        return mesh;
    }

    update(){
    }

    getMesh(){return this.mesh;}

}

export class Boneco extends AnimatedModel{
    constructor(position, rotation) {
        super();
        this.mesh = this.load();
        this.mesh.name = "Boneco";
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(1,1,1);
        this.animationMixer = null;
        this.animation = null;
        this.speed = 4;

        this.curvePoints = [
            0,0,0,
            -100,0,0,
            -100,0,-100,
            0,0,-100,
            0,0,0
        ]

        this.calculate();
    }

    calculate(){
        this.pts = [];
        for ( let i = 0; i < this.curvePoints.length; i += 3 ) {
            this.pts.push( new THREE.Vector3( this.curvePoints[ i ], this.curvePoints[ i + 1 ], this.curvePoints[ i + 2 ] ) );
        }

        this.lineSegments = 701;
        this.widthSegments = 5;
        this.limitLineSegments = this.lineSegments + 1;

        this.spline = new THREE.CatmullRomCurve3( this.pts );
        this.points = this.spline.getPoints( this.lineSegments );

        this.tangent = 0;
        this.normal = new THREE.Vector3( );
        this.binormal = new THREE.Vector3( 0, 1, 0 );

        this.tangents = [];
        this.normals = [];
        this.binormals = [];

        for (let j = 0; j < this.limitLineSegments; j ++ ) {
            this.tangent = this.spline.getTangent(  j / this.lineSegments );
            this.tangents.push( this.tangent.clone( ) );

            this.normal.crossVectors( this.tangent, this.binormal );

            this.normal.y = 0; // to prevent lateral slope of the road

            this.normal.normalize( );
            this.normals.push( this.normal.clone( ) );

            this.binormal.crossVectors( this.normal, this.tangent ); // new binormal
            this.binormals.push( this.binormal.clone( ) );
        }

        this.M3 = new THREE.Matrix3( );
        this.M4 = new THREE.Matrix4( );
        this.lineSegmentCounter = 0;
    }


    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/boneco/ghost.glb', (gltf) => {
            gltf.scene.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = false;
                    child.receiveShadow = false;
                }
            })
            let model = gltf.scene;
            model.position.set(0,10,0);
            model.rotation.set(0,0,0);
            model.scale.set(10,10,10);
            mesh.add(model);

            let skeleton = new THREE.SkeletonHelper( model );
            skeleton.visible = false;
            model.add( skeleton );

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

    update(delta){
        if(this.animationMixer !== null) this.animationMixer.update(delta);
        this.movement();
    }

    movement(){
        if ( this.lineSegmentCounter >= this.limitLineSegments ) {
            this.lineSegmentCounter = 0;
        }

        this.M3.set( this.tangents[ this.lineSegmentCounter ].x, this.binormals[ this.lineSegmentCounter ].x, this.normals[ this.lineSegmentCounter ].x, this.tangents[ this.lineSegmentCounter ].y, this.binormals[ this.lineSegmentCounter ].y, this.normals[ this.lineSegmentCounter ].y, this.tangents[ this.lineSegmentCounter ].z, this.binormals[ this.lineSegmentCounter ].z, this.normals[ this.lineSegmentCounter ].z );
        this.M4.setFromMatrix3( this.M3 );

        this.mesh.setRotationFromMatrix( this.M4 );
        this.mesh.position.set( this.points[ this.lineSegmentCounter ].x + 0.18 * this.normals[ this.lineSegmentCounter ].x, this.points[ this.lineSegmentCounter ].y, this.points[ this.lineSegmentCounter ].z + 0.18 * this.normals[ this.lineSegmentCounter ].z );
        this.lineSegmentCounter += this.speed;
    }

    getMesh(){return this.mesh;}

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
        boxBody.position.set(this.mesh.position.x+0.15, this.mesh.position.y+0.3, this.mesh.position.z-0.7);
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
        boxBody.position.set(this.mesh.position.x+0.4, this.mesh.position.y-0.3, this.mesh.position.z+0.05)
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
        const halfExtents = new CANNON.Vec3(0.03, 0.7, 0.03);
        const boxShape = new CANNON.Box(halfExtents);
        const boxBody = new CANNON.Body({ mass: 0})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x, this.mesh.position.y+0.1, this.mesh.position.z)
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
        return boxBody;
    }

    update(){
    }

    getMesh(){return this.mesh;}

    getBody(){return this.body;}


}

export class Grave extends RigidModel{
    constructor(position, rotation, type) {
        super();
        this.type = type;
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(0.05,0.05,0.05);
        this.body = this.createBody();

    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();
        let url = './models/graves/';

        switch (this.type){
            case 1:
                url += 'grave1.glb';
                this.bodySize = new CANNON.Vec3(0.12, 0.1, 0.07);
                break;
            case 2:
                url += 'grave2.glb';
                this.bodySize = new CANNON.Vec3(0.08, 0.7, 0.08);
                break;
            case 3:
                url += 'grave3.glb';
                this.bodySize = new CANNON.Vec3(0.06, 0.5, 0.06);
                break;
            case 4:
                url += 'grave4.glb';
                this.bodySize = new CANNON.Vec3(0.08, 0.2, 0.08);
                break;
            case 5:
                url += 'grave5.glb';
                this.bodySize = new CANNON.Vec3(0.09, 0.4, 0.09);
                break;
            case 6:
                url += 'grave6.glb';
                this.bodySize = new CANNON.Vec3(0.04, 0.25, 0.09);
                break;
            case 7:
                url += 'grave7.glb';
                this.bodySize = new CANNON.Vec3(0.09, 0.5, 0.09);
                break;
            case 8:
                url += 'grave8.glb';
                this.bodySize = new CANNON.Vec3(0.04, 0.3, 0.1);
                break;
            case 9:
                url += 'grave9.glb';
                this.bodySize = new CANNON.Vec3(0.07, 0.3, 0.07);
                break;
            case 10:
                url += 'grave10.glb';
                this.bodySize = new CANNON.Vec3(0.12, 0.15, 0.08);
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
        boxBody.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
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
        return boxBody;
    }

    update(){
    }

    getMesh(){return this.mesh;}

    getBody(){return this.body;}


}

export class Phone extends RigidModel{
    constructor(position, rotation) {
        super();
        this.mesh = this.load();
        this.mesh.position.set(position.x,position.y,position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
        this.mesh.scale.set(0.05,0.05,0.05);
        this.body = this.createBody();

    }

    load() {
        let loader = new GLTFLoader(loadingManager);
        let mesh = new THREE.Mesh();

        loader.load('./models/phone/phone.glb', function (gltf) {
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
        const halfExtents = new CANNON.Vec3(0.05, 0.05, 0.05);
        const boxShape = new CANNON.Box(halfExtents);
        const boxBody = new CANNON.Body({ mass: 0})
        boxBody.addShape(boxShape)
        boxBody.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z)
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
        return boxBody;
    }

    update(){
    }

    getMesh(){return this.mesh;}

    getBody(){return this.body;}


}
