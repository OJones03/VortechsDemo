// --- Import Three.js library ---
import * as THREE from "three"; // Import everything from the 'three' library
import { OrbitControls } from "jsm/controls/OrbitControls.js"; // Import controls to move the camera around

// --- Set up the renderer (draws the 3D scene on the screen) ---
const w = window.innerWidth; // Get the width of the browser window
const h = window.innerHeight; // Get the height of the browser window
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Create a renderer with smooth edges
renderer.setSize(w, h); // Set the size of the renderer to fill the window
// Add the renderer's canvas element to the web page so we can see it
// (This is where the 3D scene will appear)
document.body.appendChild(renderer.domElement);

// --- Set up the camera (defines what part of the scene we see) ---
const fov = 75; // Field of view: how wide the camera can see (in degrees)
const aspect = w / h; // Aspect ratio: width divided by height
const near = 0.1; // How close something can be to the camera and still be seen
const far = 10; // How far something can be from the camera and still be seen
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far); // Create the camera
camera.position.z = 2; // Move the camera back so we can see the object

// --- Create the scene (the 3D world that holds all objects) ---
const scene = new THREE.Scene(); // Make a new scene

const controls = new OrbitControls(camera, renderer.domElement); // Add controls to move the camera around
controls.enableDamping = true; // Make the controls smooth when moving
controls.dampingFactor = 0.01; // How smooth the movement is
controls.enableZoom = false; // Disable zooming with scroll wheel

// --- Create the main 3D shape (an icosahedron, like a 20-sided die) ---
const geo = new THREE.SphereGeometry(1, 32, 32); // Make the shape's geometry (size 1, smoothness 32)
const mat = new THREE.MeshStandardMaterial({ // Make a material (how the shape looks)
    color: 0xffffff, // White color
    flatShading: true, // Make the faces look flat (not smooth)
});
const mesh = new THREE.Mesh(geo, mat); // Combine shape and material into a mesh (the visible object)
scene.add(mesh); // Add the mesh to the scene

// --- Add a wireframe overlay (shows the edges of the shape) ---
const wiremat = new THREE.MeshBasicMaterial({ // Make a simple material for the wireframe
    color: 0xffffff, // White color
    wireframe: true // Show only the edges
});
const wiremesh = new THREE.Mesh(geo, wiremat); // Make a mesh for the wireframe
wiremesh.scale.setScalar(1.001); // Make the wireframe just a tiny bit bigger so it sits on top
mesh.add(wiremesh); // Attach the wireframe to the main mesh

// --- Add lighting (so we can see the shape with shading) ---
const hemilight = new THREE.HemisphereLight("#87cefa", "#800080"); // Light from above (light blue) and below (purple)
scene.add(hemilight); // Add the light to the scene

// --- Animation loop (keeps the scene moving and updating) ---
function animate(t = 0) {
    requestAnimationFrame(animate); // Ask the browser to call this function again for the next frame
    mesh.rotation.y = t * 0.0001; // Slowly rotate the shape around the Y axis
    mesh.rotation.x = t * 0.0001; // Slowly rotate the shape around the X axis
    renderer.render(scene, camera); // Draw the scene from the camera's point of view
    controls.update(); // Update the camera controls for smooth movement
}

animate(); // Start the animation loop