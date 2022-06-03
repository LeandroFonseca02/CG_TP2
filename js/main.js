import * as THREE from './three/three.module.js';
import {OrbitControls} from './three/OrbitControls.js';
// import {PortalCreator, Skybox} from "./Objects.js";
// import { Jardim, ModelAudio, Boneco, AnimatedModel} from "./Models.js";
// import {FirstPersonControls} from "./three/FirstPersonControls.js";
// import PortalManager from "./portal/PortalManager.js";
import Stats from "./three/stats.module.js";


export const loadingManager = new THREE.LoadingManager();

class Application {

    constructor() {
        this.objects = [];
        this.createScene();
        this.keys = [];
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.z = 158;
        this.camera.position.x = 122;
        this.camera.rotation.y = 0.7893608001951147;
        this.camera.position.y += 15;

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
        this.scene.background = new THREE.Color(0x66688d);

        this.render();

        // Lights
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

        this.world = new THREE.Group();
        this.world.name = "world";
        this.scene.add(this.world)

        // this.portalManager = new PortalManager(window,this.scene,this.renderer,this.camera);


        // // Loading Bar
        // const progressBar = document.getElementById('progress-bar');
        // loadingManager.onProgress = function (url, loaded, total) {
        //     progressBar.value = (loaded / total) * 100;
        // }
        // const progressBarContainer = document.querySelector('.progress-bar-container');
        // loadingManager.onLoad = function () {
        //     progressBarContainer.style.display = 'none';
        // }

        // Stats
        this.stats = Stats()
        document.body.appendChild(this.stats.dom)

        // Controls
        // this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
        // this.scene.add(this.controls.getObject());
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
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
            // if(object instanceof PortalCreator){
            // }else if(object instanceof AnimatedModel){
            //     object.update(delta);
            // } else{
                object.update();
            // }
        });
        // this.portalManager.update();
        // this.portalManager.render();
        this.controls.update();
        this.stats.update();
    }


    add(mesh) {
        if (Array.isArray(mesh)){
            for(let index in mesh){
                // if ( mesh[index] instanceof ModelAudio){
                //     this.objects.push(mesh[index]);
                //     this.scene.add( mesh[index].getMesh() );
                //     mesh[index].addSound(this.camera);
                // } else{
                    this.objects.push(mesh[index]);
                    this.world.add( mesh[index].getMesh() );
                // }
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
    // new Skybox({width:2000, height:2000, depth:2000},{x:0, y:300, z:0}),
    // new Jardim({x:0, y:0, z:0}),
    // new PortalCreator({width:20,height:28},{x:-20,y:15,z:-150},0x5b723c, "p_1","p_2"),
    // new PortalCreator({width:20,height:28},{x:-80,y:15,z:30},0xff0000, "p_2","p_1"),
    // new Boneco({x:30, y:0, z:40}, {x:0, y:0, z:0})

];

app.add(objs);
