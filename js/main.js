import * as THREE from './three/three.module.js';
import Stats from './three/stats.module.js';
import * as CANNON from './cannon/cannon-es.js';
import CannonDebugger from './cannon/cannon-es-debugger.js';
import {Player} from "./Player.js";
import {EnemyManager} from "./EnemyManager.js";
import {Skybox} from "./Objects.js";
import {Car, Container, DeadTree, Fence, Ground, House, RigidModel, Sofa, Stop, WashingMachine, WaterTower} from "./Models.js";


export const loadingManager = new THREE.LoadingManager();


class Application {
    constructor() {
        this.objects = [];
        this.createScene();
    }
    createScene() {
        this.gameEnable = false;
        this.lastCallTime = performance.now();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60,
            window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.y = 0;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
        });
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.autoClear = false;
        this.renderer.info.autoReset = false;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.setClearColor(0xcccccc);
        document.body.appendChild(this.renderer.domElement);
        this.stats = Stats()
        document.body.appendChild(this.stats.dom)
        this.renderer.domElement.style.width = 98 + "%";
        this.renderer.domElement.style.height = 85 + "%";

        this.world = new CANNON.World();
        this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.world.defaultContactMaterial.contactEquationRelaxation = 4

        this.cannonDebugger = new CannonDebugger(this.scene, this.world);

        const solver = new CANNON.GSSolver()
        solver.iterations = 7
        solver.tolerance = 0.1
        this.world.solver = new CANNON.SplitSolver(solver)
        this.world.solver = solver

        this.world.gravity.set(0, -50, 0)

        const physicsMaterial = new CANNON.Material('physics')
        const physics_physics = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
            friction: 1.0,
            restitution: 0.3,
        })

        this.world.addContactMaterial(physics_physics);


        this.player = new Player(this.camera,this.scene,this.world);
        this.scene.add(this.player.getMesh())
        this.world.addBody(this.player.getBody())

        let ambientLight = new THREE.AmbientLight(0xfdffe1, 0.4);

        let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.position.set(0, 500, 0);

        let dirLight = new THREE.DirectionalLight(0xffffff, 2);
        dirLight.position.set(-7, 10, 11);

        dirLight.name = "dirlight";

        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.height = 512 * 2;

        let d = 30;

        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        //
        dirLight.shadow.camera.near = 0.001; // default
        dirLight.shadow.camera.far = 150;
        dirLight.shadow.bias = -0.00001;


        this.scene.add(dirLight);
        this.scene.add(hemiLight);
        this.scene.add(ambientLight)

        this.render();


        this.scene.fog = new THREE.Fog( 0x4c566a, 5,18);
        this.scene.background=this.scene.fog.color
        this.enemyManager = new EnemyManager(this.scene, this.world, this.player)

        this.uiScene = new THREE.Scene();
        this.uiCamera = new THREE.OrthographicCamera(
            -1, 1, this.camera.aspect, -1 * this.camera.aspect, 1, 1000);

        let mapLoader = new THREE.TextureLoader()
        const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
        const crosshair = mapLoader.load('./textures/crosshair/crosshair.png');
        crosshair.anisotropy = maxAnisotropy;

        this.sprite_ = new THREE.Sprite(
            new THREE.SpriteMaterial({map: crosshair, color: 0xffffff, fog: false, depthTest: false, depthWrite: false}));
        this.sprite_.scale.set(0.05, 0.085*this.camera.aspect, 1)
        this.sprite_.position.set(0, 0, -10);

        this.uiScene.add(this.sprite_);

        this.initialTime = null;
        this.playedTime = 0;
        this.gameScore = 0;
        this.gameOver = false;


        this.formattedTime = null;


        window.addEventListener('click', (event) => {
            this.player.shoot()
        })

        const progressBar = document.getElementById('progress-bar');
        loadingManager.onProgress = function (url, loaded, total) {
            progressBar.value = (loaded / total) * 100;
        }
        const progressBarContainer = document.querySelector('.progress-bar-container');
        loadingManager.onLoad = function () {
            progressBarContainer.style.display = 'none';
        }


        const instructions = document.getElementById('instructions')
        instructions.addEventListener('click', () => {
           this.player.controls.lock()
        })

        this.player.controls.addEventListener('lock', () => {
            this.player.controls.enabled = true
            instructions.style.display = 'none'
            this.gameEnable = true;
            if(this.initialTime === null){
                this.initialTime = new Date().valueOf();
            }
        })

        this.player.controls.addEventListener('unlock', () => {
            this.player.controls.enabled = false
            instructions.style.display = null
            this.gameEnable = false;
        })

        this.score = document.createElement('div');
        this.score.style.position = 'absolute';
        this.score.style.width = 200;
        this.score.style.height = 200;
        this.score.innerHTML = "Score: " + this.gameScore;
        this.score.style.top = 15 + 'px';
        this.score.style.left = 200 + 'px';
        this.score.style.fontSize = 30 + 'px'
        document.body.appendChild(this.score);

        this.gameOverDiv = document.getElementById("gameover")
        this.gameOverDiv.style.display = 'none';
    }

    render() {
        requestAnimationFrame((t) => {
            if (this.time === null) {
                this.time = t;
            }

            this.render();
            this.renderer.render(this.scene, this.camera);
            this.renderer.render(this.uiScene, this.uiCamera);
            if(this.gameEnable !== false){
                if(this.gameOver === true){
                    this.gameEnable = false;
                    this.gameOverDiv.style.display = 'inline';
                    this.score.style.color = "white";
                }else{
                    this.update(t-this.time);
                    this.time = t;
                    let time = new Date().valueOf();
                    this.playedTime = (time-this.initialTime)/1000;
                }
            }else {
                this.player.controls.yawObject.rotation.y += 0.1;
            }
        });
    }

    update(timeElapsed){
        const delta = timeElapsed * 0.001;
        const time = performance.now() / 1000
        const dt = time - this.lastCallTime
        this.lastCallTime = time
        this.objects.forEach((object) => {
            object.update();
        });

        this.enemyManager.update(dt, delta, this.playedTime)


        this.gameScore = this.enemyManager.getGameScore();
        this.gameOver = this.enemyManager.getGameOver();
        this.formattedTime = this.getFormattedTime()
        this.score.innerHTML = "Score: " + this.gameScore + " Tempo Sobrevivido: " + this.formattedTime;

        // this.cannonDebugger.update();
        this.player.update(dt);
        this.stats.update()
        this.world.fixedStep(1/60);
    }

    getFormattedTime(){
        let minutes = 0;
        if(this.playedTime/60 > 0){
            minutes = parseInt( this.playedTime/60);
        }
        let seconds = parseInt(this.playedTime - minutes*60);
        if(seconds < 10){
            seconds = "0" + seconds;
        }

        return "" + minutes + ":" + seconds;
    }


    add(mesh) {
        if (Array.isArray(mesh)){
            for(let index in mesh){
                if(mesh[index] instanceof RigidModel){
                    this.world.addBody(mesh[index].getBody())
                }
                this.objects.push(mesh[index]);
                this.scene.add( mesh[index].getMesh() );
            }
        }
        else{
            this.objects.push(mesh);
            this.scene.add(mesh.getMesh());
        }
    }
}

let app = new Application();
let objs = [
    new Skybox({width:250,height:250,depth:250},{x:0,y:0,z:0}),
    new Ground({x:0,y:0,z:0}, {x:0,y:0,z:0}),
    new House({x:5.790,y:1,z:-5.900}, {x:0,y:Math.PI*2-0.550,z:0}),
    new WaterTower({x:6.930,y:0.95,z:6.9}, {x:0,y:0.530,z:0}),
    new Container({x:-6.360,y:1.63,z:-7.170}, {x:-3.142,y:-0.618,z:-3.142}),
    new Sofa({x:-6.330,y:1,z:-6.110}, {x:0,y:0,z:0}),
    new Stop({x:-6.220,y:1.130,z:-6.400}, {x:1.680,y:2.440,z:-0.480}),

    //esquerda do armazem
    new DeadTree({x:3.890,y:1,z:-7.260}, {x:0,y:1,z:0},4),
    new DeadTree({x:1.270,y:1,z:-7.160}, {x:0,y:2,z:0},2),
    new DeadTree({x:-1.860,y:1,z:-7.340}, {x:0,y:3,z:0},4),
    new DeadTree({x:-5.380,y:1,z:-7.420}, {x:0,y:4,z:0},2),
    new DeadTree({x:-3.430,y:1,z:-7.280}, {x:0,y:5,z:0},1),
    new DeadTree({x:-5.090, y:1,z:-5.180}, {x:0,y:6,z:0},4),
    new DeadTree({x:2.270, y:1,z:-5.480}, {x:0,y:7,z:0},4),
    new DeadTree({x:-0.020, y:1,z:-5.080}, {x:0,y:8,z:0},2),
    new DeadTree({x:3.890, y:1,z:-5.680}, {x:0,y:9,z:0},4),
    new DeadTree({x:-2.370, y:1,z:-5.780}, {x:0,y:10,z:0},1),

    //lado contrário da esquerda do armazém
    new DeadTree({x:3.890,y:1,z:7.360}, {x:0,y:1,z:0},2),
    new DeadTree({x:1.270,y:1,z:7.260}, {x:0,y:2,z:0},2),
    new DeadTree({x:-1.860,y:1,z:57.760}, {x:0,y:3,z:0},4),
    new DeadTree({x:-5.380,y:1,z:7.560}, {x:0,y:4,z:0},4),
    new DeadTree({x:-3.430,y:1,z:7.460}, {x:0,y:5,z:0},1),
    new DeadTree({x:-0.50, y:1,z:7.060}, {x:0,y:6,z:0},4),
    new DeadTree({x:-5.090, y:1,z:5.780}, {x:0,y:7,z:0},1),
    new DeadTree({x:2.270, y:1,z:5.680}, {x:0,y:8,z:0},1),
    new DeadTree({x:-0.020, y:1,z:5.980}, {x:0,y:9,z:0},2),
    new DeadTree({x:3.890, y:1,z:5.480}, {x:0,y:10,z:0},4),
    new DeadTree({x:-2.370, y:1,z:5.180}, {x:0,y:11,z:0},4),

    //lado contrário da direita do armazém
    new DeadTree({x:-6.590, y:1,z:-2.390}, {x:0,y:1,z:0},4),
    new DeadTree({x:-6.690, y:1,z:-0.210}, {x:0,y:2,z:0},2),
    new DeadTree({x:-6.490, y:1,z:3.120}, {x:0,y:3,z:0},2),
    new DeadTree({x:-6.790, y:1,z:-4.760}, {x:0,y:4,z:0},4),
    new DeadTree({x:-4.390, y:1,z:-2.390}, {x:0,y:1,z:0},1),
    new DeadTree({x:-4.890, y:1,z:-0.210}, {x:0,y:2,z:0},2),
    new DeadTree({x:-4.290, y:1,z:3.120}, {x:0,y:3,z:0},1),


    //esquerda do armazem
    new DeadTree({x:6.590, y:1,z:-2.390}, {x:0,y:1,z:0},2),
    new DeadTree({x:6.190, y:1,z:-0.210}, {x:0,y:2,z:0},1),
    new DeadTree({x:6.790, y:1,z:3.120}, {x:0,y:3,z:0},4),
    new DeadTree({x:6.280, y:1,z:-4.220}, {x:0,y:4,z:0},1),
    new DeadTree({x:4.690, y:1,z:-2.390}, {x:0,y:1,z:0},4),
    new DeadTree({x:4.190, y:1,z:-0.210}, {x:0,y:2,z:0},1),
    new DeadTree({x:4.590, y:1,z:3.120}, {x:0,y:3,z:0},2),
    new DeadTree({x:4.380, y:1,z:-4.220}, {x:0,y:4,z:0},2),

    new WashingMachine({x:-5.440,y:1,z:-6.760}, {x:-3.141,y:2.412,z:3.141}),
    new Car({x:6.150,y:1,z:6.590}, {x:-3.142,y:0.842,z:-3.142}),
    new Fence({x:9.4,y:1,z:0}, {x:0,y:-Math.PI/2,z:0}),
    new Fence({x:-9.4,y:1,z:0}, {x:0,y:Math.PI/2,z:0}),
    new Fence({x:0,y:1,z:9.4}, {x:0,y:0,z:0}),
    new Fence({x:0,y:1,z:-9.4}, {x:0,y:0,z:0}),

];
app.add(objs);
