import * as THREE from "three";
import { GLTFLoader } from 'https://unpkg.com/three@0.156.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.156.0/examples/jsm/controls/OrbitControls.js';

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 2.2);
scene.add(light);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 5, 0); // von der Seite und oben
scene.add(dirLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

const loader = new GLTFLoader();

loader.load('tests2.glb', function (gltf) {
    const model = gltf.scene;
    scene.add(model);

    // traverse, um den echten Namen zu finden
    let cone = null;
    let glass = null;
    let tür = null;
    let main = null;
    model.traverse((child) => {
        if (child.isMesh) {
            console.log(child.name);
            if (child.name === "klinke") {
                cone = child;
                cone.visible = true; // standardmäßig ausblenden
            }
            if(child.name === "Cube002"){
                glass = child;
                glass.visible = false;
            }
            if(child.name === "Cube002_1"){
                tür = child;
                tür.visible = false;
            }
            if(child.name === "Cube"){
                main = child;
                main.visible = true;
            }
        }
    });

    // Button für sichtbarkeit
    document.getElementById("showCone").addEventListener("click", () => {
        if (cone) {
            cone.visible = !cone.visible;
        }
    });

    document.getElementById("showGlass").addEventListener("click", () => {
        if(glass){
            glass.visible = !glass.visible;
            tür.visible = !tür.visible;
            main.visible = !main.visible;
        }
    });
    // document.addEventListener("keydown", (event) => {
    //     if (event.key === "c" || event.key === "C") {
    //         if (cone) {
    //             cone.visible = !cone.visible;
    //             glass.visible = !glass.visible;
    //             tür.visible = !tür.visible;
    //         }
    //     }
    // });

});
function animate(t = 0) {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
