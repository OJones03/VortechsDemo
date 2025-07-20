import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";  

const w = window.innerWidth;
const h = window.innerHeight;

const scene= new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w /h, 0.1, 1000);
camera.position.z = 5; 
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
renderer.toneMapping = THREE.ACESFilmicToneMapping; 
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
constrols.enableDamping = true;
controls.dampingFactor = 0.03;

const gemoetry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
const cube = new THREE.Mesh(gemoetry, material);
scene.add(cube);

const hemiLight = new THREE.HemisphereLight("#87cefa", "#800080", 1);
scene.add(hemiLight);

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
    controls.update();
}

animate(); 