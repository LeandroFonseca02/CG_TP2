import * as THREE from "./three/three.module.js";
import {Enemy} from "./Enemy.js";

export class Spawn{
    constructor(player) {
        this.radius = 40;
        this.playerPosition = player.controls.yawObject.position
        this.player = player

    }

    getPosition(){
        let angle = Math.random()*Math.PI*2;
        return new THREE.Vector3(Math.cos(angle)*this.radius+this.playerPosition.x, 0, Math.sin(angle)*this.radius+this.playerPosition.z)
    }
}
