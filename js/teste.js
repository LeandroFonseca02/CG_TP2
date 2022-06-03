import * as THREE from './three/three.module.js';
import Stats from './three/stats.module.js';
import {OrbitControls} from './three/OrbitControls.js';
import * as CANNON from './teste/cannon-es.js';
import CannonDebugger from './teste/cannon-es-debugger.js';
import {GLTFLoader} from './three/GLTFLoader.js';
import cannonUtils from './teste/merda.js';
import {PointerLockControlsCannon} from './teste/PointerLockControlsCannon.js';
import PortalManager from './portal/PortalManager.js';
import {PortalCreator} from './Objects.js';


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
        this.portalManager = new PortalManager(window,this.scene,this.renderer,this.camera);
        this.world = new CANNON.World();
        this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.world.defaultContactMaterial.contactEquationRelaxation = 4

        this.cannonDebugger = new CannonDebugger(this.scene, this.world);

        const solver = new CANNON.GSSolver()
        solver.iterations = 7
        solver.tolerance = 0.1
        this.world.solver = new CANNON.SplitSolver(solver)
        // use this to test non-split solver
        // world.solver = solver

        this.world.gravity.set(0, -50, 0)

        // Create a slippery material (friction coefficient = 0.0)
        const physicsMaterial = new CANNON.Material('physics')
        const physics_physics = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
            friction: 0.0,
            restitution: 0.3,
        })

        // We must add the contact materials to the world
        this.world.addContactMaterial(physics_physics);

        const material = new THREE.MeshStandardMaterial( {color: 0x434c5e, side: THREE.DoubleSide} );
        // const groundShape = new CANNON.Plane();
        // const groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
        // groundBody.addShape(groundShape);
        // groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        // this.world.addBody(groundBody);
        //
        // const geometry = new THREE.PlaneBufferGeometry( 100, 100 ,100,100);
        // const plane = new THREE.Mesh( geometry, material );
        // plane.rotateX(-Math.PI / 2);
        // this.scene.add( plane );

        // let loader = new GLTFLoader();
        // let mesh = new THREE.Mesh();
        //
        // loader.load('./models/trash/trash.glb',  (gltf) => {
        //     gltf.scene.traverse(function(child) {
        //         if (child.isMesh) {
        //             child.castShadow = true;
        //             child.receiveShadow = true;
        //         }
        //     })
        //     let model = gltf.scene.children[0];
        //     model.name = "trash";
        //     model.material.metalness = 0;
        //     // model.position.set(0,0,0);
        //     // model.rotation.set(0,0,0);
        //     model.scale.set(1,1,1);
        //     mesh.add(model);
        //     const nova = cannonUtils.CreateTrimesh(model.geometry);
        //     const modelBody = new CANNON.Body({mass:1})
        //     modelBody.addShape(nova)
        //     // modelBody.position.x = mesh.position.x;
        //     // modelBody.position.y = mesh.position.y;
        //     // modelBody.position.z = mesh.position.z;
        //     this.world.addBody(modelBody);
        // }, undefined, function (error) {
        //     console.error(error);
        // });
        // this.scene.add(mesh);

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

        // const halfExtents2 = new CANNON.Vec3(1, 1, 1);
        // const sphereShape = new CANNON.Sphere(0.2);
        // const sphereGeometry = new THREE.SphereBufferGeometry(halfExtents2.x);
        // this.sphereBody = new CANNON.Body({ mass: 1 })
        // this.sphereBody.addShape(sphereShape)
        // this.sphereMesh = new THREE.Mesh(sphereGeometry, material)
        // this.sphereBody.position.set(x, y+10, z)
        // this.sphereMesh.position.copy(this.sphereBody.position)
        // this.world.addBody(this.sphereBody)
        // this.scene.add(this.sphereMesh)
        //


        const radius = 0.3
        this.sphereShape = new CANNON.Sphere(radius)
        this.sphereBody = new CANNON.Body({ mass: 5, material: physicsMaterial })
        this.sphereBody.addShape(this.sphereShape)
        this.sphereBody.position.set(0, 5, 0)
        this.sphereBody.linearDamping = 0.9
        this.world.addBody(this.sphereBody)


        const normalMaterial = new THREE.MeshNormalMaterial()

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

        this.mundo = new THREE.Group();
        this.mundo.name = "world";
        this.scene.add(this.mundo)




















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
            if(object instanceof PortalCreator){
            // }else if(object instanceof AnimatedModel){
            //     object.update(delta);
            } else{
            object.update();
            }
        });
        const time = performance.now() / 1000
        const dt = time - lastCallTime
        lastCallTime = time

        this.portalManager.update();
        this.portalManager.render();
        this.world.fixedStep(1/60, dt);
        this.boxMesh.position.copy(this.boxBody.position);
        this.boxMesh.quaternion.copy(this.boxBody.quaternion);
        this.icosahedronMesh.position.copy(this.icosahedronBody.position);
        this.icosahedronMesh.quaternion.copy(this.icosahedronBody.quaternion);
        this.cannonDebugger.update();
        this.controls.update(dt);
        console.log(this.controls)
        this.stats.update();

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
        this.portalManager.extractPortalsFromObject(this.scene.getObjectByName("world"),this.scene,this.renderer)
    }
}

let app = new Application();
let objs = [
    new PortalCreator({width:20,height:28},{x:-20,y:17,z:-50},0x5b723c, "p_1","p_2"),
    new PortalCreator({width:20,height:28},{x:-80,y:17,z:30},0xff0000, "p_2","p_1"),
];
app.add(objs);