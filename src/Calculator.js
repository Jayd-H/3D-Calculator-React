import React, { useState, useEffect, useCallback } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
} from "@react-three/postprocessing";
import { CanvasTexture, Raycaster, Vector2 } from "three";

function Model({ onButtonClick }) {
  const { camera } = useThree();
  const gltf = useLoader(GLTFLoader, "calculator.glb");

  useEffect(() => {
    const raycaster = new Raycaster();
    const mouse = new Vector2();

    const onClick = (event) => {
      event.preventDefault();

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(gltf.scene.children, true);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.name.startsWith("button")) {
          onButtonClick(object.name);
        }
      }
    };

    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [camera, gltf.scene, onButtonClick]);

  return (
    <primitive
      object={gltf.scene}
      scale={[1.5, 1.5, 1.5]}
      position={[0, 0, 0]}
    />
  );
}

function App() {
  const handleButtonClick = useCallback((buttonName) => {
    console.log(`Button ${buttonName} pressed`);
  }, []);

  return (
    <Canvas style={{ height: "100vh" }}>
      <SceneBackground />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[5, 5, 5]} intensity={0.3} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} />
      <pointLight position={[10, 10, 10]} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} />
        <DepthOfField
          focusDistance={0.005}
          focalLength={0.02}
          bokehScale={2}
          height={480}
        />
      </EffectComposer>
      <fog attach="fog" args={["#ffffff", 5, 15]} />
      <Model onButtonClick={handleButtonClick} />
      <OrbitControls />
    </Canvas>
  );
}

function SceneBackground() {
  const { scene } = useThree();
  const gradientTexture = createGradientTexture();

  useEffect(() => {
    scene.background = gradientTexture;
  }, [scene, gradientTexture]);

  return null;
}

function createGradientTexture() {
  const width = 512;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#f4b9ff");
  gradient.addColorStop(1, "#dd86d6");

  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

export default App;
