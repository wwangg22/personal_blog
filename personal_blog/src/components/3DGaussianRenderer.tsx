"use client";

import React, { useEffect, useRef, useState } from "react";
import WebGL from "three/examples/jsm/capabilities/WebGL";

type PathNode = { pos: [number, number, number]; yaw: number; pitch: number };

export interface GaussianSplatViewerProps {
  splatUrl: string;
  camerasUrl: string;
  width?: number;
  height?: number;
  className?: string;
}

/* ---------------- GLSL ---------------- */

const vertexShaderSource = `#version 300 es
precision highp float;
precision highp int;

uniform highp usampler2D u_texture;
uniform mat4 projection, view;
uniform vec2 focal;
uniform vec2 viewport;

in vec2 position;
in uint index;                 // <-- unsigned!

out vec4 vColor;
out vec2 vPosition;

void main () {
    // 1024*2 texwidth: even x holds centers, odd x holds covariances
    int ix = int(index & 0x3ffu);
    int iy = int(index >> 10);

    uvec4 cen = texelFetch(u_texture, ivec2((ix << 1), iy), 0);
    vec4 cam  = view * vec4(uintBitsToFloat(cen.xyz), 1.0);
    vec4 pos2d = projection * cam;

    float clip = 1.2 * pos2d.w;
    if (pos2d.z < -clip || pos2d.x < -clip || pos2d.x > clip || pos2d.y < -clip || pos2d.y > clip) {
        gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
        return;
    }

    uvec4 cov = texelFetch(u_texture, ivec2((ix << 1) | 1, iy), 0);
    vec2 u1 = unpackHalf2x16(cov.x), u2 = unpackHalf2x16(cov.y), u3 = unpackHalf2x16(cov.z);
    mat3 Vrk = mat3(u1.x, u1.y, u2.x,
                    u1.y, u2.y, u3.x,
                    u2.x, u3.x, u3.y);

    mat3 J = mat3(
        focal.x / cam.z, 0., -(focal.x * cam.x) / (cam.z * cam.z),
        0., -focal.y / cam.z, (focal.y * cam.y) / (cam.z * cam.z),
        0., 0., 0.
    );

    mat3 T = transpose(mat3(view)) * J;
    mat3 cov2d = transpose(T) * Vrk * T;

    float mid = 0.5 * (cov2d[0][0] + cov2d[1][1]);
    float radius = length(vec2(0.5 * (cov2d[0][0] - cov2d[1][1]), cov2d[0][1]));
    float lambda1 = mid + radius, lambda2 = mid - radius;

    if (lambda2 < 0.0) return;

    vec2 diagVec = normalize(vec2(cov2d[0][1], lambda1 - cov2d[0][0]));
    vec2 majorAxis = min(sqrt(2.0 * lambda1), 1024.0) * diagVec;
    vec2 minorAxis = min(sqrt(2.0 * lambda2), 1024.0) * vec2(diagVec.y, -diagVec.x);

    vColor = clamp(pos2d.z/pos2d.w + 1.0, 0.0, 1.0) *
             vec4( (cov.w        & 0xffu),
                   ((cov.w>> 8) & 0xffu),
                   ((cov.w>>16) & 0xffu),
                   ((cov.w>>24) & 0xffu) ) / 255.0;

    vPosition = position;

    vec2 vCenter = vec2(pos2d) / pos2d.w;
    gl_Position = vec4(
        vCenter
        + position.x * majorAxis / viewport
        + position.y * minorAxis / viewport, 0.0, 1.0);
}`.trim();

const fragmentShaderSource = `#version 300 es
precision highp float;

in vec4 vColor;
in vec2 vPosition;

out vec4 fragColor;

void main () {
    float A = -dot(vPosition, vPosition);
    if (A < -4.0) discard;
    float B = exp(A) * vColor.a;
    fragColor = vec4(B * vColor.rgb, B);
}`.trim();

/* ------------- tiny math helpers (column-major) ------------- */

function multiply4(a: number[], b: number[]) {
  // column-major: c = a * b
  return [
    b[0]*a[0] + b[1]*a[4] + b[2]*a[8]  + b[3]*a[12],
    b[0]*a[1] + b[1]*a[5] + b[2]*a[9]  + b[3]*a[13],
    b[0]*a[2] + b[1]*a[6] + b[2]*a[10] + b[3]*a[14],
    b[0]*a[3] + b[1]*a[7] + b[2]*a[11] + b[3]*a[15],

    b[4]*a[0] + b[5]*a[4] + b[6]*a[8]  + b[7]*a[12],
    b[4]*a[1] + b[5]*a[5] + b[6]*a[9]  + b[7]*a[13],
    b[4]*a[2] + b[5]*a[6] + b[6]*a[10] + b[7]*a[14],
    b[4]*a[3] + b[5]*a[7] + b[6]*a[11] + b[7]*a[15],

    b[8]*a[0] + b[9]*a[4] + b[10]*a[8]  + b[11]*a[12],
    b[8]*a[1] + b[9]*a[5] + b[10]*a[9]  + b[11]*a[13],
    b[8]*a[2] + b[9]*a[6] + b[10]*a[10] + b[11]*a[14],
    b[8]*a[3] + b[9]*a[7] + b[10]*a[11] + b[11]*a[15],

    b[12]*a[0] + b[13]*a[4] + b[14]*a[8]  + b[15]*a[12],
    b[12]*a[1] + b[13]*a[5] + b[14]*a[9]  + b[15]*a[13],
    b[12]*a[2] + b[13]*a[6] + b[14]*a[10] + b[15]*a[14],
    b[12]*a[3] + b[13]*a[7] + b[14]*a[11] + b[15]*a[15],
  ];
}
function invert4(a: number[]) {
  const b00 = a[0] * a[5] - a[1] * a[4];
  const b01 = a[0] * a[6] - a[2] * a[4];
  const b02 = a[0] * a[7] - a[3] * a[4];
  const b03 = a[1] * a[6] - a[2] * a[5];
  const b04 = a[1] * a[7] - a[3] * a[5];
  const b05 = a[2] * a[7] - a[3] * a[6];
  const b06 = a[8] * a[13] - a[9] * a[12];
  const b07 = a[8] * a[14] - a[10] * a[12];
  const b08 = a[8] * a[15] - a[11] * a[12];
  const b09 = a[9] * a[14] - a[10] * a[13];
  const b10 = a[9] * a[15] - a[11] * a[13];
  const b11 = a[10] * a[15] - a[11] * a[14];
  const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) return null;
  return [
    (a[5] * b11 - a[6] * b10 + a[7] * b09) / det,
    (a[2] * b10 - a[1] * b11 - a[3] * b09) / det,
    (a[13] * b05 - a[14] * b04 + a[15] * b03) / det,
    (a[10] * b04 - a[9] * b05 - a[11] * b03) / det,

    (a[6] * b08 - a[4] * b11 - a[7] * b07) / det,
    (a[0] * b11 - a[2] * b08 + a[3] * b07) / det,
    (a[14] * b02 - a[12] * b05 - a[15] * b01) / det,
    (a[8] * b05 - a[10] * b02 + a[11] * b01) / det,

    (a[4] * b10 - a[5] * b08 + a[7] * b06) / det,
    (a[1] * b08 - a[0] * b10 - a[3] * b06) / det,
    (a[12] * b04 - a[13] * b02 + a[15] * b00) / det,
    (a[9] * b02 - a[8] * b04 - a[11] * b00) / det,

    (a[5] * b07 - a[4] * b09 - a[6] * b06) / det,
    (a[0] * b09 - a[1] * b07 + a[2] * b00) / det,
    (a[13] * b01 - a[12] * b03 - a[14] * b00) / det,
    (a[8] * b03 - a[9] * b01 + a[10] * b00) / det,
  ];
}
function wrapPi(a: number) { return ((a + Math.PI) % (2 * Math.PI)) - Math.PI; }
function yawPitchFromRot3(R: number[][]) {
  const bx = R[0][2], by = R[1][2], bz = R[2][2];
  return [Math.atan2(bx, bz), Math.asin(-by)] as const;
}
function makeViewMatrix(yaw: number, pitch: number, pos: number[]) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  // build camera->world in column-major
  const right = [  cy, 0, -sy ];
  const up    = [  sy*sp,  cp,  cy*sp ];
  const back  = [  sy*cp, -sp,  cy*cp ];
  const camToWorld = [
    right[0], right[1], right[2], 0,
    up[0],    up[1],    up[2],    0,
    back[0],  back[1],  back[2],  0,
    pos[0],   pos[1],   pos[2],   1,
  ];
  return invert4(camToWorld)!; // column-major inverse = view
}
function getProjectionMatrix(fx: number, fy: number, width: number, height: number) {
  // column-major perspective with z in [0,1]
  const znear = 0.2, zfar = 200;
  return [
    (2 * fx) / width, 0, 0, 0,
    0, -(2 * fy) / height, 0, 0,
    0, 0, zfar / (zfar - znear), 1,
    0, 0, -(zfar * znear) / (zfar - znear), 0,
  ];
}

/* --------------------------- Worker (unchanged math) --------------------------- */

function createWorker(self: any) {
  let buffer: ArrayBuffer | undefined;
  let vertexCount = 0;
  let viewProj: Float32Array | number[] | undefined;
  let lastProj: number[] = [];
  let depthIndex = new Uint32Array();
  let lastVertexCount = 0;

  const _floatView = new Float32Array(1);
  const _int32View = new Int32Array(_floatView.buffer);
  function floatToHalf(float: number) {
    _floatView[0] = float;
    const f = _int32View[0];
    const sign = (f >> 31) & 0x0001;
    const exp = (f >> 23) & 0x00ff;
    let frac = f & 0x007fffff;
    let newExp;
    if (exp === 0) newExp = 0;
    else if (exp < 113) { newExp = 0; frac |= 0x00800000; frac >>= (113 - exp); if (frac & 0x01000000) { newExp = 1; frac = 0; } }
    else if (exp < 142) newExp = exp - 112;
    else { newExp = 31; frac = 0; }
    return ((sign << 15) | (newExp << 10) | (frac >> 13)) >>> 0;
  }
  function packHalf2x16(x: number, y: number) { return (floatToHalf(x) | (floatToHalf(y) << 16)) >>> 0; }

  function generateTexture() {
    if (!buffer) return;
    const f_buffer = new Float32Array(buffer);
    const u_buffer = new Uint8Array(buffer);

    const texwidth = 1024 * 2;
    const texheight = Math.ceil((2 * vertexCount) / texwidth);
    const texdata = new Uint32Array(texwidth * texheight * 4);
    const texdata_c = new Uint8Array(texdata.buffer);
    const texdata_f = new Float32Array(texdata.buffer);

    for (let i = 0; i < vertexCount; i++) {
      texdata_f[8 * i + 0] = f_buffer[8 * i + 0];
      texdata_f[8 * i + 1] = f_buffer[8 * i + 1];
      texdata_f[8 * i + 2] = f_buffer[8 * i + 2];

      texdata_c[4 * (8 * i + 7) + 0] = u_buffer[32 * i + 24 + 0];
      texdata_c[4 * (8 * i + 7) + 1] = u_buffer[32 * i + 24 + 1];
      texdata_c[4 * (8 * i + 7) + 2] = u_buffer[32 * i + 24 + 2];
      texdata_c[4 * (8 * i + 7) + 3] = u_buffer[32 * i + 24 + 3];

      const scale = [f_buffer[8 * i + 3], f_buffer[8 * i + 4], f_buffer[8 * i + 5]];
      const rot = [
        (u_buffer[32 * i + 28 + 0] - 128) / 128,
        (u_buffer[32 * i + 28 + 1] - 128) / 128,
        (u_buffer[32 * i + 28 + 2] - 128) / 128,
        (u_buffer[32 * i + 28 + 3] - 128) / 128,
      ];
      const M = [
        1.0 - 2.0 * (rot[2] * rot[2] + rot[3] * rot[3]),
        2.0 * (rot[1] * rot[2] + rot[0] * rot[3]),
        2.0 * (rot[1] * rot[3] - rot[0] * rot[2]),
        2.0 * (rot[1] * rot[2] - rot[0] * rot[3]),
        1.0 - 2.0 * (rot[1] * rot[1] + rot[3] * rot[3]),
        2.0 * (rot[2] * rot[3] + rot[0] * rot[1]),
        2.0 * (rot[1] * rot[3] + rot[0] * rot[2]),
        2.0 * (rot[2] * rot[3] - rot[0] * rot[1]),
        1.0 - 2.0 * (rot[1] * rot[1] + rot[2] * rot[2]),
      ].map((k, i) => k * scale[Math.floor(i / 3)]);
      const sigma = [
        M[0] * M[0] + M[3] * M[3] + M[6] * M[6],
        M[0] * M[1] + M[3] * M[4] + M[6] * M[7],
        M[0] * M[2] + M[3] * M[5] + M[6] * M[8],
        M[1] * M[1] + M[4] * M[4] + M[7] * M[7],
        M[1] * M[2] + M[4] * M[5] + M[7] * M[8],
        M[2] * M[2] + M[5] * M[5] + M[8] * M[8],
      ];
      texdata[8 * i + 4] = packHalf2x16(4 * sigma[0], 4 * sigma[1]);
      texdata[8 * i + 5] = packHalf2x16(4 * sigma[2], 4 * sigma[3]);
      texdata[8 * i + 6] = packHalf2x16(4 * sigma[4], 4 * sigma[5]);
    }
    (self as any).postMessage({ texdata, texwidth, texheight }, [texdata.buffer]);
  }

  function runSort(viewProjArr: number[] | Float32Array) {
    if (!buffer) return;
    const f_buffer = new Float32Array(buffer);

    if (lastVertexCount === vertexCount) {
      const dot =
        (lastProj[2] || 0) * (viewProjArr[2] as number) +
        (lastProj[6] || 0) * (viewProjArr[6] as number) +
        (lastProj[10] || 0) * (viewProjArr[10] as number);
      if (Math.abs(dot - 1) < 0.01) return;
    } else {
      generateTexture();
      lastVertexCount = vertexCount;
    }

    let maxDepth = -Infinity, minDepth = Infinity;
    const sizeList = new Int32Array(vertexCount);
    for (let i = 0; i < vertexCount; i++) {
      const depth = (((viewProjArr[2] as number) * f_buffer[8 * i + 0] +
                      (viewProjArr[6] as number) * f_buffer[8 * i + 1] +
                      (viewProjArr[10] as number) * f_buffer[8 * i + 2]) * 4096) | 0;
      sizeList[i] = depth;
      if (depth > maxDepth) maxDepth = depth;
      if (depth < minDepth) minDepth = depth;
    }

    const depthInv = (256 * 256 - 1) / (maxDepth - minDepth);
    const counts0 = new Uint32Array(256 * 256);
    for (let i = 0; i < vertexCount; i++) {
      sizeList[i] = ((sizeList[i] - minDepth) * depthInv) | 0;
      counts0[sizeList[i]]++;
    }
    const starts0 = new Uint32Array(256 * 256);
    for (let i = 1; i < 256 * 256; i++) starts0[i] = starts0[i - 1] + counts0[i - 1];
    depthIndex = new Uint32Array(vertexCount);
    for (let i = 0; i < vertexCount; i++) depthIndex[starts0[sizeList[i]]++] = i;

    lastProj = Array.from(viewProjArr as any);
    (self as any).postMessage({ depthIndex, viewProj: viewProjArr, vertexCount }, [depthIndex.buffer]);
  }

  let sortRunning = false;
  const throttledSort = () => {
    if (!sortRunning) {
      sortRunning = true;
      const lastView = viewProj!;
      runSort(lastView as any);
      setTimeout(() => {
        sortRunning = false;
        if (lastView !== viewProj) throttledSort();
      }, 0);
    }
  };

  (self as any).onmessage = (e: MessageEvent) => {
    const d: any = e.data;
    if (d.buffer) {
      buffer = d.buffer; vertexCount = d.vertexCount;
    } else if (d.vertexCount) {
      vertexCount = d.vertexCount;
    } else if (d.view) {
      viewProj = d.view;
      throttledSort();
    }
  };
}

/* ------------------------------ Component ------------------------------ */

const GaussianSplatViewer: React.FC<GaussianSplatViewerProps> = ({
  splatUrl,
  camerasUrl,
  width = 800,
  height = 800,
  className,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  const [progress, setProgress] = useState({ loaded: 0, total: 1, text: "Initializing…" });
  const [ready, setReady] = useState(false);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    if (!wrapRef.current || !canvasRef.current || !sliderRef.current) return;

    const wrapper = wrapRef.current!;
    const canvas = canvasRef.current!;
    const slider = sliderRef.current!;

    if (!WebGL.isWebGL2Available()) {
      setProgress({ loaded: 0, total: 1, text: "WebGL2 not supported." });
      return;
    }

    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false }) as WebGL2RenderingContext | null;
    if (!gl) {
      setProgress({ loaded: 0, total: 1, text: "Failed to acquire WebGL2 context." });
      return;
    }

    // --- compile/link
    function compileGL(type: number, src: string) {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(sh) || "Shader compile error";
        gl.deleteShader(sh);
        throw new Error(info);
      }
      return sh;
    }
    function linkGL(vs: WebGLShader, fs: WebGLShader) {
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(prog) || "Program link error";
        gl.deleteProgram(prog);
        throw new Error(info);
      }
      return prog;
    }

    let program: WebGLProgram | null = null;
    let u_projection: WebGLUniformLocation | null = null;
    let u_viewport: WebGLUniformLocation | null = null;
    let u_focal: WebGLUniformLocation | null = null;
    let u_view: WebGLUniformLocation | null = null;

    let vao: WebGLVertexArrayObject | null = null;
    let texture: WebGLTexture | null = null;
    let indexBuffer: WebGLBuffer | null = null;
    let vertexBuffer: WebGLBuffer | null = null;

    let a_position = -1;
    let a_index = -1;

    try {
      const vs = compileGL(gl.VERTEX_SHADER, vertexShaderSource);
      const fs = compileGL(gl.FRAGMENT_SHADER, fragmentShaderSource);
      program = linkGL(vs, fs);
      gl.useProgram(program);
    } catch (e: any) {
      setProgress({ loaded: 0, total: 1, text: `GL init error: ${e?.message || e}` });
      return;
    }

    // --- VAO (REQUIRED in WebGL2)
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // uniforms
    u_projection = gl.getUniformLocation(program!, "projection");
    u_viewport   = gl.getUniformLocation(program!, "viewport");
    u_focal      = gl.getUniformLocation(program!, "focal");
    u_view       = gl.getUniformLocation(program!, "view");
    const u_textureLocation = gl.getUniformLocation(program!, "u_texture");

    // quad corners
    const quad = new Float32Array([-2, -2, 2, -2, 2, 2, -2, 2]);
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    a_position = gl.getAttribLocation(program!, "position");
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    // per-instance index (UNSIGNED)
    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
    a_index = gl.getAttribLocation(program!, "index");
    gl.enableVertexAttribArray(a_index);
    gl.vertexAttribIPointer(a_index, 1, gl.UNSIGNED_INT, 0, 0);
    gl.vertexAttribDivisor(a_index, 1);

    // texture & sampler
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(u_textureLocation, 0);

    // state
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE_MINUS_DST_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
    gl.clearColor(0.03, 0.03, 0.035, 1);

    // FOV & focal lengths
    const DIAG_FOV_DEG = 70;
    const DIAG_FOV = (DIAG_FOV_DEG * Math.PI) / 180;
    let fx = 1, fy = 1;
    function updateFocal(w: number, h: number) {
      const minDim = Math.min(w, h);
      const f = 0.5 * minDim / Math.tan(DIAG_FOV / 2);
      fx = f; fy = f;
    }

    // projection & viewport
    let projectionMatrix: number[] = [];
    const resize = () => {
      const w = Math.max(1, Math.round(width));
      const h = Math.max(1, Math.round(height));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);

      updateFocal(w, h);
      projectionMatrix = getProjectionMatrix(fx, fy, w, h);
      gl.uniformMatrix4fv(u_projection, false, new Float32Array(projectionMatrix));
      gl.uniform2fv(u_viewport, new Float32Array([w, h]));
      gl.uniform2fv(u_focal, new Float32Array([fx, fy]));
    };
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    // UI controls
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    const YAW_RANGE = Math.PI / 2;
    const PITCH_RANGE = Math.PI / 2;
    const ROTATE_SPEED = 1.7;
    let yawFrac = 0.5, pitchFrac = 0.5;

    let targetT = 0;
    slider.addEventListener("input", () => { targetT = Number(slider.value) / 100; });
    wrapper.addEventListener("wheel", (e: WheelEvent) => {
      const dir = Math.sign(e.deltaY); const step = 0.01;
      targetT = clamp(targetT + dir * step, 0, 1);
      slider.value = String(Math.round(targetT * 100));
    }, { passive: true });

    let dragging = false, px = 0, py = 0;
    const onPointerDown = (ev: PointerEvent) => {
      (ev.target as Element).setPointerCapture(ev.pointerId);
      if (ev.isPrimary) { dragging = true; px = ev.clientX; py = ev.clientY; }
    };
    const onPointerMove = (ev: PointerEvent) => {
      if (!dragging) return;
      if ((ev.buttons & 1) || (ev.pointerType === "touch" && ev.isPrimary)) {
        const dx = (ev.clientX - px) / width;
        const dy = (ev.clientY - py) / height;
        yawFrac = clamp(yawFrac + dx * ROTATE_SPEED, 0, 1);
        pitchFrac = clamp(pitchFrac - dy * ROTATE_SPEED, 0, 1);
        px = ev.clientX; py = ev.clientY;
      }
    };
    const onPointerUp = (ev: PointerEvent) => { if (ev.isPrimary) dragging = false; };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    // camera path
    let PATH: PathNode[] = [];
    const samplePath = (path: PathNode[], t: number) => {
      const n = path.length - 1;
      const s = Math.min(t * n, n - 1e-6);
      const i = Math.floor(s);
      const u = s - i;
      const a = path[i], b = path[i + 1];
      const pos: [number, number, number] = [
        a.pos[0] + (b.pos[0] - a.pos[0]) * u,
        a.pos[1] + (b.pos[1] - a.pos[1]) * u,
        a.pos[2] + (b.pos[2] - a.pos[2]) * u,
      ];
      const dyaw = wrapPi(b.yaw - a.yaw);
      const yaw = wrapPi(a.yaw + dyaw * u);
      const pitch = a.pitch + (b.pitch - a.pitch) * u;
      return { pos, yaw, pitch };
    };

    // worker
    let splatWorker: Worker | null = null;
    {
      const blob = new Blob([`(${createWorker.toString()})(self)`], { type: "application/javascript" });
      splatWorker = new Worker(URL.createObjectURL(blob));
    }

    // stream state
    const ROW_BYTES = 3*4 + 3*4 + 4 + 4;
    let splatData = new Uint8Array(1024 * 1024);
    let bytesRead = 0;
    let contentLength = 0;
    let vertexCount = 0;

    if (splatWorker) {
      splatWorker.onmessage = (e: MessageEvent) => {
        const d: any = e.data;
        if (d.texdata) {
          const { texdata, texwidth, texheight } = d as { texdata: Uint32Array; texwidth: number; texheight: number };
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, texwidth, texheight, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, texdata);
        } else if (d.depthIndex) {
          const { depthIndex, vertexCount: vcount } = d as { depthIndex: Uint32Array; vertexCount: number };
          gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, depthIndex, gl.DYNAMIC_DRAW); // Uint32Array
          vertexCount = vcount;
          const estTotalVerts = Math.max(Math.floor(contentLength / ROW_BYTES), vertexCount || 1);
          setProgress({ loaded: vertexCount, total: estTotalVerts, text: "Sorting / uploading…" });
          if (vertexCount > 0) setReady(true);
        }
      };
    }

    // animation
    let animationId = 0;
    let lastFrame = performance.now();
    let avgFps = 0;

    const LERP_RATE = 8;
    let currentT = 0;

    const view = new Float32Array(16);
    const frame = (now: number) => {
      const dt = (now - lastFrame) * 0.001;
      const k = 1.0 - Math.exp(-LERP_RATE * dt);
      currentT += (targetT - currentT) * k;

      const base = PATH.length >= 2 ? samplePath(PATH, currentT) : { pos: [0, 0, 5] as [number, number, number], yaw: 0, pitch: 0 };
      const yaw = base.yaw + (yawFrac - 0.5) * YAW_RANGE;
      const pitch = base.pitch + (pitchFrac - 0.5) * PITCH_RANGE;

      const viewMatrix = makeViewMatrix(yaw, pitch, base.pos);
      for (let i = 0; i < 16; i++) view[i] = viewMatrix[i];
      gl.uniformMatrix4fv(u_view, false, view);

      const viewProj = multiply4(projectionMatrix, viewMatrix);
      splatWorker?.postMessage({ view: viewProj });

      const currentFps = 1000 / (now - lastFrame) || 0;
      avgFps = avgFps * 0.9 + currentFps * 0.1;
      setFps(Math.round(avgFps));

      gl.clear(gl.COLOR_BUFFER_BIT);

      if (vertexCount > 0) {
        gl.bindVertexArray(vao);
        gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, vertexCount);
      }

      lastFrame = now;
      animationId = requestAnimationFrame(frame);
    };

    let cancelled = false;

    (async () => {
      try {
        // cameras → PATH
        setProgress({ loaded: 0, total: 1, text: "Fetching cameras…" });
        const camRes = await fetch(camerasUrl, { mode: "cors", credentials: "omit" });
        if (!camRes.ok) throw new Error(`${camRes.status} while loading cameras`);
        const cameras = (await camRes.json()) as any[];
        PATH = cameras.map((cam) => {
          const R: number[][] = [
            [cam.rotation[0][0], cam.rotation[0][1], cam.rotation[0][2]],
            [cam.rotation[1][0], cam.rotation[1][1], cam.rotation[1][2]],
            [cam.rotation[2][0], cam.rotation[2][1], cam.rotation[2][2]],
          ];
          const [y, p] = yawPitchFromRot3(R);
          return { pos: [cam.position[0], -cam.position[1], -cam.position[2]] as [number, number, number], yaw: y, pitch: p };
        });
        if (PATH.length < 2) PATH = [{ pos: [0, 0, 5], yaw: 0, pitch: 0 }, { pos: [0, 0, 5], yaw: 0, pitch: 0 }];

        // stream splat
        setProgress({ loaded: 0, total: 1, text: "Fetching splat…" });
        const req = await fetch(splatUrl, { mode: "cors", credentials: "omit" });
        if (!req.ok) throw new Error(`${req.status} while loading ${req.url}`);
        const len = Number(req.headers.get("content-length") || 0);
        contentLength = Number.isFinite(len) ? len : 0;

        const reader = req.body?.getReader();
        if (!reader) throw new Error("No readable body for splat");

        bytesRead = 0; vertexCount = 0; let lastVertexCount = -1;
        animationId = requestAnimationFrame(frame);

        while (true) {
          const { done, value } = await reader.read();
          if (cancelled || done) break;

          if (bytesRead + value.length > splatData.length) {
            const nextSize = Math.max(splatData.length * 2, bytesRead + value.length);
            const bigger = new Uint8Array(nextSize);
            bigger.set(splatData);
            splatData = bigger;
          }
          splatData.set(value, bytesRead);
          bytesRead += value.length;

          const have = Math.floor(bytesRead / ROW_BYTES);
          const totalVerts = contentLength ? Math.max(1, Math.floor(contentLength / ROW_BYTES)) : Math.max(1, have);
          setProgress({ loaded: have, total: totalVerts, text: "Streaming splat…" });

          if (have > lastVertexCount) {
            // NOTE: no transfer list so we don't neuter our growing buffer
            splatWorker?.postMessage({ buffer: splatData.buffer, vertexCount: have });
            lastVertexCount = have;
          }
        }

        const finalVerts = Math.floor(bytesRead / ROW_BYTES);
        splatWorker?.postMessage({ buffer: splatData.buffer, vertexCount: finalVerts });
        setProgress({ loaded: finalVerts, total: Math.max(1, Math.floor(contentLength / ROW_BYTES)), text: "Finalizing…" });
      } catch (err: any) {
        if (!cancelled) setProgress({ loaded: 0, total: 1, text: `Load error: ${String(err?.message || err)}` });
      }
    })();

    // cleanup
    return () => {
      cancelled = true;
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      if (splatWorker) { splatWorker.terminate(); splatWorker = null; }
      if (program) {
        gl.useProgram(null);
        if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
        if (indexBuffer) gl.deleteBuffer(indexBuffer);
        if (texture) gl.deleteTexture(texture);
        if (vao) gl.deleteVertexArray(vao);
      }
    };
  }, [splatUrl, camerasUrl, width, height]);

  const done = ready;

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative", width, height }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      <div className="pointer-events-none absolute inset-0 flex flex-col">
        <div className="ml-auto mt-2 mr-2 text-xs font-mono bg-black/60 text-white px-2 py-1 rounded">{fps} fps</div>
        <div className="mt-auto mb-2 px-4">
          <input ref={sliderRef} type="range" min={0} max={100} defaultValue={0} className="pointer-events-auto w-full accent-white/80" />
        </div>
      </div>
      {!done && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 text-white z-10">
          <svg className="animate-spin w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
          <div className="text-sm font-mono tracking-wide text-center max-w-sm px-4">{progress.text}</div>
          <div className="text-xs">{progress.loaded}/{progress.total}</div>
        </div>
      )}
    </div>
  );
};

export default GaussianSplatViewer;
