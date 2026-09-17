import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// -----------------------------------------------------------------
// 1. CARGA DE DATOS EDUCATIVOS (JSON)
// -----------------------------------------------------------------
let objectData = {};

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        objectData = data;
    })
    .catch(err => console.error('Error al cargar data.json:', err));

// -----------------------------------------------------------------
// 2. ESCENA, CÁMARA Y RENDERIZADOR
// -----------------------------------------------------------------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const INITIAL_CAM_POS = new THREE.Vector3(0, 15, 30);
camera.position.copy(INITIAL_CAM_POS);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// -----------------------------------------------------------------
// 3. ILUMINACIÓN (MÁS BRILLO AÑADIDO)
// -----------------------------------------------------------------
// Aumento de luz ambiental para iluminar zonas oscuras
const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
scene.add(ambientLight);

// Luz puntual en el Sol (Intensidad aumentada para mayor brillo)
const sunLight = new THREE.PointLight(0xffffff, 10, 500);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// Luz direccional de apoyo global para dar brillo general a toda la escena
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// -----------------------------------------------------------------
// 4. CREACIÓN DE OBJETOS 3D
// -----------------------------------------------------------------
const selectableObjects = [];
const textureLoader = new THREE.TextureLoader();

// A. SOL
const sunTexture = textureLoader.load('assets/sol.jpg');
const sunGeo = new THREE.SphereGeometry(2.5, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeo, sunMat);
sun.name = "Sol";
scene.add(sun);
selectableObjects.push(sun);

// B. TIERRA
const earthTexture = textureLoader.load('assets/tierra.jpg');
const earthGeo = new THREE.SphereGeometry(0.9, 32, 32);
const earthMat = new THREE.MeshStandardMaterial({ map: earthTexture, roughness: 0.3, metalness: 0.1 });
const earth = new THREE.Mesh(earthGeo, earthMat);
earth.position.set(9, 0, 0);
earth.castShadow = true;
earth.receiveShadow = true;
earth.name = "Tierra";
scene.add(earth);
selectableObjects.push(earth);

// C. SATURNO Y SUS ANILLOS
const saturnGeo = new THREE.SphereGeometry(1.3, 32, 32);
const saturnMat = new THREE.MeshStandardMaterial({ color: 0xe0ae6b, roughness: 0.4 });
const saturn = new THREE.Mesh(saturnGeo, saturnMat);
saturn.position.set(17, 0, 0);
saturn.castShadow = true;
saturn.receiveShadow = true;
saturn.name = "Saturno";

// Material independiente para los anillos
const ringMat = new THREE.MeshStandardMaterial({ 
    color: 0xd4af37, 
    side: THREE.DoubleSide,
    roughness: 0.5 
});
const ringGeo = new THREE.TorusGeometry(2.2, 0.4, 2, 50);
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI / 2.3;
saturn.add(ring);

scene.add(saturn);
selectableObjects.push(saturn);

// D. ÓRBITA ESPECIAL (Cubo)
const boxGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
const boxMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, metalness: 0.5, roughness: 0.2 });
const cubeZone = new THREE.Mesh(boxGeo, boxMat);
cubeZone.position.set(-10, 0, -6);
cubeZone.castShadow = true;
cubeZone.name = "OrbitaEspecial";
scene.add(cubeZone);
selectableObjects.push(cubeZone);

// -----------------------------------------------------------------
// 5. CARGA DE MODELO EXTERNO (.GLTF / .GLB)
// -----------------------------------------------------------------
let loadedModel = null;
const loader = new GLTFLoader();

loader.load(
    'models/satelite.glb',
    (gltf) => {
        loadedModel = gltf.scene;
        loadedModel.position.set(-6, 0, 6);
        loadedModel.scale.set(0.6, 0.6, 0.6);

        loadedModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.name = "SateliteISS";
                selectableObjects.push(child);
            }
        });

        scene.add(loadedModel);
    },
    undefined,
    (err) => console.warn('Cargando modelo local...')
);

// -----------------------------------------------------------------
// 6. RAYCASTING Y SELECCIÓN
// -----------------------------------------------------------------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const tooltip = document.getElementById('tooltip');
const infoTitle = document.getElementById('info-title');
const infoType = document.getElementById('info-type');
const infoDesc = document.getElementById('info-desc');
const infoExtra = document.getElementById('info-extra');

let selectedObject = null;

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(selectableObjects, true);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        tooltip.style.display = 'block';
        tooltip.style.left = `${event.clientX}px`;
        tooltip.style.top = `${event.clientY}px`;
        tooltip.innerText = obj.name || "Objeto";
        document.body.style.cursor = 'pointer';
    } else {
        tooltip.style.display = 'none';
        document.body.style.cursor = 'default';
    }
});

window.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(selectableObjects, true);

    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        const name = selectedObject.name;

        if (objectData[name]) {
            infoTitle.innerText = name;
            infoType.innerText = objectData[name].tipo;
            infoDesc.innerText = objectData[name].descripcion;
            infoExtra.innerText = objectData[name].datoAdicional;
        } else {
            infoTitle.innerText = name;
            infoType.innerText = "Objeto 3D";
            infoDesc.innerText = "Información general no registrada.";
            infoExtra.innerText = "N/A";
        }
    }
});

// -----------------------------------------------------------------
// 7. ANIMACIONES
// -----------------------------------------------------------------
let isAnimating = true;
let angleEarth = 0;
let angleSaturn = 0;

function animate() {
    requestAnimationFrame(animate);

    if (isAnimating) {
        sun.rotation.y += 0.002;

        angleEarth += 0.01;
        earth.position.x = Math.cos(angleEarth) * 9;
        earth.position.z = Math.sin(angleEarth) * 9;
        earth.rotation.y += 0.01;

        angleSaturn += 0.005;
        saturn.position.x = Math.cos(angleSaturn) * 17;
        saturn.position.z = Math.sin(angleSaturn) * 17;
        saturn.rotation.y += 0.008;

        cubeZone.rotation.x += 0.01;
        cubeZone.rotation.y += 0.01;

        if (loadedModel) {
            loadedModel.rotation.y += 0.005;
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// -----------------------------------------------------------------
// 8. CONTROLES DE LA INTERFAZ (UI)
// -----------------------------------------------------------------
document.getElementById('btn-anim').addEventListener('click', (e) => {
    isAnimating = !isAnimating;
    e.target.innerText = isAnimating ? '⏸️ Pausar Animación' : '▶️ Reanudar Animación';
});

document.getElementById('btn-reset-cam').addEventListener('click', () => {
    camera.position.copy(INITIAL_CAM_POS);
    controls.target.set(0, 0, 0);
});

document.getElementById('btn-toggle-model').addEventListener('click', () => {
    if (loadedModel) {
        loadedModel.visible = !loadedModel.visible;
    }
});

// Botón de cambio de color corregido y optimizado
document.getElementById('btn-color').addEventListener('click', () => {
    const randomColor = Math.floor(Math.random() * 0xffffff);
    ringMat.color.setHex(randomColor);
    ringMat.needsUpdate = true; // Forzar actualización del material en la GPU
});

// Slider de intensidad de luz (Ajustado para el nuevo rango de brillo)
document.getElementById('light-intensity').addEventListener('input', (e) => {
    sunLight.intensity = parseFloat(e.target.value) * 5;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});