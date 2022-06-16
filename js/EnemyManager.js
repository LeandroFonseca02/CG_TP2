import {Enemy} from "./Enemy.js";
import {Spawn} from "./Spawn.js";

export class EnemyManager{
    constructor(scene, world, player) {
        this.scene = scene;
        this.world = world;
        this.player = player;
        this.spawnTime = 1500;
        this.lastSpawn = 0;
        this.time = 0;
        this.speed = 0.08;
        this.spawn = new Spawn(this.player);
        this.enemies = [];
        this.gameScore = 0;
        this.gameOver = false;
    }

    update(dt, delta){
        const spawnTimer = new Date().valueOf();
        if(this.lastSpawn===0 || spawnTimer-this.lastSpawn>this.spawnTime){
            let enemy = new Enemy(this.spawn.getPosition(), this.speed, this.scene, this.world, this.player);
            this.scene.add(enemy.getMesh());
            this.world.addBody(enemy.getBody());
            this.enemies.push(enemy);
            this.lastSpawn = spawnTimer;
        }

        for (let i = 0; i < this.enemies.length; i++) {
            if(this.enemies[i].isAlive === false){
                this.enemies.splice(i,1);
                this.gameScore += 100;
            }else if(this.enemies[i].playerDead === true){
                this.gameOver = true;
            }else {
                this.enemies[i].update(dt, delta);
            }
        }
    }

    getGameScore(){return this.gameScore;}
    getGameOver(){return this.gameOver;}
}
