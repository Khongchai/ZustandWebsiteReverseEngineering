import * as THREE from "three";
import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import { Plane, useAspect, useTextureLoader } from "drei";
import { EffectComposer, DepthOfField, Vignette } from "react-postprocessing";
import Fireflies from "./components/Fireflies";
import bgUrl from "./resources/bg.jpg";
import starsUrl from "./resources/stars.png";
import groundUrl from "./resources/ground.png";
import bearUrl from "./resources/bear.png";
import leaves1Url from "./resources/leaves1.png";
import leaves2Url from "./resources/leaves2.png";
import "./materials/layerMaterial";

function Scene({ dof }) {
  //Give it the actual image's size along with the "cover" argument and it will fill the screen.
  //Note: this "cover" doesn't zoom, but rather, stretch + zoom. This is because the size will also be set to the size of the plane mesh.
  //Value lower than actual image = vertical stretch, vice versa = horizontal stretch.
  const scaleN = useAspect("cover", 1600, 1000, 0.21);
  const scaleW = useAspect("cover", 2200, 1000, 0.21);
  //Just loading a bunch of textures
  const textures = useTextureLoader([bgUrl, starsUrl, groundUrl, bearUrl, leaves1Url, leaves2Url]);
  //Subject is used to reference the bear
  const subject = useRef();
  //Group is used to reference everything else in the layer.
  const group = useRef();
  //Not sure yet what this does
  const layersRef = useRef([]);
  //See the usage of these vectors in the useFrame function below.
  const [movementVector] = useState(() => new THREE.Vector3());
  const [tempVector] = useState(() => new THREE.Vector3());
  const [focusVector] = useState(() => new THREE.Vector3());

  //Each layer maps to each drawing in the scene (see the files in the resources folder).
  //The parameters are fed to the layerMaterial of the plane.
  //Each of the params are explained in the return statement.
  const layers = [
    { texture: textures[0], z: 0, factor: 0.005, scale: scaleW },
    { texture: textures[1], z: 10, factor: 0.005, scale: scaleW },
    { texture: textures[2], z: 20, scale: scaleW },
    { texture: textures[3], z: 30, ref: subject, scaleFactor: 0.83, scale: scaleN },
    { texture: textures[4], factor: 0.03, scaleFactor: 1, z: 40, wiggle: 0.24, scale: scaleW },
    { texture: textures[5], factor: 0.04, scaleFactor: 1.3, z: 49, wiggle: 0.3, scale: scaleW },
  ];

  /**
   * Reacts to mouse position.
   */
  useFrame((state, delta) => {
    /**
     * Responsible for adjusting the focus.
     * The target of the depth of field (dof) is the result of a linear interpolation between
     * the subject variable (the bear) and the value 0.05. The value 0.05 interpolates towards
     * the position of the bear: https://threejs.org/docs/#api/en/math/Vector3.lerp
     */
    // dof.current.target = focusVector.lerp(subject.current.position, 0.05);
    /**
     * Extra movement in the y axis that is an interpolation of the attenuated mouse x and alpha of 0.2.
     */
    movementVector.lerp(tempVector.set(state.mouse.x, state.mouse.y * 0.2, 0), 0.2);
    /**
     * How much each of the group changes/move around when mouse moves.
     */
    // group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, state.mouse.x * 20, 0.2);
    // group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, state.mouse.y / 10, 0.2);
    // group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, -state.mouse.x / 2, 0.2);
    /**
     * Leaves' wiggle.
     * Pass time to the shader.
     * This looks a bit strange but it's basically passing the time to both layer 4 and 5 at the same time.
     *
     * Both layers 4 and 5 are leaves.
     */
    // layersRef.current[4].uniforms.time.value = layersRef.current[5].uniforms.time.value += delta;
  }, 1);

  return (
    <group ref={group}>
      <Fireflies count={10} radius={80} colors={["orange"]} />
      {/* 
      z = z-position, how close or far a layer is. Layer 1 (pink background) = closest and Layer 6 = farthest (leaves2).
      scale = size of the plane, already mentioned above.
      The rest of the props will be explained within the layerMaterial shader.
      */}
      {/* {layers.map(({ scale, texture, ref, factor = 0, scaleFactor = 1, wiggle = 0, z }, i) => (
        <Plane scale={scale} args={[1, 1, wiggle ? 10 : 1, wiggle ? 10 : 1]} position-z={z} key={i} ref={ref}>
          <layerMaterial
            attach="material"
            movementVector={movementVector}
            textr={texture}
            factor={factor}
            ref={(el) => (layersRef.current[i] = el)}
            wiggle={wiggle}
            scaleFactor={scaleFactor}
          />
        </Plane>
      ))} */}
    </group>
  );
}

//Forward the reference to the children of this component
const Effects = React.forwardRef((_, ref) => {
  //Get width and height from renderer using useThree hook
  const {
    viewport: { width, height },
  } = useThree();
  return (
    <EffectComposer multisampling={0}>
      <DepthOfField ref={ref} bokehScale={4} focalLength={0.1} width={width / 2} height={height / 2} />
      <Vignette />
    </EffectComposer>
  );
});

export default function App() {
  //Depth of field reference.
  const dof = useRef();

  return (
    <>
      <Canvas
        orthographic
        gl={{ powerPreference: "high-performance", antialias: false, stencil: false, alpha: false, depth: false }}
        camera={{ zoom: 1, position: [0, 0, 200], far: 300, near: 0 }}>
        <Suspense fallback={null}>
          <Scene dof={dof} />
        </Suspense>
        <Effects ref={dof} />
      </Canvas>
    </>
  );
}
