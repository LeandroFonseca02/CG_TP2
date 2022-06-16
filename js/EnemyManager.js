import {Enemy} from "./Enemy.js";
import {Spawn} from "./Spawn.js";

export class EnemyManager{
    constructor(scene, world, player) {
        this.scene = scene;
        this.world = world;
        this.player = player;
        this.spawnTime = 3000;
        this.lastSpawn = 0;
        this.time = 0;
        this.speed = 0.03;
        this.spawn = new Spawn(this.player);
        this.enemies = [];
        this.gameScore = 0;
        this.gameOver = false;
        this.minutesPlayed = 0;
    }

    update(dt, delta, playedTime){
        const spawnTimer = new Date().valueOf();
        if(this.lastSpawn===0 || spawnTimer-this.lastSpawn>this.spawnTime){
            let enemy = new Enemy(this.spawn.getPosition(), this.speed, this.scene, this.world, this.player);
            this.scene.add(enemy.getMesh());
            this.world.addBody(enemy.getBody());
            this.enemies.push(enemy);
            this.lastSpawn = spawnTimer;
        }

        if(parseInt( playedTime/60) > this.minutesPlayed){
            this.minutesPlayed++;
            this.spawnTime -= 350;
            this.speed += 0.005;
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
