import * as THREE from './three/three.module.js';
import Stats from './three/stats.module.js';
import {OrbitControls} from './three/OrbitControls.js';
import * as CANNON from './teste/cannon-es.js';
import CannonDebugger from './teste/cannon-es-debugger.js';
import {PointerLockControlsCannon} from './teste/PointerLockControlsCannon.js';
import {Enemy} from "./Enemy.js";
import {Player} from "./Player.js";
import {EnemyManager} from "./EnemyManager.js";


let lastCallTime = performance.now();

class Application {
    constructor() {
        this.objects = [];
        this.createScene();
    }
    createScene() {
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
        this.renderer.shadowMap.enabled = false;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.setClearColor(0xcccccc);
        document.body.appendChild(this.renderer.domElement);
        this.stats = Stats()
        document.body.appendChild(this.stats.dom)
        // this.portalManager = new PortalManager(window,this.scene,this.renderer,this.camera);
        this.world = new CANNON.World();
        this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.world.defaultContactMaterial.contactEquationRelaxation = 4

        this.cannonDebugger = new CannonDebugger(this.scene, this.world);

        const solver = new CANNON.GSSolver()
        solver.iterations = 7
        solver.tolerance = 0.1
        // this.world.solver = new CANNON.SplitSolver(solver)
        // use this to test non-split solver
        // world.solver = solver

        this.world.gravity.set(0, -50, 0)

        // Create a slippery material (friction coefficient = 0.0)
        const physicsMaterial = new CANNON.Material('physics')
        const physics_physics = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
            friction: 1.0,
            restitution: 0.3,
        })

        // We must add the contact materials to the world
        this.world.addContactMaterial(physics_physics);


        this.player = new Player(this.camera);
        this.scene.add(this.player.getMesh())
        this.world.addBody(this.player.getBody())


        const material = new THREE.MeshStandardMaterial( {color: 0x434c5e, side: THREE.DoubleSide} );

        const halfExtents = new CANNON.Vec3(100, 1, 100);
        const boxShape = new CANNON.Box(halfExtents);
        const boxGeometry = new THREE.BoxBufferGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        this.boxBody = new CANNON.Body({ mass: 0 })
        this.boxBody.addShape(boxShape)
        this.boxMesh = new THREE.Mesh(boxGeometry, material)
        const x = 0
        const y = 0
        const z = 0
        this.boxBody.position.set(x, y, z)
        this.boxMesh.position.copy(this.boxBody.position)
        this.world.addBody(this.boxBody)
        this.scene.add(this.boxMesh)


        const ambientLight = new THREE.AmbientLight(0xfdffe1, 0.4);

        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.position.set(0, 500, 0);

        var dirLight = new THREE.DirectionalLight(0xffffff, 2);
        dirLight.position.set(-2.3, 3, 3);

        dirLight.position.multiplyScalar(50);
        dirLight.name = "dirlight";

        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.height = 1024 * 2;

        var d = 350;

        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        dirLight.shadow.camera.far = 3500;
        dirLight.shadow.bias = -0.0001;
        dirLight.shadow.mapSize.width = 512 * 4;
        dirLight.shadow.mapSize.height = 512 * 4;

        this.scene.add(dirLight);
        this.scene.add(hemiLight);
        this.scene.add(ambientLight)

        this.render();


        this.scene.fog = new THREE.Fog( 0xffffff, 10,30);
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



















        // this.enemies = [
        //     new Enemy(this.spawner.getPosition(), 0.08,this.scene, this.world, this.player),
        //     new Enemy(this.spawner.getPosition(), 0.05,this.scene, this.world, this.player),
        //     new Enemy(this.spawner.getPosition(),0.07,this.scene, this.world, this.player),
        //     new Enemy(this.spawner.getPosition(),0.03,this.scene, this.world, this.player)
        // ]

        window.addEventListener('click', (event) => {
            this.player.shoot()
            const playerBalls = this.player.getBalls()
            const playerBallMeshes = this.player.getBallMeshes()
            this.scene.add(playerBallMeshes[playerBallMeshes.length-1])
            this.world.addBody(playerBalls[playerBalls.length-1])
        })

        const instructions = document.getElementById('instructions')
        instructions.addEventListener('click', () => {
           this.player.controls.lock()
        })

        this.player.controls.addEventListener('lock', () => {
            this.player.controls.enabled = true
            instructions.style.display = 'none'
        })

        this.player.controls.addEventListener('unlock', () => {
            this.player.controls.enabled = false
            instructions.style.display = null
        })
    }

    render() {
        requestAnimationFrame((t) => {
            if (this.time === null) {
                this.time = t;
            }

            this.render();
            this.renderer.render(this.scene, this.camera);
            this.renderer.render(this.uiScene, this.uiCamera);
            this.update(t-this.time);
            this.time = t;
        });
    }

    update(timeElapsed){
        const delta = timeElapsed * 0.001;
        const time = performance.now() / 1000
        const dt = time - lastCallTime
        lastCallTime = time
        this.objects.forEach((object) => {
            // if(object instanceof Enemy){
            //     object.update(dt,this.player.controls.yawObject);
            // }else if(object instanceof AnimatedModel){
            //     object.update(delta);
            // } else{
            object.update();
            // }
        });

        // for (let i = 0; i < this.enemies.length; i++) {
        //     this.enemies[i].update(dt,delta)
        // }
        this.boxMesh.position.copy(this.boxBody.position);
        this.enemyManager.update(dt, delta)
        this.boxMesh.quaternion.copy(this.boxBody.quaternion);

        // Update ball positions
        // for (let i = 0; i < this.balls.length; i++) {
        //     this.ballMeshes[i].position.copy(this.balls[i].position)
        //     this.ballMeshes[i].quaternion.copy(this.balls[i].quaternion)
        //
        // }

        this.cannonDebugger.update();
        this.player.update(dt);
        this.stats.update()
        this.world.fixedStep(1/60);
    }

    add(mesh) {
        if (Array.isArray(mesh)){
            for(var index in mesh){
                // if(mesh[index] instanceof Enemy){
                //     this.world.addBody(mesh[index].getBody())
                // }
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
    // new Enemy({x:20,y:0,z:20}, 0.08),
    // new Enemy({x:-30,y:0,z:30}, 0.05),
    // new Enemy({x:40,y:0,z:-40},0.2),
    // new Enemy({x:50,y:0,z:-50},0.1)
];
app.add(objs);
