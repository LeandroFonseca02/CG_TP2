import * as THREE from "./three/three.module.js";
import {SkyboxDay} from "./Textures.js";


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
