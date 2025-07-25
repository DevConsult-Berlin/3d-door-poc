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
camera.position.y = 2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 2.2);
scene.add(light);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
dirLight.position.set(0, 2, 3);
dirLight.castShadow = true;
scene.add(dirLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

const loader = new GLTFLoader();

let tuer = null;
let klinke = null;
let glass = null;
const handles = [];
let door = null;
const doorParts = [];
let bild = null;
let mittlereSchloss = null;
let obereSchloss = null;
let mittelstueck = null;
let originalGlassMat = null;
let originalDoorMat = null;
let door2 = null;
const doors = [];

const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = - Math.PI / 2;
plane.position.y = -2;
plane.receiveShadow = true;
scene.add(plane);

loader.load("door1.glb", (gltf) => {
    scene.add(gltf.scene);
    door = gltf.scene;
    doors[0] = gltf.scene;
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            console.log("Door 1: ", child.name);

            child.castShadow = true;
            child.receiveShadow = true;
            if (["Cube_1", "Cube_2", "Cube001", "Cube002", "Cube003"].includes(child.name)) {
                doorParts.push(child);
            }
            if (["handle1", "handle2"].includes(child.name)) {
                child.visible = false;
                handles.push(child);
            }
            if(["lock2"].includes(child.name)){
                mittlereSchloss = child;
                child.visible = false;
            }
            if(["lock1"].includes(child.name)){
                child.visible = false;
                obereSchloss = child;
            }
            if("Cube_1" === child.name){
                originalDoorMat = child.material;
            }
            if("Cube_2" === child.name){
                originalGlassMat = child.material;
                mittelstueck = child;
                mittelstueck.material = originalDoorMat;
            }
        }
    });
    gltf.scene.rotation.y = -Math.PI/2;
    gltf.scene.visible = true;
});

loader.load("door2-1.glb", (gltf) => {
    scene.add(gltf.scene);
    doors[1] = gltf.scene;
    gltf.scene.traverse((child) => {
        if(child.isMesh){
            console.log("Door 2: ",child.name);
        }
    });
    door2 = gltf.scene;
    door2.visible = false;
    door2.rotation.y = -Math.PI/2;
})

const textureLoader = new THREE.TextureLoader();

textureLoader.load(
    'hintergrund.png',
    function (texture) {
        const planeGeo = new THREE.PlaneGeometry(5, 3);
        const planeMat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
        const backgroundPlane = new THREE.Mesh(planeGeo, planeMat);
        backgroundPlane.position.set(0.5, 0.1, -0.05);
        scene.add(backgroundPlane);
        bild = backgroundPlane;
        bild.visible = false;
    },
    undefined,
    function (err) {
        console.error("Fehler beim Laden der Hintergrund-Textur:", err);
    }
);

function toggleVisibility(obj){
    if(obj){
        obj.visible = !obj.visible;
    }
}
function applyColor(objects, color) {
    objects.forEach(obj => {
        if (obj?.material) {
            obj.material.color.set(color);
        }
    });
}
function doorsVisibility(id){
    console.log("doors[0]:", doors[0]);
console.log("doors[1]:", doors[1]);

    doors.forEach((d, i) =>{
        d.visible = (id === i);
    });
}

document.getElementById("colorPicker").addEventListener("input", (event) => {
    const hexColor = event.target.value;
    doorParts.forEach((m) => {
        if (m.material) {
            m.material.color.set(hexColor);
        }
    });
    const allTargets = [doorParts];
    applyColor(allTargets, hexColor);

});

const toggleMap = {
    showDoor: () => doorsVisibility(0),
    showDoor2: () => doorsVisibility(1),
    showHandle: () => handles,
    showPlane: () => bild,
    showMitSchloss: () => mittlereSchloss,
    showObSchloss: () => obereSchloss,
    showMittelStueck: () => {
        if(mittelstueck && originalDoorMat && originalGlassMat){
        mittelstueck.material = mittelstueck.material === originalDoorMat ? originalGlassMat : originalDoorMat;
    }
    }
};
Object.entries(toggleMap).forEach(([id, getTarget]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", () => {
        const target = getTarget();
        if (typeof target === "function") {
            target();
        } else if (Array.isArray(target)) {
            target.forEach(obj => toggleVisibility(obj));
        } else {
            toggleVisibility(target);
        }
    });
});
const slider = document.getElementById("widthSlider");
const span = document.getElementById("widthValue");

slider.addEventListener("input", (event) => {
    const value = parseFloat(event.target.value);
    span.textContent = slider.value;

    if (glass) {
        glass.scale.x = value;

    }
    if (tuer) {
        tuer.scale.x = value;

    }
    klinke.position.x = tuer.scale.x - 0.85;
});

$("#mySlider").roundSlider({
    radius: 100,
    min: 0,
    max: 180,
    value: 135,
    circleShape: "full",
    startAngle: 0,
    handleShape: "round",
    width: 15,
    tooltip: "hide",
    change: updateLight,
    drag: updateLight
});


function updateLight(e) {
    const angleDeg = e.value - 90;
    const angleRad = angleDeg * (Math.PI / 90);

    dirLight.position.x = 2 * Math.cos(angleRad);
    dirLight.position.z = 3 * Math.sin(angleRad);

}

function animate(t = 0) {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
