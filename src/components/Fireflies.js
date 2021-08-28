import * as THREE from "three";
import React, { useRef, useMemo } from "react";
import { extend, useFrame } from "react-three-fiber";
import * as meshline from "threejs-meshline";

//By extending a third-party library, you will be
//able to reference it in r3f declaratively.
extend(meshline);

const r = () => Math.max(0.2, Math.random());

/**
 *
 * @param {{number, number, string}}
 * @returns
 */
const Fatline = ({ curve, width, color }) => {
  const material = useRef();
  useFrame(
    //change the offset value of the dash, without this, the fireflies would not be moving.
    (_, delta) => (material.current.uniforms.dashOffset.value -= delta / 100)
  );
  return (
    <mesh>
      {/* @ts-ignore */}
      <meshLine attach="geometry" vertices={curve} />
      <meshLineMaterial
        //Attach material means use this material
        attach="material"
        //useRef is so that we can reference the dashOffset above in the useFrame hook.
        ref={material}
        transparent
        lineWidth={width}
        color={color}
        //The length and spaces between dashes
        dashArray={0.1}
        //How much of a dash would you like to see? ratio of 0 = straight line
        //ratio of 1 = invisible
        dashRatio={0.99}
      />
    </mesh>
  );
};

export default function Fireflies({ count, colors, radius = 10 }) {
  const lines = useMemo(() => {
    let paths = [];
    for (let i = 0; i < count; i++) {
      //Get starting position with a bit of variations.
      const startingPos = new THREE.Vector3(Math.sin(0) * radius * r(), Math.cos(0) * radius * r(), 0);
      //For each of starting positions, attach thirty more points in a circular path.
      const dots = 30;
      const points = new Array(dots).fill().map((_, index) => {
        //Evenly distribute the 30 dots in a circle (half circle would be just Math.PI)
        const angle = (index / dots) * Math.PI * 2;
        //Start each circle from the starting position
        return startingPos
          .add(new THREE.Vector3(Math.sin(angle) * radius * r(), Math.cos(angle) * radius * r(), 0))
          .clone();
      });
      //Draw spline between the 30 points.
      //getPoints() specifies how many points from the interpolated splines you want.
      const curve = new THREE.CatmullRomCurve3(points).getPoints(100);
      //info for the path
      const path = {
        color: colors[parseInt(colors.length * Math.random())],
        width: Math.max(1.6, (2 * i) / 10),
        curve,
      };
      paths.push(path);
    }
    return paths;
  }, [count, radius, colors]);

  return (
    //The position attribute is THREE.Vector3
    <group position={[-radius * 2, -radius, 0]}>
      {lines.map((props, index) => (
        <Fatline key={index} {...props} />
      ))}
    </group>
  );
}
