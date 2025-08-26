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

document.getElementById("passButton").addEventListener("click", myFunction);
function myFunction() {
    const passwordField = document.getElementById("pass");
    const message = document.getElementById("message");
    const password = "1234";
    if (password === "1234") {
        document.getElementById("controlPanel").style.display = "block";
        message.textContent = "";
        document.getElementById("passwordScreen").style.display = "none";
        initScene();
    }
    else {
        message.textContent = "❌ Falsches Passwort!"
        passwordField.value = "";
    }
}

function initScene() {

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

    const handles1 = [];
    const handles2 = [];
    const doorParts1 = [];
    let bild = null;
    let mittlereSchloss1 = null;
    let mittlereSchloss2 = null;
    let obereSchloss1 = null;
    let mittelstueck1 = null;
    let mittelstueck2 = null;
    let originalGlassMat = null;
    let doorMat1 = null;
    let originalDoorMat1 = null;
    let originalDoorMat2 = null;
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
        doors[0] = gltf.scene;
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                console.log("Door 1: ", child.name);

                child.castShadow = true;
                child.receiveShadow = true;
                if (["Cube_1", "Cube_2", "Cube001", "Cube002", "Cube003"].includes(child.name)) {
                    doorParts1.push(child);
                }
                if (["handle1", "handle2"].includes(child.name)) {
                    child.visible = false;
                    handles1.push(child);
                }
                if (["lock2"].includes(child.name)) {
                    mittlereSchloss1 = child;
                    child.visible = false;
                }
                if (["lock1"].includes(child.name)) {
                    child.visible = false;
                    obereSchloss1 = child;
                }
                if ("Cube_1" === child.name) {
                    originalDoorMat1 = child.material;
                }
                if ("Cube_2" === child.name) {
                    originalGlassMat = child.material;
                    mittelstueck1 = child;
                    mittelstueck1.material = originalDoorMat1;
                }
            }
        });
        gltf.scene.rotation.y = -Math.PI / 2;
        gltf.scene.visible = false;
    });

    loader.load("door2-1.glb", (gltf) => {
        scene.add(gltf.scene);
        doors[1] = gltf.scene;
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                console.log("Door 2: ", child.name);
                child.castShadow = true;
                child.receiveShadow = true;
                if (["Cube005", "Cube006"].includes(child.name)) {
                    child.visible = false;
                    handles2.push(child);
                }
                if (child.name === "Cube007") {
                    child.visible = false;
                    mittlereSchloss2 = child;
                }
                if ("Cube004_1" === child.name) {
                    originalDoorMat2 = child.material;
                }
                if ("Cube004_2" === child.name) {
                    mittelstueck2 = child;
                    doorMat1 = child.material;
                    mittelstueck2.material = originalDoorMat2;
                }
            }
        });
        gltf.scene.visible = false;
        gltf.scene.rotation.y = -Math.PI / 2;
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

    function toggleVisibility(obj) {
        if (typeof obj === "number") {
            doors.forEach((d, i) => {
                d.visible = (obj === i);
            });
        } else {
            if (obj) {
                obj.visible = !obj.visible;
            }
        }
    }
    function applyColor(objects, color) {
        objects.forEach(obj => {
            if (obj?.material) {
                obj.material.color.set(color);
            }
        });
    }

    document.getElementById("colorPicker").addEventListener("input", (event) => {
        const hexColor = event.target.value;
        doorParts1.forEach((m) => {
            if (m.material) {
                m.material.color.set(hexColor);
            }
        });
        const allTargets = [doorParts1];
        applyColor(allTargets, hexColor);

    });

    const toggleMap = {
        showDoor: () => toggleVisibility(0),
        showDoor2: () => toggleVisibility(1),
        showHandle1: () => handles1,
        showHandle2: () => handles2,
        showPlane: () => bild,
        showMitSchloss1: () => mittlereSchloss1,
        showMitSchloss2: () => mittlereSchloss2,
        showObSchloss: () => obereSchloss1,
        showMittelStueck1: () => {
            if (mittelstueck1 && originalDoorMat1 && originalGlassMat) {
                mittelstueck1.material = mittelstueck1.material === originalDoorMat1 ? originalGlassMat : originalDoorMat1;
            }
        },
        showMittelStueck2: () => {
            if (mittelstueck2 && originalDoorMat2 && doorMat1) {
                mittelstueck2.material = mittelstueck2.material === originalDoorMat2 ? doorMat1 : originalDoorMat2;
            }
        }
    };

    const revealOnActive = {
        showDoor: ["showHandle1", "showMitSchloss1", "showObSchloss", "showMittelStueck1"],

        showDoor2: ["showHandle2", "showMitSchloss2", "showMittelStueck2"]
    };
    Object.entries(toggleMap).forEach(([id, getTarget]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("click", () => {

            if(el.classList.contains("toggle-btn")){
                document
                .querySelectorAll("#controlPanel .toggle-btn.is-active")
                .forEach(btn => btn.classList.remove("is-active"));
            }
            
            el.classList.toggle("is-active");

            const target = getTarget();
            if (typeof target === "function") {
                target();
            } else if (Array.isArray(target)) {
                target.forEach(obj => toggleVisibility(obj));
            } else {
                toggleVisibility(target);
            }

            // Buttons nach ausgewählter Tür aus/ einblenden

            Object.keys(revealOnActive).forEach(key => {
                if (key === id) {
                    revealOnActive[key].forEach(id => document.getElementById(id).style.display = "block");
                    Object.entries(revealOnActive).forEach(([door, ids]) => {
                        if (door !== key) {
                            ids.forEach(id => document.getElementById(id).style.display = "none");
                        }
                    })
                }
            })
        });
    });
    const slider = document.getElementById("widthSlider");
    const span = document.getElementById("widthValue");

    slider.addEventListener("input", (event) => {
        const value = parseFloat(event.target.value);
        span.textContent = slider.value;
    });

    $("#mySlider").roundSlider({
        radius: 100,
        min: 0,
        max: 180,
        value: 135,
        circleShape: "full",
        startAngle: 0,
        handleS1hape: "round",
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
}
