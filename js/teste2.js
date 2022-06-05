import * as THREE from './three/three.module.js';
import Stats from './three/stats.module.js';
import {OrbitControls} from './three/OrbitControls.js';
import * as CANNON from './teste/cannon-es.js';
import CannonDebugger from './teste/cannon-es-debugger.js';
import {GLTFLoader} from './three/GLTFLoader.js';
import {PointerLockControlsCannon} from './teste/PointerLockControlsCannon.js';
import {Vec3} from "./teste/cannon-es.js";

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

        const material = new THREE.MeshStandardMaterial( {color: 0x434c5e, side: THREE.DoubleSide} );

        let loader = new GLTFLoader();
        this.mesh = new THREE.Mesh();

        const halfExtents = new CANNON.Vec3(100, 1, 100);
        const boxShape = new CANNON.Box(halfExtents);
        const boxGeometry = new THREE.BoxBufferGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
        this.boxBody = new CANNON.Body({mass:0})
        this.boxBody.addShape(boxShape)
        this.boxMesh = new THREE.Mesh(boxGeometry, material)
        const x = 0
        const y = 0
        const z = 0
        this.boxBody.position.set(x, y, z)
        this.boxMesh.position.copy(this.boxBody.position)
        this.world.addBody(this.boxBody)
        this.scene.add(this.boxMesh)

        const normalMaterial = new THREE.MeshNormalMaterial()




        const radius = 0.3
        this.sphereShape = new CANNON.Sphere(radius)
        this.sphereBody = new CANNON.Body({ mass: 5, material: physicsMaterial })
        this.sphereBody.addShape(this.sphereShape)
        this.sphereBody.position.set(0, 5, 0)
        this.sphereBody.linearDamping = 0.9
        this.world.addBody(this.sphereBody)

        this.mundo = new THREE.Group();
        this.mundo.name = "world";
        this.scene.add(this.mundo)


        this.balls = []
        this.ballMeshes = []


        const shootVelocity = 15
        const ballShape = new CANNON.Sphere(0.1)
        const ballGeometry = new THREE.SphereBufferGeometry(ballShape.radius, 32, 32)


        function getShootDirection(camera, sphereBody) {
            const vector = new THREE.Vector3(0, 0, 1)
            vector.unproject(camera)
            const ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize())
            return ray.direction
        }

        this.bullets = []
        this.bulletBodys = []
        window.addEventListener('click', (event) => {
            var bullet = new THREE.Mesh(
                new THREE.SphereGeometry(0.05,8,8),
                new THREE.MeshBasicMaterial({color:0xffffff})
            );

            this.bulletBody = new CANNON.Body({mass:0})
            this.bulletShape = new CANNON.Sphere(0.05)
            this.bulletBody.addShape(this.bulletShape)
            this.world.addBody(this.bulletBody)
            // this is silly.
            // var bullet = models.pirateship.mesh.clone();

            // position the bullet to come from the player's weapon
            bullet.position.set(
                this.controls.yawObject.position.x,
                this.controls.yawObject.position.y+0.1,
                this.controls.yawObject.position.z
            );

            // set the velocity of the bullet
            // bullet.velocity = new THREE.Vector3(
            //     -Math.sin( this.controls.yawObject.rotation.y),
            //     0,
            //     Math.cos( this.controls.yawObject.rotation.y)
            // );
            const atoa = getShootDirection(this.camera, this.sphereBody)
            bullet.velocity = new THREE.Vector3(atoa.x/10,atoa.y/10,atoa.z/10)

                // after 1000ms, set alive to false and remove from scene
            // setting alive to false flags our update code to remove
            // the bullet from the bullets array
            // bullet.alive = true;
            // setTimeout(function(){
            //     bullet.alive = false;
            //     this.scene.remove(bullet);
            // }, 1000);

            // add to scene, array, and set the delay to 10 frames
            this.bullets.push(bullet);
            this.scene.add(bullet);
            this.bulletBodys.push(this.bulletBody)
            // player.canShoot = 10;

            // if (!this.controls.enabled) {
            //     return
            // }
            //
            // this.ballBody = new CANNON.Body({ mass: 0.000000000000000000000000000001 })
            // this.ballBody.addShape(ballShape)
            // const ballMesh = new THREE.Mesh(ballGeometry, material)
            //
            // ballMesh.castShadow = true
            // ballMesh.receiveShadow = true
            //
            // this.world.addBody(this.ballBody)
            // this.scene.add(ballMesh)
            // this.balls.push(this.ballBody)
            // this.ballMeshes.push(ballMesh)
            //
            // const shootDirection = getShootDirection(this.camera, this.sphereBody)
            // this.ballBody.velocity.set(
            //     shootDirection.x * shootVelocity,
            //     shootDirection.y * shootVelocity,
            //     shootDirection.z * shootVelocity
            // )
            //
            // // Move the ball outside the player sphere
            // const x = this.sphereBody.position.x + shootDirection.x * (this.sphereShape.radius * 1.02 + ballShape.radius)
            // const y = this.sphereBody.position.y + shootDirection.y * (this.sphereShape.radius * 1.02 + ballShape.radius)
            // const z = this.sphereBody.position.z + shootDirection.z * (this.sphereShape.radius * 1.02 + ballShape.radius)
            // this.ballBody.position.set(x, y, z)
            // ballMesh.position.copy(this.ballBody.position)

            // this.bulletBody.position.copy(bullet.position)
            // this.bulletBody.quaternion.copy(bullet.quaternion)
        })

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
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls = new PointerLockControlsCannon(this.camera, this.sphereBody);
        this.scene.add(this.controls.getObject())
        const instructions = document.getElementById('instructions')
        instructions.addEventListener('click', () => {
            this.controls.lock()
        })

        this.controls.addEventListener('lock', () => {
            this.controls.enabled = true
            instructions.style.display = 'none'
        })

        this.controls.addEventListener('unlock', () => {
            this.controls.enabled = false
            instructions.style.display = null
        })

        const halfExtents2 = new CANNON.Vec3(0.5, 0.5, 0.5);
        this.boxShape2 = new CANNON.Box(halfExtents2);
        const boxGeometry2 = new THREE.BoxBufferGeometry(halfExtents2.x * 2, halfExtents2.y * 2, halfExtents2.z * 2);
        this.boxBody2 = new CANNON.Body({ isTrigger: true})
        this.boxBody2.addShape(this.boxShape2)
        this.boxMesh2 = new THREE.Mesh(boxGeometry2, normalMaterial)
        this.boxBody2.position.set(0, 2, 20)
        this.boxMesh2.position.copy(this.boxBody2.position)
        this.world.addBody(this.boxBody2)
        this.scene.add(this.boxMesh2)
        this.boxBody2.addEventListener('collide', (event)=>{
            console.log("e")
                if(event.body===this.bulletBody){
                    this.scene.remove(this.boxMesh2)
                    this.world.removeBody(this.boxBody2)
                }
        })
    }

    calculate(){

        this.array = [this.mesh.position, this.controls.yawObject.position]
        this.spline = new THREE.CatmullRomCurve3( this.array );
        this.lineSegments = 21;
        this.points = this.spline.getPoints( this.lineSegments);
        this.dx = this.controls.yawObject.position.x-this.mesh.position.x

        this.dz = this.controls.yawObject.position.z-this.mesh.position.z
        this.lenght = Math.sqrt(this.dx*this.dx+this.dz*this.dz)

        if(this.lenght){
            this.dx /= this.lenght
            this.dz /= this.lenght
        }

    }

    movement(delta){

        this.rotationMatrix = new THREE.Matrix4();
        this.targetQuaternion = new THREE.Quaternion();
        this.rotationMatrix.lookAt(this.controls.yawObject.position, this.mesh.position, this.mesh.up);
        this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix);
        this.mesh.quaternion.rotateTowards(this.targetQuaternion, delta*2);
        this.speed = 0.05
        this.mesh.position.x += this.dx*this.speed
        this.mesh.position.z += this.dz*this.speed
    }

    render() {
        requestAnimationFrame((t) => {
            if (this.time === null) {
                this.time = t;
            }

            this.render();
            this.renderer.render(this.scene, this.camera);
            this.update(t-this.time);
            this.time = t;
        });
    }

    update(timeElapsed){
        const delta = timeElapsed * 0.001;
        this.objects.forEach((object) => {
                object.update();

        });
        const time = performance.now() / 1000
        const dt = time - lastCallTime
        lastCallTime = time

        // this.portalManager.update();
        // this.portalManager.render();

        this.boxMesh.position.copy(this.boxBody.position);
        this.boxMesh.quaternion.copy(this.boxBody.quaternion);

        // Update ball positions
        for (let i = 0; i < this.bulletBodys.length; i++) {
            this.bulletBodys[i].position.copy(this.bullets[i].position)
            this.bulletBodys[i].quaternion.copy(this.bullets[i].quaternion)
            this.bulletBodys[i].addEventListener('collide', (event)=>{
                    if(event.body===this.boxBody){
                        console.log("this balls")
                    }
            })
        }

        for(var index=0; index<this.bullets.length; index+=1){
            if( this.bullets[index] === undefined ) continue;
            if( this.bullets[index].alive == false ){
                this.bullets.splice(index,1);
                continue;
            }

            this.bullets[index].position.add(this.bullets[index].velocity);
        }


        this.cannonDebugger.update();
        this.controls.update(dt);
        this.stats.update();
        this.calculate()
        this.movement(dt)
        this.world.fixedStep(1/60);
    }

    add(mesh) {
        if (Array.isArray(mesh)){
            for(var index in mesh){
                this.objects.push(mesh[index]);
                this.mundo.add( mesh[index].getMesh() );
            }
        }
        else{
            this.objects.push(mesh);
            this.mundo.add(mesh.getMesh());
        }
    }
}

let app = new Application();
let objs = [

];
app.add(objs);