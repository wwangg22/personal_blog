"use client";

import React, { useEffect, useRef, useState } from "react";

export interface GaussianSplatViewerPathProps {
  splatUrl: string;
  camerasUrl: string; // REQUIRED for this version (PATH-driven)
  width?: number;
  height?: number;
  className?: string;
}

/* ------------------------- math helpers (from your JS) ------------------------- */

const wrapPi = (a: number) => ((a + Math.PI) % (2 * Math.PI)) - Math.PI;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const DIAG_FOV_DEG = 70;
const DIAG_FOV = (DIAG_FOV_DEG * Math.PI) / 180;

function getProjectionMatrix(fx: number, fy: number, width: number, height: number) {
  const znear = 0.2;
  const zfar = 200;
  return [
    [(2 * fx) / width, 0, 0, 0],
    [0, -(2 * fy) / height, 0, 0],
    [0, 0, zfar / (zfar - znear), 1],
    [0, 0, -(zfar * znear) / (zfar - znear), 0],
  ].flat();
}

function multiply4(a: number[], b: number[]) {
  return [
    b[0] * a[0] + b[1] * a[4] + b[2] * a[8] + b[3] * a[12],
    b[0] * a[1] + b[1] * a[5] + b[2] * a[9] + b[3] * a[13],
    b[0] * a[2] + b[1] * a[6] + b[2] * a[10] + b[3] * a[14],
    b[0] * a[3] + b[1] * a[7] + b[2] * a[11] + b[3] * a[15],
    b[4] * a[0] + b[5] * a[4] + b[6] * a[8] + b[7] * a[12],
    b[4] * a[1] + b[5] * a[5] + b[6] * a[9] + b[7] * a[13],
    b[4] * a[2] + b[5] * a[6] + b[6] * a[10] + b[7] * a[14],
    b[4] * a[3] + b[5] * a[7] + b[6] * a[11] + b[7] * a[15],
    b[8] * a[0] + b[9] * a[4] + b[10] * a[8] + b[11] * a[12],
    b[8] * a[1] + b[9] * a[5] + b[10] * a[9] + b[11] * a[13],
    b[8] * a[2] + b[9] * a[6] + b[10] * a[10] + b[11] * a[14],
    b[8] * a[3] + b[9] * a[7] + b[10] * a[11] + b[11] * a[15],
    b[12] * a[0] + b[13] * a[4] + b[14] * a[8] + b[15] * a[12],
    b[12] * a[1] + b[13] * a[5] + b[14] * a[9] + b[15] * a[13],
    b[12] * a[2] + b[13] * a[6] + b[14] * a[10] + b[15] * a[14],
    b[12] * a[3] + b[13] * a[7] + b[14] * a[11] + b[15] * a[15],
  ];
}

function invert4(a: number[]) {
  let b00 = a[0] * a[5] - a[1] * a[4];
  let b01 = a[0] * a[6] - a[2] * a[4];
  let b02 = a[0] * a[7] - a[3] * a[4];
  let b03 = a[1] * a[6] - a[2] * a[5];
  let b04 = a[1] * a[7] - a[3] * a[5];
  let b05 = a[2] * a[7] - a[3] * a[6];
  let b06 = a[8] * a[13] - a[9] * a[12];
  let b07 = a[8] * a[14] - a[10] * a[12];
  let b08 = a[8] * a[15] - a[11] * a[12];
  let b09 = a[9] * a[14] - a[10] * a[13];
  let b10 = a[9] * a[15] - a[11] * a[13];
  let b11 = a[10] * a[15] - a[11] * a[14];
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
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
    (a[0] * b09 - a[1] * b07 + a[2] * b06) / det,
    (a[13] * b01 - a[12] * b03 - a[14] * b00) / det,
    (a[8] * b03 - a[9] * b01 + a[10] * b00) / det,
  ];
}

function rotate4(a: number[], rad: number, x: number, y: number, z: number) {
  let len = Math.hypot(x, y, z);
  x /= len;
  y /= len;
  z /= len;
  let s = Math.sin(rad);
  let c = Math.cos(rad);
  let t = 1 - c;
  let b00 = x * x * t + c;
  let b01 = y * x * t + z * s;
  let b02 = z * x * t - y * s;
  let b10 = x * y * t - z * s;
  let b11 = y * y * t + c;
  let b12 = z * y * t + x * s;
  let b20 = x * z * t + y * s;
  let b21 = y * z * t - x * s;
  let b22 = z * z * t + c;
  return [
    a[0] * b00 + a[4] * b01 + a[8] * b02,
    a[1] * b00 + a[5] * b01 + a[9] * b02,
    a[2] * b00 + a[6] * b01 + a[10] * b02,
    a[3] * b00 + a[7] * b01 + a[11] * b02,
    a[0] * b10 + a[4] * b11 + a[8] * b12,
    a[1] * b10 + a[5] * b11 + a[9] * b12,
    a[2] * b10 + a[6] * b11 + a[10] * b12,
    a[3] * b10 + a[7] * b11 + a[11] * b12,
    a[0] * b20 + a[4] * b21 + a[8] * b22,
    a[1] * b20 + a[5] * b21 + a[9] * b22,
    a[2] * b20 + a[6] * b21 + a[10] * b22,
    a[3] * b20 + a[7] * b21 + a[11] * b22,
    ...a.slice(12, 16),
  ];
}

function translate4(a: number[], x: number, y: number, z: number) {
  return [
    ...a.slice(0, 12),
    a[0] * x + a[4] * y + a[8] * z + a[12],
    a[1] * x + a[5] * y + a[9] * z + a[13],
    a[2] * x + a[6] * y + a[10] * z + a[14],
    a[3] * x + a[7] * y + a[11] * z + a[15],
  ];
}

function safeAsin(x: number) {
  return Math.asin(Math.max(-1, Math.min(1, x)));
}

function makeViewMatrix(yaw: number, pitch: number, pos: number[]) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);

  const right = [cy, 0, -sy];
  const up = [sy * sp, cp, cy * sp];
  const back = [sy * cp, -sp, cy * cp];

  return invert4([
    right[0], right[1], right[2], 0,
    up[0], up[1], up[2], 0,
    back[0], back[1], back[2], 0,
    pos[0], pos[1], pos[2], 1,
  ]);
}

function yawPitchFromRot3(R: number[][]) {
  const bx = R[0][2];
  const by = R[1][2];
  const bz = R[2][2];
  return [Math.atan2(bx, bz), safeAsin(-by)] as const;
}

type PathKeyframe = { pos: number[]; yaw: number; pitch: number };

function samplePath(path: PathKeyframe[], t: number) {
  const n = path.length - 1;
  if (n <= 0) return path[0];

  const s = Math.min(t * n, n - 1e-6);
  const i = Math.floor(s);
  const u = s - i;

  const a = path[i];
  const b = path[i + 1];

  const pos = [
    a.pos[0] + (b.pos[0] - a.pos[0]) * u,
    a.pos[1] + (b.pos[1] - a.pos[1]) * u,
    a.pos[2] + (b.pos[2] - a.pos[2]) * u,
  ];

  const dyaw = wrapPi(b.yaw - a.yaw);
  const yaw = wrapPi(a.yaw + dyaw * u);
  const pitch = a.pitch + (b.pitch - a.pitch) * u;

  return { pos, yaw, pitch };
}

/* ------------------------- worker (same as your JS core) ------------------------- */
function createWorker(self: any) {
  let buffer: ArrayBuffer | undefined;
  let vertexCount = 0;
  let viewProj: number[] | undefined;

  const rowLength = 3 * 4 + 3 * 4 + 4 + 4;
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
    if (exp == 0) {
      newExp = 0;
    } else if (exp < 113) {
      newExp = 0;
      frac |= 0x00800000;
      frac = frac >> (113 - exp);
      if (frac & 0x01000000) {
        newExp = 1;
        frac = 0;
      }
    } else if (exp < 142) {
      newExp = exp - 112;
    } else {
      newExp = 31;
      frac = 0;
    }
    return (sign << 15) | (newExp << 10) | (frac >> 13);
  }

  function packHalf2x16(x: number, y: number) {
    return (floatToHalf(x) | (floatToHalf(y) << 16)) >>> 0;
  }

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

      const scale = [
        f_buffer[8 * i + 3 + 0],
        f_buffer[8 * i + 3 + 1],
        f_buffer[8 * i + 3 + 2],
      ];
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
      ].map((k, idx) => k * scale[Math.floor(idx / 3)]);

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

    self.postMessage({ texdata, texwidth, texheight }, [texdata.buffer]);
  }

  function runSort(vp: number[]) {
    if (!buffer) return;
    const f_buffer = new Float32Array(buffer);

    if (lastVertexCount == vertexCount) {
      const dot = lastProj[2] * vp[2] + lastProj[6] * vp[6] + lastProj[10] * vp[10];
      if (Math.abs(dot - 1) < 0.01) return;
    } else {
      generateTexture();
      lastVertexCount = vertexCount;
    }

    let maxDepth = -Infinity;
    let minDepth = Infinity;
    const sizeList = new Int32Array(vertexCount);

    for (let i = 0; i < vertexCount; i++) {
      const depth = (((vp[2] * f_buffer[8 * i + 0] + vp[6] * f_buffer[8 * i + 1] + vp[10] * f_buffer[8 * i + 2]) * 4096) | 0) as number;
      sizeList[i] = depth;
      if (depth > maxDepth) maxDepth = depth;
      if (depth < minDepth) minDepth = depth;
    }

    const depthInv = (256 * 256 - 1) / (maxDepth - minDepth);
    const counts0 = new Uint32Array(256 * 256);
    for (let i = 0; i < vertexCount; i++) {
      sizeList[i] = (((sizeList[i] - minDepth) * depthInv) | 0) as number;
      counts0[sizeList[i]]++;
    }
    const starts0 = new Uint32Array(256 * 256);
    for (let i = 1; i < 256 * 256; i++) starts0[i] = starts0[i - 1] + counts0[i - 1];

    depthIndex = new Uint32Array(vertexCount);
    for (let i = 0; i < vertexCount; i++) depthIndex[starts0[sizeList[i]]++] = i;

    lastProj = vp;
    self.postMessage({ depthIndex, viewProj: vp, vertexCount }, [depthIndex.buffer]);
  }

  let sortRunning = false;
  const throttledSort = () => {
    if (sortRunning) return;
    sortRunning = true;
    const lastView = viewProj!;
    runSort(lastView);
    setTimeout(() => {
      sortRunning = false;
      if (lastView !== viewProj) throttledSort();
    }, 0);
  };

  self.onmessage = (e: MessageEvent) => {
    const data: any = e.data;
    if (data.buffer) {
      buffer = data.buffer;
      vertexCount = data.vertexCount;
    } else if (data.vertexCount) {
      vertexCount = data.vertexCount;
    } else if (data.view) {
      viewProj = data.view;
      throttledSort();
    }
  };
}

/* ------------------------- shaders (same as your JS) ------------------------- */

const vertexShaderSource = `#version 300 es
precision highp float;
precision highp int;

uniform highp usampler2D u_texture;
uniform mat4 projection, view;
uniform vec2 focal;
uniform vec2 viewport;

in vec2 position;
in int index;

out vec4 vColor;
out vec2 vPosition;

void main () {
    uvec4 cen = texelFetch(u_texture, ivec2((uint(index) & 0x3ffu) << 1, uint(index) >> 10), 0);
    vec4 cam = view * vec4(uintBitsToFloat(cen.xyz), 1);
    vec4 pos2d = projection * cam;

    float clip = 1.2 * pos2d.w;
    if (pos2d.z < -clip || pos2d.x < -clip || pos2d.x > clip || pos2d.y < -clip || pos2d.y > clip) {
        gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
        return;
    }

    uvec4 cov = texelFetch(u_texture, ivec2(((uint(index) & 0x3ffu) << 1) | 1u, uint(index) >> 10), 0);
    vec2 u1 = unpackHalf2x16(cov.x), u2 = unpackHalf2x16(cov.y), u3 = unpackHalf2x16(cov.z);
    mat3 Vrk = mat3(u1.x, u1.y, u2.x, u1.y, u2.y, u3.x, u2.x, u3.x, u3.y);

    mat3 J = mat3(
        focal.x / cam.z, 0., -(focal.x * cam.x) / (cam.z * cam.z),
        0., -focal.y / cam.z, (focal.y * cam.y) / (cam.z * cam.z),
        0., 0., 0.
    );

    mat3 T = transpose(mat3(view)) * J;
    mat3 cov2d = transpose(T) * Vrk * T;

    float mid = (cov2d[0][0] + cov2d[1][1]) / 2.0;
    float radius = length(vec2((cov2d[0][0] - cov2d[1][1]) / 2.0, cov2d[0][1]));
    float lambda1 = mid + radius, lambda2 = mid - radius;

    if(lambda2 < 0.0) return;
    vec2 diagonalVector = normalize(vec2(cov2d[0][1], lambda1 - cov2d[0][0]));
    vec2 majorAxis = min(sqrt(2.0 * lambda1), 1024.0) * diagonalVector;
    vec2 minorAxis = min(sqrt(2.0 * lambda2), 1024.0) * vec2(diagonalVector.y, -diagonalVector.x);

    vColor = clamp(pos2d.z/pos2d.w+1.0, 0.0, 1.0) * vec4((cov.w) & 0xffu, (cov.w >> 8) & 0xffu, (cov.w >> 16) & 0xffu, (cov.w >> 24) & 0xffu) / 255.0;
    vPosition = position;

    vec2 vCenter = vec2(pos2d) / pos2d.w;
    gl_Position = vec4(
        vCenter
        + position.x * majorAxis / viewport
        + position.y * minorAxis / viewport, 0.0, 1.0);
}
`.trim();

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
}
`.trim();

/* ------------------------------ component ------------------------------ */

const GaussianSplatViewerPath: React.FC<GaussianSplatViewerPathProps> = ({
  splatUrl,
  camerasUrl,
  width = 960,
  height = 540,
  className,
}) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);

  const [fps, setFps] = useState(0);
  const [loadingText, setLoadingText] = useState("Loading cameras…");
  const [loadedVerts, setLoadedVerts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const slider = sliderRef.current;
    if (!wrap || !canvas || !slider) return;

    let cancelled = false;
    const abort = new AbortController();

    setError(null);
    setFps(0);
    setLoadedVerts(0);
    setLoadingText("Loading cameras…");

    // PATH (key difference)
    let PATH: PathKeyframe[] = [];

    // viewport dims (we treat these like your innerWidth/innerHeight in JS)
    let viewW = 1;
    let viewH = 1;

    // camera controls (same feel as your JS)
    const LERP_RATE = 8;
    const ROTATE_SPEED = 1.7;

    const YAW_RANGE = Math.PI / 2;
    const PITCH_RANGE = Math.PI / 2;

    let yawFrac = 0.5;
    let pitchFrac = 0.5;

    let targetT = 0;
    let currentT = 0;

    let dragging = false;
    let px = 0;
    let py = 0;

    // focal lengths (computed from min(viewW, viewH) like your updateFocalLengths())
    let fx = 1, fy = 1;
    function updateFocalLengths() {
      const minDim = Math.min(viewW, viewH); // same logic as your JS (min(innerWidth, innerHeight))
      const f = 0.5 * minDim / Math.tan(DIAG_FOV / 2);
      fx = f;
      fy = f;
    }

    // --- WebGL init ---
    const gl = canvas.getContext("webgl2", { antialias: false }) as WebGL2RenderingContext | null;
    if (!gl) {
      setError("WebGL2 not available.");
      return;
    }

    // compile/link
    function compile(type: number, src: string) {
      if (!gl) throw new Error("no gl");
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(sh));
        throw new Error("Shader compile failed (see console).");
      }
      return sh;
    }

    let program: WebGLProgram;
    try {
      const vs = compile(gl.VERTEX_SHADER, vertexShaderSource);
      const fs = compile(gl.FRAGMENT_SHADER, fragmentShaderSource);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        throw new Error("Program link failed (see console).");
      }
      gl.useProgram(program);
    } catch (e: any) {
      setError(String(e?.message || e));
      return;
    }

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE_MINUS_DST_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);

    const u_projection = gl.getUniformLocation(program, "projection");
    const u_viewport = gl.getUniformLocation(program, "viewport");
    const u_focal = gl.getUniformLocation(program, "focal");
    const u_view = gl.getUniformLocation(program, "view");

    // quad geometry
    const quad = new Float32Array([-2, -2, 2, -2, 2, 2, -2, 2]);
    const vertexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const a_position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    // texture
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, "u_texture"), 0);

    // index buffer (instanced)
    const indexBuffer = gl.createBuffer()!;
    const a_index = gl.getAttribLocation(program, "index");
    gl.enableVertexAttribArray(a_index);
    gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
    gl.vertexAttribIPointer(a_index, 1, gl.INT, 0, 0);
    gl.vertexAttribDivisor(a_index, 1);

    // worker
    const workerBlob = new Blob([`(${createWorker.toString()})(self)`], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);
    URL.revokeObjectURL(workerUrl);

    // resize + projection (uses viewW/viewH)
    let projectionMatrix: number[] = [];
    let downsample = 1;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      viewW = Math.max(1, Math.floor(r.width));
      viewH = Math.max(1, Math.floor(r.height));

      updateFocalLengths();
      gl.uniform2fv(u_focal, new Float32Array([fx, fy]));

      projectionMatrix = getProjectionMatrix(fx, fy, viewW, viewH);
      gl.uniform2fv(u_viewport, new Float32Array([viewW, viewH]));

      gl.canvas.width = Math.round(viewW / downsample);
      gl.canvas.height = Math.round(viewH / downsample);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.uniformMatrix4fv(u_projection, false, projectionMatrix);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    // slider (t in 0..1)
    const onSlider = () => {
      targetT = (Number(slider.value) || 0) / 100;
    };
    slider.addEventListener("input", onSlider);
    onSlider();

    // wheel (same as your JS: step=0.01; update slider.value)
    const onWheel = (e: WheelEvent) => {
      // don't fight the slider
      if (e.target === slider || (e.target instanceof Node && slider.contains(e.target))) return;
      const dir = Math.sign(e.deltaY);
      const step = 0.05;
      targetT = clamp(targetT + dir * step, 0, 1);
      slider.value = String(targetT * 100);
    };
    wrap.addEventListener("wheel", onWheel, { passive: true });

    // pointer drag -> yawFrac/pitchFrac (key part of your JS)
    canvas.style.touchAction = "none";
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    canvas.addEventListener("contextmenu", onContextMenu);

    const onPointerDown = (ev: PointerEvent) => {
      canvas.setPointerCapture(ev.pointerId);
      if (ev.isPrimary) {
        dragging = true;
        px = ev.clientX;
        py = ev.clientY;
      }
    };
    const onPointerMove = (ev: PointerEvent) => {
      if (!dragging) return;
      if ((ev.buttons & 1) || (ev.pointerType === "touch" && ev.isPrimary)) {
        const dx = (ev.clientX - px) / viewW;
        const dy = (ev.clientY - py) / viewH;

        yawFrac = clamp(yawFrac + dx * ROTATE_SPEED, 0, 1);
        pitchFrac = clamp(pitchFrac - dy * ROTATE_SPEED, 0, 1);

        px = ev.clientX;
        py = ev.clientY;
      }
    };
    const onPointerUp = (ev: PointerEvent) => {
      if (ev.isPrimary) dragging = false;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    // worker -> upload texture + indices
    let vertexCount = 0;

    worker.onmessage = (e: MessageEvent) => {
      const data: any = e.data;

      if (data.texdata) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA32UI,
          data.texwidth,
          data.texheight,
          0,
          gl.RGBA_INTEGER,
          gl.UNSIGNED_INT,
          data.texdata,
        );

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
      } else if (data.depthIndex) {
        gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data.depthIndex, gl.DYNAMIC_DRAW);
        vertexCount = data.vertexCount || 0;
        setLoadedVerts(vertexCount);
        if (vertexCount > 0) setLoadingText("Rendering…");
      }
    };

    // 1) Load cameras -> build PATH (THIS is the “key difference”)
    const loadCameras = async () => {
      const r = await fetch(camerasUrl, { signal: abort.signal, credentials: "omit" });
      if (!r.ok) throw new Error(`${r.status} Unable to load cameras JSON: ${camerasUrl}`);
      const cams = await r.json();

      if (!Array.isArray(cams) || cams.length === 0) {
        throw new Error("Cameras JSON is empty or not an array.");
      }

      PATH = [];
      for (const cam of cams) {
        const R = cam.rotation as number[][]; // 3x3
        const t = cam.position as number[];   // [x,y,z]
        if (!R || !t) continue;

        const [yaw, pitch] = yawPitchFromRot3(R);

        // NOTE: your JS flips Y and Z for position to match handedness
        PATH.push({
          pos: [t[0], -t[1], -t[2]],
          yaw,
          pitch,
        });
      }

      if (PATH.length < 1) throw new Error("No valid camera entries found in cameras JSON.");
    };

    // 2) Load splat streaming -> send to worker
    const rowLength = 3 * 4 + 3 * 4 + 4 + 4;

    const loadSplat = async () => {
      setLoadingText("Loading splat…");

      const req = await fetch(splatUrl, { signal: abort.signal, credentials: "omit" });
      if (!req.ok) throw new Error(`${req.status} Unable to load splat: ${splatUrl}`);

      if (!req.body) {
        const buf = await req.arrayBuffer();
        worker.postMessage({ buffer: buf, vertexCount: Math.floor(buf.byteLength / rowLength) });
        return;
      }

      const reader = req.body.getReader();
      let splatData = new Uint8Array(1024 * 1024);
      let bytesRead = 0;
      let lastVertexCount = -1;

      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;

        if (bytesRead + value.length > splatData.length) {
          const nextSize = Math.max(splatData.length * 2, bytesRead + value.length);
          const bigger = new Uint8Array(nextSize);
          bigger.set(splatData);
          splatData = bigger;
        }

        splatData.set(value, bytesRead);
        bytesRead += value.length;

        if (vertexCount > lastVertexCount) {
          worker.postMessage({ buffer: splatData.buffer, vertexCount: Math.floor(bytesRead / rowLength) });
          lastVertexCount = vertexCount;
        }
      }

      worker.postMessage({ buffer: splatData.buffer, vertexCount: Math.floor(bytesRead / rowLength) });

      downsample = splatData.length / rowLength > 500000 ? 1 : 1 / window.devicePixelRatio;
      resize();
    };

    // 3) Render loop (PATH-driven yaw/pitch)
    let lastFrame = 0;
    let avgFps = 0;
    let lastFpsSet = 0;

    const jumpDelta = 0;

    const frame = (now: number) => {
      if (cancelled) return;

      const dt = (now - lastFrame) * 0.001;
      const k = 1.0 - Math.exp(-LERP_RATE * dt);

      currentT += (targetT - currentT) * k;

      if (PATH.length > 0) {
        const base = samplePath(PATH, currentT);

        const yaw = base.yaw + (yawFrac - 0.5) * YAW_RANGE;
        const pitch = base.pitch + (pitchFrac - 0.5) * PITCH_RANGE;

        const vm = makeViewMatrix(yaw, pitch, base.pos);
        if (vm) {
          let inv2 = invert4(vm);
          if (inv2) {
            inv2 = translate4(inv2, 0, -jumpDelta, 0);
            inv2 = rotate4(inv2, -0.1 * jumpDelta, 1, 0, 0);
            const actualViewMatrix = invert4(inv2) || vm;

            const viewProj = multiply4(projectionMatrix, actualViewMatrix);
            worker.postMessage({ view: viewProj });

            gl.clear(gl.COLOR_BUFFER_BIT);
            if (vertexCount > 0) {
              gl.uniformMatrix4fv(u_view, false, actualViewMatrix);
              gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, vertexCount);
            }
          }
        }
      } else {
        gl.clear(gl.COLOR_BUFFER_BIT);
      }

      const currentFps = 1000 / (now - lastFrame) || 0;
      avgFps = avgFps * 0.9 + currentFps * 0.1;
      if (now - lastFpsSet > 250) {
        setFps(Math.round(avgFps));
        lastFpsSet = now;
      }

      lastFrame = now;
      requestAnimationFrame(frame);
    };

    // boot sequence (cameras first, then splat, then animation)
    (async () => {
      try {
        await loadCameras();
        setLoadingText("Loading splat…");
        loadSplat().catch((e) => {
          if (!cancelled) setError(String((e as any)?.message || e));
        });
        requestAnimationFrame(frame);
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      }
    })();

    return () => {
      cancelled = true;
      abort.abort();

      ro.disconnect();

      slider.removeEventListener("input", onSlider);
      wrap.removeEventListener("wheel", onWheel);

      canvas.removeEventListener("contextmenu", onContextMenu);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);

      worker.terminate();
    };
  }, [splatUrl, camerasUrl]);

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative", width, height, background: "black" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

      {/* HUD */}
      <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10, pointerEvents: "none" }}>
        <div style={{ fontSize: 12, fontFamily: "monospace", padding: "4px 8px", borderRadius: 6, background: "rgba(0,0,0,0.6)", color: "white" }}>
          {fps} fps
        </div>
      </div>

      {/* Slider */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 8, padding: "0 12px", zIndex: 20, pointerEvents: "auto" }}>
        <input ref={sliderRef} type="range" min={0} max={100} defaultValue={0} style={{ width: "100%" }} />
      </div>

      {/* Loading / Error overlay */}
      {(error || loadedVerts === 0) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 10,
            background: "rgba(0,0,0,0.65)",
            color: "white",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: 12,
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          {error ? (
            <>
              <div style={{ color: "#ff6b6b", fontWeight: 700 }}>Error</div>
              <div style={{ maxWidth: 520, textAlign: "center", padding: "0 16px" }}>{error}</div>
            </>
          ) : (
            <>
              <div>{loadingText}</div>
              <div>verts: {loadedVerts.toLocaleString()}</div>
              <div style={{ opacity: 0.75, maxWidth: 520, textAlign: "center", padding: "0 16px" }}>
                This version uses <b>camerasUrl</b> to build a PATH and drive yaw/pitch along that camera track.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GaussianSplatViewerPath;
