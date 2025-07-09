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

let tuer = null;
let glass = null;
let klinke = null;
const models = [];

loader.load('tür.glb', (gltf) => {
    scene.add(gltf.scene);
    models.push(gltf.scene);
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            console.log(child.name);
            if(child.name === "Cube"){
                tuer = child;
            }
        }
    });
    tuer.visible = true;
});

loader.load('klinke.glb', (gltf) => {
    klinke = gltf.scene;
    scene.add(klinke);
    klinke.traverse((c) => {
        if (c.isMesh) console.log(c.name);
    });
    klinke.visible = false;
});

loader.load('glass.glb', (gltf) => {
    scene.add(gltf.scene);
    models.push(gltf.scene);
    gltf.scene.traverse((c) => {
        if (c.isMesh) {
            console.log(c.name);
            if (c.name === "glass_2") {
                glass = c;
            }
        }
    });
    gltf.scene.traverse(function(n) {
        if(n.isMesh){
            if(n.name === "glass_2")
            n.material = new THREE.MeshStandardMaterial({color: 0xccff })
        }
    });
    gltf.scene.visible = false;
});

document.getElementById("showTuer").addEventListener("click", () => change(0));

document.getElementById("showGlass").addEventListener("click", () => change(1));

document.getElementById("showKlinke").addEventListener("click", () => {
    if (klinke) {
        klinke.visible = !klinke.visible;
    }
});

function change(ind){
    models.forEach((m, i) => {
        m.visible = (i === ind);
    });
}

document.getElementById("colorPicker").addEventListener("input", (event) => {
    const hexColor = event.target.value;
    if (glass && glass.material) {
        glass.material = new THREE.MeshStandardMaterial({ color: hexColor, metalness: 0, roughness: 1 });
    }
    if(tuer && tuer.material){
        tuer.material = new THREE.MeshStandardMaterial({ color: hexColor, metalness: 0, roughness: 1 });
    }
});


function animate(t = 0) {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
