// NerfViewer.tsx
// -----------------------------------------------------------------------------
// Self‑contained React component that renders a Mobilenerf scene. It now reads
// `/data/<objName>_mac/data.json` to discover how many OBJ/shape chunks exist
// (field `num_obj`), treats that value for **both** shape and OBJ counts, and
// shows a full‑screen progress overlay until every file (data.json, mlp.json,
// textures, objs) is loaded.

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import WebGL from "three/examples/jsm/capabilities/WebGL";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

/*****************************************************************************
 * GLSL SHADERS (vertex is simple, fragment is template with placeholders)
 *****************************************************************************/
const VERT_SRC = /* glsl */ `
  in vec3 position;
  in vec2 uv;
  out vec2 vUv;
  out vec3 rayDirection;
  uniform mat4 modelViewMatrix, projectionMatrix, modelMatrix;
  uniform vec3 cameraPosition;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    rayDirection = (modelMatrix * vec4(position, 1.0)).rgb - cameraPosition;
  }
`;

const FRAG_TEMPLATE = /* glsl */ `
precision mediump float;

in vec2 vUv;
in vec3 rayDirection;

out vec4 fragColor;

uniform sampler2D tDiffuse0, tDiffuse1;

mediump vec3 mlp(vec4 f0, vec4 f1, vec4 viewdir) {
  mediump mat4 x = mat4(BIAS_LIST_ZERO);
  x += viewdir.r*mat4(__W0_0__) - viewdir.b*mat4(__W0_1__) + viewdir.g*mat4(__W0_2__)
     + f0.r*mat4(__W0_3__) + f0.g*mat4(__W0_4__) + f0.b*mat4(__W0_5__) + f0.a*mat4(__W0_6__)
     + f1.r*mat4(__W0_7__) + f1.g*mat4(__W0_8__) + f1.b*mat4(__W0_9__) + f1.a*mat4(__W0_10__);
  x[0]=max(x[0],0.0); x[1]=max(x[1],0.0); x[2]=max(x[2],0.0); x[3]=max(x[3],0.0);

  mediump mat4 y = mat4(BIAS_LIST_ONE);
  y += x[0][0]*mat4(__W1_0__)+x[0][1]*mat4(__W1_1__)+x[0][2]*mat4(__W1_2__)+x[0][3]*mat4(__W1_3__)
     + x[1][0]*mat4(__W1_4__)+x[1][1]*mat4(__W1_5__)+x[1][2]*mat4(__W1_6__)+x[1][3]*mat4(__W1_7__)
     + x[2][0]*mat4(__W1_8__)+x[2][1]*mat4(__W1_9__)+x[2][2]*mat4(__W1_10__)+x[2][3]*mat4(__W1_11__)
     + x[3][0]*mat4(__W1_12__)+x[3][1]*mat4(__W1_13__)+x[3][2]*mat4(__W1_14__)+x[3][3]*mat4(__W1_15__);
  y[0]=max(y[0],0.0); y[1]=max(y[1],0.0); y[2]=max(y[2],0.0); y[3]=max(y[3],0.0);

  mediump vec3 o = vec3(BIAS_LIST_TWO);
  o += y[0][0]*vec3(__W2_0__)+y[0][1]*vec3(__W2_1__)+y[0][2]*vec3(__W2_2__)+y[0][3]*vec3(__W2_3__)
     + y[1][0]*vec3(__W2_4__)+y[1][1]*vec3(__W2_5__)+y[1][2]*vec3(__W2_6__)+y[1][3]*vec3(__W2_7__)
     + y[2][0]*vec3(__W2_8__)+y[2][1]*vec3(__W2_9__)+y[2][2]*vec3(__W2_10__)+y[2][3]*vec3(__W2_11__)
     + y[3][0]*vec3(__W2_12__)+y[3][1]*vec3(__W2_13__)+y[3][2]*vec3(__W2_14__)+y[3][3]*vec3(__W2_15__);
  return 1.0/(1.0+exp(-o));
}

void main(){
  vec4 f1 = texture(tDiffuse0, vUv);
  if (f1.r == 0.0) discard;
  vec3 dir = normalize(rayDirection);
  vec4 vdir = vec4(dir*0.5 + 0.5, 1.0);
  vec4 f2 = texture(tDiffuse1, vUv);
  f1.a = f1.a*2.0 - 1.0;
  f2.a = f2.a*2.0 - 1.0;
  vec3 col = mlp(f1, f2, vdir);
  fragColor = vec4(col, 1.0);
}
`;

function injectWeights(src: string, w: Record<string, number[][] | number[]>): string {
  src = src.replace(/BIAS_LIST_ZERO/g, (w["0_bias"] as number[]).join(","));
  src = src.replace(/BIAS_LIST_ONE/g , (w["1_bias"] as number[]).join(","));
  src = src.replace(/BIAS_LIST_TWO/g , (w["2_bias"] as number[]).join(","));
  (w["0_weights"] as number[][]).forEach((v,i)=>src=src.replace(new RegExp(`__W0_${i}__`,`g`),v.join(",")));
  (w["1_weights"] as number[][]).forEach((v,i)=>src=src.replace(new RegExp(`__W1_${i}__`,`g`),v.join(",")));
  (w["2_weights"] as number[][]).forEach((v,i)=>src=src.replace(new RegExp(`__W2_${i}__`,`g`),v.join(",")));
  return src;
}

/*****************************************************************************
 * Props
 *****************************************************************************/
export interface NerfViewerProps {
  objName: string;
  width?: number;
  height?: number;
  objectScale?: number;
  className?: string;
}

/*****************************************************************************
 * Main component
 *****************************************************************************/
const NerfViewer: React.FC<NerfViewerProps> = ({
  objName,
  width = 800,
  height = 800,
  objectScale = 0.1,
  className,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ loaded: 0, total: 1, text: "Fetching metadata…" });

  useEffect(() => {
    if (!mountRef.current) return;

    // Check WebGL2 support first.
    if (!WebGL.isWebGL2Available()) {
      mountRef.current.appendChild(WebGL.getWebGL2ErrorMessage());
      return;
    }

    /************************* Three.js boilerplate *************************/
    const renderer = new THREE.WebGLRenderer({ powerPreference: "high-performance" });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor("#ffffff", 1);
    mountRef.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(39, width / height, 0.3 * objectScale, 6 * objectScale);
    camera.position.set(0, 2 * objectScale, 3.464 * objectScale);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const scene = new THREE.Scene();

    /************************* Progress helpers *************************/
    let total = 1; // we will at least fetch data.json
    let loaded = 0;
    const inc = (txt: string) => {
      setProgress({ loaded: ++loaded, total, text: txt });
    };

    /************************* Start loading *************************/
    const root = `/data/${objName}_mac`;
    fetch(`${root}/data.json`)
      .then(r => r.json())
      .then(meta => {
        const N: number = meta.num_obj ?? 1;
        total = 2 + N + N * 2; // data.json + mlp.json + N objs + N*2 textures
        setProgress(p => ({ ...p, total, text: "Downloading weights…" }));
        inc("Metadata ready"); // count data.json

        // ---- Fetch mlp.json ----
        return fetch(`${root}/mlp.json`).then(r => r.json()).then(weights => ({ N, weights }));
      })
      .then(({ N, weights }) => {
        inc("Weights ready – loading shapes…");
        const fragSrc = injectWeights(FRAG_TEMPLATE, weights);
        const texLoader = new THREE.TextureLoader();
        const objLoader = new OBJLoader();

        for (let i = 0; i < N; i++) {
          // textures
          const tex0 = texLoader.load(`${root}/shape${i}.pngfeat0.png`, () => inc(`Texture ${i}/0`));
          const tex1 = texLoader.load(`${root}/shape${i}.pngfeat1.png`, () => inc(`Texture ${i}/1`));
          tex0.magFilter = tex0.minFilter = THREE.NearestFilter;
          tex1.magFilter = tex1.minFilter = THREE.NearestFilter;

          const material = new THREE.RawShaderMaterial({
            vertexShader: VERT_SRC,
            fragmentShader: fragSrc,
            uniforms: {
              tDiffuse0: { value: tex0 },
              tDiffuse1: { value: tex1 },
            },
            side: THREE.DoubleSide,
            glslVersion: THREE.GLSL3,
          });

          objLoader.load(`${root}/shape${i}.obj`, obj => {
            obj.traverse(child => {
              if ((child as any).isMesh) (child as THREE.Mesh).material = material;
            });
            obj.scale.setScalar(objectScale);
            scene.add(obj);
            inc(`OBJ ${i}`);
          });
        }
      })
      .catch(err => {
        console.error("NerfViewer load error", err);
        setProgress({ loaded: 0, total: 1, text: "Error loading assets" });
      });

    /************************* Animation loop *************************/
    let frameId = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    /************************* Cleanup *************************/
    return () => {
      cancelAnimationFrame(frameId);
      controls.dispose();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [objName, width, height, objectScale]);

  const done = progress.loaded >= progress.total;

  return (
    <div className={className} style={{ position: "relative", width, height }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {!done && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 text-white z-10">
          {/* simple Tailwind spinner */}
          <svg className="animate-spin w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
          <div className="text-sm font-mono tracking-wide text-center max-w-sm px-4">{progress.text}</div>
          <div className="text-xs">{progress.loaded}/{progress.total}</div>
        </div>
      )}
    </div>
  );
};

export default NerfViewer;
