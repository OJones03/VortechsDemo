// =========================
// 1. Import Three.js and Controls
// =========================
import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

// =========================
// 2. Scene, Camera, Renderer Setup
// =========================
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000); // FOV, aspect, near, far
camera.position.z = 5; // Move camera back
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h); // Set renderer size to window
// Add renderer's canvas to the page
// (This is where the 3D scene will appear)
document.body.appendChild(renderer.domElement);

// =========================
// 3. Camera Controls
// =========================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.01; // How smooth the movement is
controls.enableZoom = false; // Disable zooming with scroll wheel

// =========================
// 4. Main 3D Cube and Wireframe
// =========================
const geometry = new THREE.BoxGeometry(); // Box geometry (cube)
// Use a material that responds to light
const material = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White, affected by light
const cube = new THREE.Mesh(geometry, material); // Solid cube
scene.add(cube);

const cubeMeshMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff, // White wireframe
  wireframe: true,
});
const cubeMesh = new THREE.Mesh(geometry, cubeMeshMaterial); // Wireframe overlay
cubeMesh.scale.setScalar(1.8); // Slightly larger than solid cube
scene.add(cubeMesh);

// =========================
// 5. Lighting
// =========================
const hemilight = new THREE.HemisphereLight("#87cefa", "#800080", 1); // Soft blue/purple light
scene.add(hemilight);

// =========================
// 6. Animation Loop
// =========================
function animate() {
  requestAnimationFrame(animate); // Schedule next frame
  cube.rotation.x += 0.003;
  cube.rotation.y += 0.003;
  cubeMesh.rotation.x += -0.003;
  cubeMesh.rotation.y += -0.003;
  renderer.render(scene, camera); // Draw the scene
  controls.update(); // Update controls for smooth interaction
}

animate(); // Start animation