import * as THREE from './three/three.module.js';
import Stats from './three/stats.module.js';
import {OrbitControls} from './three/OrbitControls.js';
import * as CANNON from './teste/cannon-es.js';
import CannonDebugger from './teste/cannon-es-debugger.js';
import {PointerLockControlsCannon} from './teste/PointerLockControlsCannon.js';
import {Enemy} from "./Enemy.js";



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

        const normalMaterial = new THREE.MeshNormalMaterial()





        const radius = 0.3
        this.sphereShape = new CANNON.Sphere(radius)
        this.sphereBody = new CANNON.Body({ mass: 5, material: physicsMaterial })
        this.sphereBody.addShape(this.sphereShape)
        this.sphereBody.position.set(0, 5, 0)
        this.sphereBody.linearDamping = 0.9
        this.world.addBody(this.sphereBody)




        const icosahedronGeometry = new THREE.IcosahedronGeometry(1, 0)
        this.icosahedronMesh = new THREE.Mesh(icosahedronGeometry, normalMaterial)
        this.icosahedronMesh.position.x = 1
        this.icosahedronMesh.position.y = 3
        this.icosahedronMesh.castShadow = true
        this.scene.add(this.icosahedronMesh)
        let position = this.icosahedronMesh.geometry.attributes.position.array
        const icosahedronPoints = []
        for (let i = 0; i < position.length; i += 3) {
            icosahedronPoints.push(new CANNON.Vec3(position[i], position[i + 1], position[i + 2]))
        }
        const icosahedronFaces = []
        for (let i = 0; i < position.length / 3; i += 3) {
            icosahedronFaces.push([i, i + 1, i + 2])
        }
        const icosahedronShape = new CANNON.ConvexPolyhedron({
            vertices: icosahedronPoints,
            faces: icosahedronFaces,
        })
        this.icosahedronBody = new CANNON.Body({ mass: 1 })
        this.icosahedronBody.addShape(icosahedronShape)
        this.icosahedronBody.position.x = this.icosahedronMesh.position.x
        this.icosahedronBody.position.y = this.icosahedronMesh.position.y
        this.icosahedronBody.position.z = this.icosahedronMesh.position.z
        this.world.addBody(this.icosahedronBody)



        this.balls = []
        this.ballMeshes = []


        const shootVelocity = 90
        const ballShape = new CANNON.Sphere(0.1)
        const ballGeometry = new THREE.SphereBufferGeometry(ballShape.radius, 32, 32)


        function getShootDirection(camera, sphereBody) {
            const vector = new THREE.Vector3(0, 0, 1)
            vector.unproject(camera)
            const ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize())
            return ray.direction
        }

        window.addEventListener('click', (event) => {
            if (!this.controls.enabled) {
                return
            }

            this.ballBody = new CANNON.Body({ mass: 0.1})
            this.ballBody.addShape(ballShape)
            const ballMesh = new THREE.Mesh(ballGeometry, material)

            ballMesh.castShadow = true
            ballMesh.receiveShadow = true

            this.world.addBody(this.ballBody)
            this.scene.add(ballMesh)
            this.balls.push(this.ballBody)
            this.ballMeshes.push(ballMesh)

            const shootDirection = getShootDirection(this.camera, this.sphereBody)
            this.ballBody.velocity.set(
                shootDirection.x * shootVelocity,
                shootDirection.y * shootVelocity,
                shootDirection.z * shootVelocity
            )

            // Move the ball outside the player sphere
            const x = this.sphereBody.position.x + shootDirection.x * (this.sphereShape.radius * 1.02 + ballShape.radius)
            const y = this.sphereBody.position.y + shootDirection.y * (this.sphereShape.radius * 1.02 + ballShape.radius)
            const z = this.sphereBody.position.z + shootDirection.z * (this.sphereShape.radius * 1.02 + ballShape.radius)
            this.ballBody.position.set(x, y, z)
            ballMesh.position.copy(this.ballBody.position)
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

        // this.tangent = 0;
        // this.normal = new THREE.Vector3( );
        // this.binormal = new THREE.Vector3( 0, 1, 0 );
        //
        // this.tangents = [];
        // this.normals = [];
        // this.binormals = [];
        //
        // for (let j = 0; j < this.lineSegments+1; j ++ ) {
        //     this.tangent = this.spline.getTangent(  j / this.lineSegments );
        //     this.tangents.push( this.tangent.clone( ) );
        //
        //     this.normal.crossVectors( this.tangent, this.binormal );
        //
        //     this.normal.y = 0; // to prevent lateral slope of the road
        //
        //     this.normal.normalize( );
        //     this.normals.push( this.normal.clone( ) );
        //
        //     this.binormal.crossVectors( this.normal, this.tangent ); // new binormal
        //     this.binormals.push( this.binormal.clone( ) );
        // }
        //
        // this.M3 = new THREE.Matrix3( );
        // this.M4 = new THREE.Matrix4( );
        // this.lineSegmentCounter = 0;
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
        // if ( this.lineSegmentCounter >= this.lineSegments+1 ) {
        //     this.lineSegmentCounter = 0;
        // }
        //
        // this.M3.set( this.tangents[ this.lineSegmentCounter ].x, this.binormals[ this.lineSegmentCounter ].x, this.normals[ this.lineSegmentCounter ].x, this.tangents[ this.lineSegmentCounter ].y, this.binormals[ this.lineSegmentCounter ].y, this.normals[ this.lineSegmentCounter ].y, this.tangents[ this.lineSegmentCounter ].z, this.binormals[ this.lineSegmentCounter ].z, this.normals[ this.lineSegmentCounter ].z );
        // this.M4.setFromMatrix3( this.M3 );
        //
        // this.mesh.setRotationFromMatrix( this.M4 );
        // this.mesh.position.set( this.points[ this.lineSegmentCounter ].x + 0.18 * this.normals[ this.lineSegmentCounter ].x, this.points[ this.lineSegmentCounter ].y, this.points[ this.lineSegmentCounter ].z + 0.18 * this.normals[ this.lineSegmentCounter ].z );
        // this.lineSegmentCounter += 80;
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
        const time = performance.now() / 1000
        const dt = time - lastCallTime
        lastCallTime = time
        this.objects.forEach((object) => {
            if(object instanceof Enemy){
                object.update(dt,this.controls.yawObject);
            // }else if(object instanceof AnimatedModel){
            //     object.update(delta);
            } else{
            object.update();
            }
        });


        // this.portalManager.update();
        // this.portalManager.render();

        this.boxMesh.position.copy(this.boxBody.position);
        this.boxMesh.quaternion.copy(this.boxBody.quaternion);
        // this.boxMesh2.position.copy(this.boxBody2.position);
        // this.boxMesh2.quaternion.copy(this.boxBody2.quaternion);
        this.icosahedronMesh.position.copy(this.icosahedronBody.position);
        this.icosahedronMesh.quaternion.copy(this.icosahedronBody.quaternion);
        // Update ball positions
        for (let i = 0; i < this.balls.length; i++) {
            this.ballMeshes[i].position.copy(this.balls[i].position)
            this.ballMeshes[i].quaternion.copy(this.balls[i].quaternion)

        }

        this.cannonDebugger.update();
        this.controls.update(dt);
        this.stats.update();
        // this.calculate()
        // this.movement(dt)
        // this.boxBody2.position.set(this.mesh.position.x, this.mesh.position.y+2, this.mesh.position.z);
        // this.boxBody2.quaternion.copy(this.mesh.quaternion);
        this.world.fixedStep(1/60);
    }

    add(mesh) {
        if (Array.isArray(mesh)){
            for(var index in mesh){
                if(mesh[index] instanceof Enemy){
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
        // this.portalManager.extractPortalsFromObject(this.scene.getObjectByName("world"),this.scene,this.renderer)
    }
}

let app = new Application();
let objs = [
    new Enemy({x:20,y:0,z:20})
    // new PortalCreator({width:20,height:28},{x:-20,y:17,z:-50},0x5b723c, "p_1","p_2"),
    // new PortalCreator({width:20,height:28},{x:-80,y:17,z:30},0xff0000, "p_2","p_1"),
];
app.add(objs);
