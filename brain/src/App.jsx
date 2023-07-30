import {Canvas, useFrame} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";
import {data} from "./data.js";
const PATHS = data.economics[0].paths;

import * as THREE from 'three';
import {extend} from '@react-three/fiber';
import {useRef} from "react";
import {shaderMaterial} from '@react-three/drei'

const randomRange = (min, max) => Math.random() * (max - min) + min;

let curves = []
for (let i = 0; i < 100; i++){
    let points = [];
    let length = randomRange(0.1, 1);
    for (let j = 0; j < 100; j++) {
        points.push(new THREE.Vector3().setFromSphericalCoords(
            1,
            Math.PI - (j / 100) * Math.PI*length,
            (i / 100) * Math.PI * 2
        )
        );
    }
    let tempcurve = new THREE.CatmullRomCurve3(points);
    curves.push(tempcurve);
}

let brainCurves = []

PATHS.forEach((path)=>{
    let points = []
    for(let i = 0; i<path.length; i+=3) {
        points.push(new THREE.Vector3(path[i],path[i+1], path[i+2]))
    }
    let tempcurve = new THREE.CatmullRomCurve3(points)
    brainCurves.push(tempcurve)
})

// eslint-disable-next-line react/prop-types
function Tube({curve}) {

    const brainMat = useRef()

    useFrame(({clock})=> {
        brainMat.current.uniforms.time.value = clock.getElapsedTime()
    })

    const BrainMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color(0.1, 0.3, 0.6) },
  // vertex shader
  /*glsl*/`
    varying vec2 vUv;
    uniform float time;
    varying float vProgress;
    void main() {
      vUv = uv;
      vProgress = smoothstep(-1.,1.,sin(vUv.x*8. + time*3.));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  /*glsl*/`
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    varying float vProgress;
    void main() {
    vec3 finalColor = mix(color, color*0.25, vProgress);
    float hideCorners = smoothstep(1.,0.9,vUv.x);
    float hideCorners1 = smoothstep(0.,0.1,vUv.x);
    gl_FragColor = vec4(vec3(vProgress),1.);
    gl_FragColor = vec4(finalColor,hideCorners*hideCorners1);
    }
  `
)

// declaratively
extend({BrainMaterial})

    return(
        <>
    <mesh>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <tubeGeometry args={[curve, 64, 0.001, 2, false]}/>
        <brainMaterial
            ref={brainMat}
            side={THREE.DoubleSide}
            transparent={true}
            depthTest={false}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
        />
    </mesh>
    </>
    );
}

function Tubes(allthecurve){

    return(
        <>
            {brainCurves.map((curve, index)=>(
                <Tube curve={curve} key={index}/>
    ))}
        </>
    )
}

export default function App() {
    return <Canvas camera={{position:[0,0,0.2], near:0.001, far: 5}}>
        <color attach={"background"} args={["black"]}/>
        <ambientLight></ambientLight>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <pointLight position={[10, 10, 10]}/>
        <Tubes allthecurves={brainCurves}></Tubes>
        <OrbitControls/>
    </Canvas>
}
