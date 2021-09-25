import * as THREE from "three";
import React, { useRef, useMemo, useEffect } from "react";

const r = () => Math.max(0.2, Math.random());

/**
 *
 * @param {{number, number, string}}
 * @returns
 */
const Fatline = ({ curve, width, color }) => {

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(curve);

  return (
      <line geometry={lineGeometry}>
        <lineBasicMaterial attach="material" color={"#9c88ff"} lineWidth={10} linecap={"round"}/>
      </line>
  );
};

export default function Fireflies({ count, colors, radius = 10 }) {
  const lines = useMemo(() => {
    let paths = [];
    const pathsCount = 10;
    const dotsCount = 20;

    for (let i = 0; i < pathsCount; i++){
        const startingPos = new THREE.Vector3(Math.sin(0) * r() * radius, Math.cos(0) * r() * radius, 0);
        const points = [];

        for (let angle = 0; angle < (Math.PI * 2); angle += (Math.PI * 2) / dotsCount){
            const x = Math.sin(angle) * radius * r();
            const y = Math.cos(angle) * radius * r();
            const z = 0;

            points.push(startingPos.add(new THREE.Vector3(x, y, z)).clone());
        }
        const arcSegments = 100;
        const curve = new THREE.CatmullRomCurve3(points).getPoints(arcSegments);

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

//force push
