import * as THREE from "./three/three.module.js";
import {RoundedBoxGeometry} from "./three/RoundedBoxGeometry.js";
import {MeshStandardMaterial} from "./three/three.module.js";
import {SkyboxDay, RustyMetal, ReflectiveMetal, Stone, Wrap, Wood} from "./Textures.js";


class Obj {
    constructor(){}
}

// classe que permite a um objeto ter a geometria de um cubo
export class Cube extends Obj{
    constructor(size) {
        super();
        this.geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    }
}

// classe que permite a um objeto ter a geometria de um cubo com vertices redondos
class RoundCube extends Obj{
    constructor(size) {
        super();
        this.geometry = new RoundedBoxGeometry(size.width, size.height, size.depth);
    }
}

// classe que permite a um objeto ter a geometria de um cilíndro
class Cylinder extends Obj{
    constructor(radiusTop, radiusBottom, height, RadialS) {
        super();
        this.geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, RadialS);
    }
}

// classe que permite a um objeto ter a geometria de uma esfera
class Sphere extends Obj{
    constructor(radius, widthSegments, heightSegments, phiS, phiL) {
        super();
        this.geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, phiS, phiL);
    }
}

// classe que define a Skybox
export class Skybox extends Cube{
    constructor(size, position) {
        super(size);
        this.texture = new SkyboxDay();
        this.materialArray = [
            new THREE.MeshBasicMaterial( { map: this.texture.getTextureBK() }),
            new THREE.MeshBasicMaterial( { map: this.texture.getTextureFT() }),
            new THREE.MeshBasicMaterial( { map: this.texture.getTextureUP() }),
            new THREE.MeshBasicMaterial( { map: this.texture.getTextureDN() }),
            new THREE.MeshBasicMaterial( { map: this.texture.getTextureRT() }),
            new THREE.MeshBasicMaterial( { map: this.texture.getTextureLF() })
        ];
        for (let i = 0; i < 6; i++) {
            this.materialArray[i].side = THREE.BackSide;
        }

        this.mesh = new THREE.Mesh(this.geometry,this.materialArray);
        this.mesh.position.set(position.x,position.y,position.z);
    }
    update(){}
    getMesh(){
        return this.mesh;
    }
}

// classe que define o suporte de metal do nosso objeto hierárquico
export class Suporte extends Cube {
    constructor(size,position, rotateX, rotateZ, repA, repB, material) {
        super(size);

        if(material instanceof MeshStandardMaterial){
            this.material = material;
        }else{
            let texture = new RustyMetal();
            let maps = [
                texture.getBaseTexture(),
                texture.getNormalTexture(),
                texture.getRoughnessTexture(),
                texture.getAoTexture()
            ];
            this.material = new THREE.MeshStandardMaterial({
                map: maps[0],
                normalMap: maps[1],
                roughnessMap: maps[2],
                aoMap: maps[3]
            });
            this.wrapMesh(maps, repA, repB);
        }

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.rotateX(rotateX);
        this.mesh.rotateZ(rotateZ);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }
    update() {}

    wrapMesh(maps, repA, repB) {
        for (let i = 0; i < maps.length; i++) {
            new Wrap(maps[i], repA, repB);
        }
    }

    getMesh() { return this.mesh; }
}

// classe que define o tampo e os assentos de madeira do nosso objeto hierárquico
class WoodBar extends RoundCube {
    constructor(size,position, rotate, rotateZ, repA, repB, material) {
        super(size);

        if(material instanceof MeshStandardMaterial){
            this.material = material;
        }else{
            let texture = new Wood();
            let maps = [
                texture.getBaseTexture(),
                texture.getAoTexture(),
                texture.getRoughnessTexture(),
            ];
            this.material = new THREE.MeshStandardMaterial({
                    map: maps[0],
                    aoMap: maps[1],
                    roughnessMap: maps[2],
                    roughness:0.7
            });
            this.wrapMesh(maps, repA, repB);
        }

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.rotateX(rotate);
        this.mesh.rotateZ(rotateZ);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }
    update() {}

    wrapMesh(maps, repA, repB) {
        for (let i = 0; i < maps.length; i++) {
            new Wrap(maps[i], repA, repB);
        }
    }

    getMesh() {
        return this.mesh;
    }
}

// classe que define as pernas de metal do nosso objeto hierárquico
class Legs extends Cylinder {
    constructor(position, radiusTop, radiusBottom, height, RadialS, rotateX, rotateY, material) {
        super(radiusTop, radiusBottom, height, RadialS);

        if(material instanceof MeshStandardMaterial){
            this.material = material;
        }else{
            let texture = new RustyMetal();
            this.material = new THREE.MeshStandardMaterial({
                map: texture.getBaseTexture(),
                normalMap: texture.getNormalTexture(),
                roughnessMap: texture.getRoughnessTexture(),
                roughness: 0.7,
                aoMap: texture.getAoTexture()
            });
        }

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.rotateX(rotateX);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }

    update() {}
    getMesh() {
        return this.mesh;
    }}

// classe que define a base de pedra do nosso objeto hierárquico
class Base extends RoundCube{
    constructor(size,position, rotateX, rotateZ, repA, repB, material) {
        super(size);

        if(material instanceof MeshStandardMaterial){
            this.material = material;
        }else{
            let texture = new Stone();
            let maps = [
                texture.getBaseTexture(),
                texture.getNormalTexture(),
                texture.getRoughnessTexture(),
            ];
            this.material = new THREE.MeshStandardMaterial({
                map: maps[0],
                normalMap: maps[1],
                roughnessMap: maps[2],
                roughness:1
            });
            this.wrapMesh(maps, repA, repB);
        }

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.rotateX(rotateX);
        this.mesh.rotateZ(rotateZ);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }
    update(){}
    wrapMesh(maps, repA, repB) {
        for (let i = 0; i < maps.length; i++) {
            new Wrap(maps[i], repA, repB);
        }
    }
    getMesh(){
        return this.mesh;
    }
}

// classe que define um parafuso de metal do nosso objeto hierárquico
class Screw extends Sphere {
    constructor(position, radius, widthSegments, heightSegments, theta, material) {
        super(radius, widthSegments, heightSegments, theta);

        if(material instanceof MeshStandardMaterial){
            this.material = material;
        }else{
            let texture = new ReflectiveMetal();
            this.material = new THREE.MeshStandardMaterial({
                map: texture.getBaseTexture(),
                normalMap: texture.getNormalTexture(),
                displacementMap: texture.getHeightTexture(),
                roughnessMap: texture.getRoughnessTexture(),
                roughness: 1,
                aoMap: texture.getAoTexture(),
                metalnessMap: texture.getMetallicTexture(),
                metalness:1,
            });
        }

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.rotateX(-Math.PI/2);
    }

    update(){}
    getMesh(){
        return this.mesh;
    }
}

// classe que define o nosso objeto hierárquico
export class Bench extends Obj{
    constructor(position, rotation) {
        super();
        this.mesh = new THREE.Group();
        this.RM_material = this.createReflectiveMetalMat();
        this.Stone_material = this.createStoneMat();
        this.Wood_material = this.createWoodMat(1,6);
        this.WoodBase_material = this.createWoodMat(2,2);
        this.RustyMetal_material = this.createRustyMetalMat();
        this.Suporte_material = this.createSuporteMat();
        this.parts = [
            //Banco
            new WoodBar({ width: 0.5, height: 16, depth: 1 },{x:0,y:5,z:0},0,Math.PI/2,1,6,this.Wood_material),
            new WoodBar({ width: 0.5, height: 16, depth: 1 },{x:0,y:5,z:1.1},0,Math.PI/2,1,6,this.Wood_material),
            new WoodBar({ width: 0.5, height: 16, depth: 1 },{x:0,y:5,z:2.2},0,Math.PI/2,1,6,this.Wood_material),
            new WoodBar({ width: 0.5, height: 16, depth: 1 },{x:0,y:5,z:3.3},0,Math.PI/2,1,6,this.Wood_material),
            //Banco
            new WoodBar({ width: 0.5, height: 16, depth: 1 },{x:0,y:5,z:10.1},0,Math.PI/2,1,6,this.Wood_material),
            new WoodBar({ width: 0.5, height: 16, depth: 1 },{x:0,y:5,z:11.2},0,Math.PI/2,1,6,this.Wood_material),
            new WoodBar({ width: 0.5, height: 16, depth: 1 },{x:0,y:5,z:12.3},0,Math.PI/2,1,6,this.Wood_material),
            new WoodBar({ width: 0.5, height: 16, depth: 1 },{x:0,y:5,z:13.4},0,Math.PI/2,1,6,this.Wood_material),
            //Tampo
            new WoodBar({ width: 0.5, height: 16, depth: 8 },{x:0,y:8,z:6.7},0,Math.PI/2,2,2,this.WoodBase_material),
            //Pernas
            new Legs({x:5,y:4,z:6.7},1,1,8,16,0,0,this.RustyMetal_material),
            new Legs({x:-5,y:4,z:6.7},1,1,8,16,0,0,this.RustyMetal_material),
            //Suporte
            new Suporte({ width: 0.5, height: 14, depth: 1 },{x:6.2,y:4.5,z:6.7},Math.PI/2,0,1,6,this.Suporte_material),
            new Suporte({ width: 0.5, height: 14, depth: 1 },{x:-6.2,y:4.5,z:6.7},Math.PI/2,0,1,6,this.Suporte_material),
            //Parafusos
            new Screw({x:6.22,y:5.2,z:0},0.1,16,16,3.1,this.RM_material),
            new Screw({x:6.22,y:5.2,z:1.1},0.1,16,16,3.1,this.RM_material),
            new Screw({x:6.22,y:5.2,z:2.2},0.1,16,16,3.1,this.RM_material),
            new Screw({x:6.22,y:5.2,z:3.3},0.1,16,16,3.1,this.RM_material),

            new Screw({x:-6.22,y:5.2,z:0},0.1,16,16,3.1,this.RM_material),
            new Screw({x:-6.22,y:5.2,z:1.1},0.1,16,16,3.1,this.RM_material),
            new Screw({x:-6.22,y:5.2,z:2.2},0.1,16,16,3.1,this.RM_material),
            new Screw({x:-6.22,y:5.2,z:3.3},0.1,16,16,3.1,this.RM_material),

            new Screw({x:6.22,y:5.2,z:10},0.1,16,16,3.1,this.RM_material),
            new Screw({x:6.22,y:5.2,z:11.2},0.1,16,16,3.1,this.RM_material),
            new Screw({x:6.22,y:5.2,z:12.3},0.1,16,16,3.1,this.RM_material),
            new Screw({x:6.22,y:5.2,z:13.4},0.1,16,16,3.1,this.RM_material),

            new Screw({x:-6.22,y:5.2,z:10},0.1,16,16,3.1,this.RM_material),
            new Screw({x:-6.22,y:5.2,z:11.2},0.1,16,16,3.1,this.RM_material),
            new Screw({x:-6.22,y:5.2,z:12.3},0.1,16,16,3.1,this.RM_material),
            new Screw({x:-6.22,y:5.2,z:13.4},0.1,16,16,3.1,this.RM_material),
            //Base
            new Base({ width: 0.8, height: 14, depth: 5 }, {x:0,y:0,z:6.7},0,Math.PI/2,1,3, this.Stone_material),
        ];
        this.addMeshToGroup(this.parts);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.rotation.set(rotation.x,rotation.y,rotation.z);
    }

    update() {
        // this.mesh.rotation.y += 0.01;
    }

    // classe que cria a textura de metal refletivo a ser usado nos objetos
    createReflectiveMetalMat(){
        let texture = new ReflectiveMetal();
        let material = new THREE.MeshStandardMaterial({
            map: texture.getBaseTexture(),
            normalMap: texture.getNormalTexture(),
            displacementMap: texture.getHeightTexture(),
            roughnessMap: texture.getRoughnessTexture(),
            roughness: 1,
            aoMap: texture.getAoTexture(),
            metalnessMap: texture.getMetallicTexture(),
            metalness:1,
        });
        return material;
    }

    // classe que cria a textura de metal enferrujado a ser usado nos objetos
    createRustyMetalMat(){
        let texture = new RustyMetal();
        let material = new THREE.MeshStandardMaterial({
            map: texture.getBaseTexture(),
            normalMap: texture.getNormalTexture(),
            roughnessMap: texture.getRoughnessTexture(),
            roughness: 0.7,
            aoMap: texture.getAoTexture()
        });
        return material;
    }

    createSuporteMat(){
        let texture = new RustyMetal();
        let maps = [
            texture.getBaseTexture(),
            texture.getNormalTexture(),
            texture.getRoughnessTexture(),
            texture.getAoTexture()
        ];
        let material = new THREE.MeshStandardMaterial({
            map: maps[0],
            normalMap: maps[1],
            roughnessMap: maps[2],
            aoMap: maps[3]
        });

        for (let i = 0; i < maps.length; i++) {
            new Wrap(maps[i], 1, 6);
        }
        return material;
    }

    // classe que cria a textura de pedra a ser usado nos objetos
    createStoneMat(){
        let texture = new Stone();
        let maps = [
            texture.getBaseTexture(),
            texture.getNormalTexture(),
            texture.getRoughnessTexture(),
        ];
        let material = new THREE.MeshStandardMaterial({
            map: maps[0],
            normalMap: maps[1],
            roughnessMap: maps[2],
            roughness:1
        });

        for (let i = 0; i < maps.length; i++) {
            new Wrap(maps[i], 1, 3);
        }
        return material;
    }

    // classe que cria a textura de madeira a ser usado nos objetos
    createWoodMat(repA,repB){
        let texture = new Wood();
        let maps = [
            texture.getBaseTexture(),
            texture.getAoTexture(),
            texture.getRoughnessTexture(),
        ];
        let material = new THREE.MeshStandardMaterial({
            map: maps[0],
            aoMap: maps[1],
            roughnessMap: maps[2],
            roughness:0.7
        });

        for (let i = 0; i < maps.length; i++) {
            new Wrap(maps[i], repA, repB);
        }
        return material;
    }

    addMeshToGroup(parts){
        for (let i = 0; i < parts.length; i++) {
            this.mesh.add(parts[i].getMesh());
        }
    }
    getMesh() {
        return this.mesh;
    }
}

export class PortalCreator{
    constructor(size,position,color,name,destination) {
        this.portalGeo = new THREE.PlaneGeometry(size.width,size.height,1,1);
        this.portalBorderGeo = new THREE.BoxGeometry(size.width*1.1,size.height*1.1,0.15,1,1);
        this.portalMat = new THREE.MeshBasicMaterial({color: 16711884,reflectivity:1,refractionRatio:0.98,depthFunc:3,depthTest:true,depthWrite:true,stencilWrite:false,stencilWriteMask:255,stencilFunc:519,stencilRef:0,stencilFuncMask:255,stencilFail:7680,stencilZFail:7680,stencilZPass:7680})
        this.portalBorderMat = new THREE.MeshStandardMaterial({color:color,roughness:1,metalness:0,emissive:0,envMapIntensity:1,refractionRatio:0.98,depthFunc:3,depthTest:true,depthWrite:true,colorWrite:true,stencilWrite:false,stencilWriteMask:255,stencilFunc:519,stencilRef:0,stencilFuncMask:255,stencilFail:7680,stencilZFail:7680,stencilZPass:7680})

        this.mesh = new THREE.Group();
        this.mesh.name = "Portal "+name;
        this.portalMesh = new THREE.Mesh(this.portalGeo,this.portalMat);
        this.portalMesh.name = name;
        this.portalMesh.userData = {destination: destination};
        this.portalMesh.position.set(0,0,0.1);

        this.portalBorder = new THREE.Mesh(this.portalBorderGeo,this.portalBorderMat);
        this.portalBorder.name = "Border "+name;
        this.mesh.add(this.portalMesh);
        this.mesh.add(this.portalBorder);
        this.mesh.position.set(position.x,position.y,position.z);
    }
    getMesh(){return this.mesh;}
}
