// =========================
// 1. Imports
// =========================
import * as THREE from "three";
// import { OrbitControls } from "jsm/controls/OrbitControls.js";  
import spline from "./spline.js";
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";

// =========================
// 2. Scene, Camera, Renderer Setup
// =========================
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.6); // Add fog for depth
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: "high-performance"
});
renderer.setSize(w, h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// =========================
// 3. Controls
// =========================
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.03;
// controls.zoom= false;

// =========================
// 4. Postprocessing: Bloom
// =========================
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.002;
bloomPass.strength = 1.5;
bloomPass.radius = 0.85;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// =========================
// 5. Spline Geometry (Line, Tube, Edges)
// =========================
// Line geometry from spline (not added to scene)
const lineGeometry = new THREE.BufferGeometry().setFromPoints(spline.getPoints(100));
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const line = new THREE.Line(lineGeometry, lineMaterial);
// scene.add(line);

// Tube geometry from spline
const tubeGeometry = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);
const tubeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00,
    wireframe: true,
    side: THREE.DoubleSide 
});
const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
scene.add(tube);

// Edge geometry from tube
const edges = new THREE.EdgesGeometry(tubeGeometry, 0.2);
const tubeLines = new THREE.LineBasicMaterial({ color: 0xffffff });
const tubelines = new THREE.LineSegments(edges, lineMaterial);
scene.add(tubelines);

// =========================
// 6. Random Asteroids Along Spline
// =========================
function createAsteroid() {
    // Create irregular asteroid shape using modified icosahedron
    const baseGeometry = new THREE.IcosahedronGeometry(0.05, 1);
    const vertices = baseGeometry.attributes.position.array;
    
    // Randomly distort vertices to create irregular asteroid shape
    for (let i = 0; i < vertices.length; i += 3) {
        const distortion = 0.3; // How much to distort
        vertices[i] *= (1 + (Math.random() - 0.5) * distortion);     // X
        vertices[i + 1] *= (1 + (Math.random() - 0.5) * distortion); // Y
        vertices[i + 2] *= (1 + (Math.random() - 0.5) * distortion); // Z
    }
    
    baseGeometry.attributes.position.needsUpdate = true;
    baseGeometry.computeVertexNormals();
    
    return baseGeometry;
}

const numAsteroids = 100;
for (let i = 0; i < numAsteroids; i += 1) {
    // Create unique asteroid geometry for each one
    const asteroidGeometry = createAsteroid();
    
    // Varying colors for different asteroid types
    const asteroidColors = [0x888888, 0x666666, 0x999999, 0x777777, 0xaaaaaa];
    const randomColor = asteroidColors[Math.floor(Math.random() * asteroidColors.length)];
    
    const asteroidMaterial = new THREE.MeshBasicMaterial({ 
        color: randomColor, 
        wireframe: true 
    });
    
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    
    // Position along spline with random offset
    const p = (i / numAsteroids + Math.random() * 0.1) % 1;
    const pos = tubeGeometry.parameters.path.getPointAt(p);
    pos.x += Math.random() - 0.5;
    pos.y += Math.random() - 0.5;
    asteroid.position.copy(pos);
    
    // Random rotation
    const rotation = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    asteroid.rotation.set(rotation.x, rotation.y, rotation.z);
    
    // Random scale for variety
    const scale = 0.8 + Math.random() * 0.6; // Scale between 0.8 and 1.4
    asteroid.scale.setScalar(scale);
    
    scene.add(asteroid);
}

// =========================
// 7. Camera Animation Along Spline
// =========================
function updateCamera(t) {
    const time = t * 0.1;
    const looptime = 10 * 1000;
    const p = (time % looptime) / looptime;
    const pos = tubeGeometry.parameters.path.getPointAt(p);
    const lookAt = tubeGeometry.parameters.path.getPointAt((p + 0.03) % 1);
    camera.position.copy(pos);
    camera.lookAt(lookAt);
}

// =========================
// 8. Animation Loop
// =========================
function animate(t = 0) {
    requestAnimationFrame(animate);
    updateCamera(t);
    composer.render(); // Use composer for postprocessing
}

animate();