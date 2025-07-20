/**
 * VORTECHS NETWORK SOLUTIONS - THREE.JS 3D SCENE
 * Elite Dangerous inspired spaceship flying through asteroid field
 * Features: Custom spaceship geometry, procedural asteroids, bloom effects
 * Author: Vortechs Team | Created: 2025
 */

// ===== MODULE IMPORTS =====
import * as THREE from "three";
import splineData from "./spline.js";
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// ===== SCENE CONFIGURATION =====
const SCENE_CONFIG = {
  viewportWidth: window.innerWidth,
  viewportHeight: window.innerHeight,
  fogDensity: 0.8,
  cameraFOV: 75,
  cameraNear: 0.1,
  cameraFar: 1000
};

// ===== SCENE SETUP =====
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, SCENE_CONFIG.fogDensity);

// Camera configuration
const camera = new THREE.PerspectiveCamera(
  SCENE_CONFIG.cameraFOV, 
  SCENE_CONFIG.viewportWidth / SCENE_CONFIG.viewportHeight, 
  SCENE_CONFIG.cameraNear, 
  SCENE_CONFIG.cameraFar
);
camera.position.z = 5;

// Renderer setup with performance optimizations
const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: "high-performance"
});
renderer.setSize(SCENE_CONFIG.viewportWidth, SCENE_CONFIG.viewportHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// ===== POST-PROCESSING EFFECTS =====
const postProcessingComposer = new EffectComposer(renderer);

// Main render pass
const mainRenderPass = new RenderPass(scene, camera);
postProcessingComposer.addPass(mainRenderPass);

// Bloom effect for glowing elements
const bloomEffect = new UnrealBloomPass(
  new THREE.Vector2(SCENE_CONFIG.viewportWidth, SCENE_CONFIG.viewportHeight), 
  1.5,  // strength
  0.4,  // radius 
  0.85  // threshold
);
bloomEffect.threshold = 0.002;
bloomEffect.strength = 1.5;
bloomEffect.radius = 0.85;
postProcessingComposer.addPass(bloomEffect);

// ===== TUNNEL GEOMETRY =====
// Main tunnel structure using spline path
const tunnelGeometry = new THREE.TubeGeometry(splineData, 222, 0.65, 16, true);
const tunnelMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x00ff00,
  wireframe: true,
  side: THREE.DoubleSide 
});
const tunnelMesh = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
scene.add(tunnelMesh);

// Tunnel edge lines for enhanced wireframe effect
const tunnelEdges = new THREE.EdgesGeometry(tunnelGeometry, 0.2);
const tunnelEdgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, visible: false});
const tunnelEdgesLines = new THREE.LineSegments(tunnelEdges, tunnelEdgesMaterial);
scene.add(tunnelEdgesLines);

// ===== BLENDER SPACESHIP LOADER =====
let spaceshipModel = null;
const gltfLoader = new GLTFLoader();

// Load the spaceship model from Blender
gltfLoader.load(
  'Elite.glb', // Replace with your actual model filename
  function(gltf) {
    spaceshipModel = gltf.scene;
    
    // Apply white wireframe material to all meshes in the model
    spaceshipModel.traverse(function(child) {
      if (child.isMesh) {
        // Create edges geometry for square/quad wireframe appearance
        const edges = new THREE.EdgesGeometry(child.geometry, 5); // Threshold angle for edges
        const edgesMaterial = new THREE.LineBasicMaterial({
          color: 0x00ffff, // Cyan color
          linewidth: 1
        });
        
        // Replace the mesh with line segments showing edges
        const edgesLines = new THREE.LineSegments(edges, edgesMaterial);
        edgesLines.position.copy(child.position);
        edgesLines.rotation.copy(child.rotation);
        edgesLines.scale.copy(child.scale);
        
        // Remove the original mesh and add the edges
        child.parent.add(edgesLines);
        child.parent.remove(child);
      }
    });
    
    // Scale the model if needed
    spaceshipModel.scale.setScalar(0.06); // Adjust scale as needed
    
    // Position the spaceship at the start of the path
    const startPosition = tunnelGeometry.parameters.path.getPointAt(0);
    spaceshipModel.position.copy(startPosition);
    
    // Add to scene
    scene.add(spaceshipModel);
    
    console.log("Spaceship loaded successfully");
  },
  function(progress) {
    console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
  },
  function(error) {
    console.error('Error loading spaceship model:', error);
  }
);

// ===== PROCEDURAL ASTEROID FIELD =====
function createAsteroidGeometry() {
  // Base icosahedron for natural asteroid shape
  const baseGeometry = new THREE.IcosahedronGeometry(0.05, 1);
  const vertices = baseGeometry.attributes.position.array;
  
  // Apply random distortion for unique asteroid shapes
  const distortionFactor = 0.3;
  for (let i = 0; i < vertices.length; i += 3) {
    vertices[i] *= (1 + (Math.random() - 0.5) * distortionFactor);       // X axis
    vertices[i + 1] *= (1 + (Math.random() - 0.5) * distortionFactor);   // Y axis  
    vertices[i + 2] *= (1 + (Math.random() - 0.5) * distortionFactor);   // Z axis
  }
  
  // Update geometry with new vertex positions
  baseGeometry.attributes.position.needsUpdate = true;
  baseGeometry.computeVertexNormals();
  
  return baseGeometry;
}

// Asteroid field configuration
const ASTEROID_CONFIG = {
  count: 150,
  colors: [0x888888, 0x666666, 0x999999, 0x777777, 0xaaaaaa],
  minScale: 0.3,
  maxScale: 1.5,
  positionOffset: 1
};

// Generate asteroid field
for (let i = 0; i < ASTEROID_CONFIG.count; i++) {
  // Create unique asteroid geometry
  const asteroidGeometry = createAsteroidGeometry();
  
  // Random asteroid material color
  const randomColor = ASTEROID_CONFIG.colors[
    Math.floor(Math.random() * ASTEROID_CONFIG.colors.length)
  ];
  const asteroidMaterial = new THREE.MeshBasicMaterial({ 
    color: randomColor, 
    wireframe: true 
  });
  
  const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
  
  // Position asteroid along spline path, hugging the tube sides
  const splinePosition = (i / ASTEROID_CONFIG.count + Math.random() * 0.1) % 1;
  const tubeCenter = tunnelGeometry.parameters.path.getPointAt(splinePosition);
  const tubeTangent = tunnelGeometry.parameters.path.getTangentAt(splinePosition);
  
  // Find a vector perpendicular to the tangent (random angle around tube)
  const angle = Math.random() * Math.PI * 2;
  // Create a quaternion to rotate a vector around the tangent
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(tubeTangent, angle);
  // Tube radius plus a little extra to avoid the center
  const radius = tunnelGeometry.parameters.radius * 0.95; // 95% of tube radius
  // Start with a vector perpendicular to the tangent
  let offset = new THREE.Vector3(1, 0, 0);
  // Rotate it around the tangent
  offset.applyQuaternion(quaternion);
  // Scale to radius
  offset.multiplyScalar(radius);
  // Final asteroid position
  asteroid.position.copy(tubeCenter).add(offset);
  
  // Apply random rotation
  asteroid.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  
  // Apply random scale for size variety
  const randomScale = ASTEROID_CONFIG.minScale + 
    Math.random() * (ASTEROID_CONFIG.maxScale - ASTEROID_CONFIG.minScale);
  asteroid.scale.setScalar(randomScale);
  
  scene.add(asteroid);
}

// ===== CAMERA ANIMATION SYSTEM =====
function updateCameraPosition(timestamp) {
  const animationSpeed = 0.1;
  const loopDuration = 10 * 1000; // 10 seconds

  // Calculate current position along spline (0-1)
  const currentTime = timestamp * animationSpeed;
  const normalizedPosition = (currentTime % loopDuration) / loopDuration;

  // Get camera position and look-at target from spline
  const cameraPosition = tunnelGeometry.parameters.path.getPointAt(normalizedPosition);
  const lookAtTarget = tunnelGeometry.parameters.path.getPointAt((normalizedPosition + 0.03) % 1);

  // Update camera transform
  camera.position.copy(cameraPosition);
  camera.lookAt(lookAtTarget);
}

// ===== SPACESHIP ANIMATION SYSTEM =====
function updateSpaceshipPosition(timestamp) {
  if (!spaceshipModel) return; // Don't animate if model isn't loaded yet
  
  // Keep spaceship in a fixed position relative to camera's local space
  // This creates a HUD-like effect where the ship doesn't move on screen
  const spaceshipDistance = 0.5;
  const rightOffset = 0.1;
  const downOffset = -0.05;
  
  // Add very subtle sway motion
  const swayAmount = 0.06; // Very small sway
  const swaySpeed = 1;
  const horizontalSway = Math.sin(timestamp * 0.001 * swaySpeed) * swayAmount;
  const verticalSway = Math.cos(timestamp * 0.0015 * swaySpeed) * swayAmount * 0.5;
  
  // Get camera's local coordinate system
  const cameraMatrix = camera.matrixWorld;
  const cameraPosition = new THREE.Vector3().setFromMatrixPosition(cameraMatrix);
  const cameraForward = new THREE.Vector3(0, 0, -1).transformDirection(cameraMatrix);
  const cameraRight = new THREE.Vector3(1, 0, 0).transformDirection(cameraMatrix);
  const cameraUp = new THREE.Vector3(0, 1, 0).transformDirection(cameraMatrix);
  
  // Position spaceship in camera's local space with subtle sway
  spaceshipModel.position.copy(cameraPosition)
    .add(cameraForward.multiplyScalar(spaceshipDistance))
    .add(cameraRight.multiplyScalar(rightOffset + horizontalSway))
    .add(cameraUp.multiplyScalar(downOffset + verticalSway));
  
  // Keep spaceship oriented with camera (rotation applied once during loading)
  spaceshipModel.quaternion.copy(camera.quaternion);
  
  // Apply the -90 degree Y rotation after copying camera orientation
  spaceshipModel.rotateY(-Math.PI / 2);
}

// ===== MAIN ANIMATION LOOP =====
function renderScene(timestamp = 0) {
  // Request next frame
  requestAnimationFrame(renderScene);
  
  // Update camera position
  updateCameraPosition(timestamp);
  
  // Update spaceship position and animation
  updateSpaceshipPosition(timestamp);
  
  // Render scene with post-processing effects
  postProcessingComposer.render();
}

// Start the animation loop
renderScene();