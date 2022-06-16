import {TextureLoader} from "./three/three.module.js";

class Obj {
    constructor(){}
}

// classe que define as texturas dos nossos objetos
class Material extends Obj{
    constructor(baseTexture, normalTexture, heightTexture, roughnessTexture, aoTexture, metallicTexture) {
        super();
        this.baseTexture = baseTexture;
        this.normalTexture = normalTexture;
        this.heightTexture = heightTexture;
        this.roughnessTexture = roughnessTexture;
        this.aoTexture = aoTexture;
        this.metallicTexture = metallicTexture;
        this.textureLoader = new TextureLoader();
    }
    getBaseTexture(){
        return this.textureLoader.load(this.baseTexture);
    }
    getNormalTexture(){
        return this.textureLoader.load(this.normalTexture);
    }
    getHeightTexture(){
        return this.textureLoader.load(this.heightTexture);
    }
    getRoughnessTexture(){
        return this.textureLoader.load(this.roughnessTexture);
    }
    getAoTexture(){
        return this.textureLoader.load(this.aoTexture);
    }
    getMetallicTexture(){
        return this.textureLoader.load(this.metallicTexture);
    }
}

// classe que define as texturas da Skybox
class SkyboxMaterial extends Obj{
    constructor(textureBK, textureDN, textureFT, textureLF, textureRT, textureUP) {
        super();
        this.textureBK = textureBK;
        this.textureDN = textureDN;
        this.textureFT = textureFT;
        this.textureLF = textureLF;
        this.textureRT = textureRT;
        this.textureUP = textureUP;
        this.textureLoader = new TextureLoader();
    }

    getTextureBK(){
        return this.textureLoader.load(this.textureBK);
    }
    getTextureDN(){
        return this.textureLoader.load(this.textureDN);
    }
    getTextureFT(){
        return this.textureLoader.load(this.textureFT);
    }
    getTextureLF(){
        return this.textureLoader.load(this.textureLF);
    }
    getTextureRT(){
        return this.textureLoader.load(this.textureRT);
    }
    getTextureUP(){
        return this.textureLoader.load(this.textureUP);
    }
}

// classes que define as imagens das texturas dos nossos objetos
export class SkyboxDay extends SkyboxMaterial{
    constructor() {
        super('./textures/Skybox/miramar_bk.jpg','./textures/Skybox/miramar_dn.jpg',
            './textures/Skybox/miramar_ft.jpg','./textures/Skybox/miramar_lf.jpg',
            './textures/Skybox/miramar_rt.jpg','./textures/Skybox/miramar_up.jpg');
    }
}
