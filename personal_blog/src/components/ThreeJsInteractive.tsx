// src/utils/handleAnimation.ts

import * as THREE from 'three';
import {readVal} from './ThreeJsHelpers'

// Define the handleAnimation function

export function easeInOutLerp(start: number, end: number, t: number): number {
    t = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    return start + (end - start) * t;
  }
export interface HandleAnimationDependencies {
    groupRef: React.MutableRefObject<THREE.Group | null>;
    selectedRef: React.MutableRefObject<THREE.Mesh | null>;
    reverseRef: React.MutableRefObject<boolean>;
    expandedRef: React.MutableRefObject<boolean>;
    transitionDuration: number;
    transitionProgressRef: React.MutableRefObject<number>;
    mobileRef: React.RefObject<boolean>;
    spinRef: React.MutableRefObject<boolean>;
    spinTransitionProgressRef: React.MutableRefObject<number>;
    spinTransitionDuration: number;
    dataRef:  React.MutableRefObject<Record<string, any> | null>;
}

export const handleAnimation = (dependencies: HandleAnimationDependencies) => {
    const {
        groupRef,
        selectedRef,
        reverseRef,
        expandedRef,
        transitionDuration,
        transitionProgressRef,
        mobileRef,
        spinRef,
        spinTransitionProgressRef,
        spinTransitionDuration,
        dataRef,
    } = dependencies;
    // console.log("is selected ref ");

    if (!groupRef.current) return;
    // console.log("handle animation test", transitionDuration)
    // console.log("lets ssee ", groupRef.current.children.length)
    for (let i = 0; i < groupRef.current.children.length; i++) {
        const mesh = groupRef.current.children[i] as THREE.Mesh;
        if (selectedRef.current) {
            if (mesh === selectedRef.current) {
                (mesh.material as THREE.Material).transparent = false;
            } else {
                (mesh.material as THREE.Material).transparent = true;
                (mesh.material as THREE.Material).opacity = 0.0;
            }
        }
        const name = mesh.name;
        const future_y = readVal(name.split('_')[1]);
        const current_y = readVal(name.split('-')[2]);
        const current_x = readVal(name.split('-')[1]);
        const current_z = readVal(name.split('-')[3]);
        const r = readVal(name.split('-')[4]);
        const ry = readVal(name.split('-')[5]);
        var local_coords;

        if (selectedRef.current) {
            if (mesh === selectedRef.current) {
                if (!reverseRef.current) {
                    if (transitionDuration !== transitionProgressRef.current) {
                        local_coords = mobileRef.current
                            ? groupRef.current.worldToLocal(new THREE.Vector3(130, 50, 0)).clone()
                            : groupRef.current.worldToLocal(new THREE.Vector3(180, 20, 0)).clone();
                        const lerp = easeInOutLerp(future_y, local_coords.y, transitionProgressRef.current / transitionDuration);
                        const lerp2 = easeInOutLerp(current_x, local_coords.x, transitionProgressRef.current / transitionDuration);
                        const lerp3 = easeInOutLerp(current_z, local_coords.z, transitionProgressRef.current / transitionDuration);
                        selectedRef.current.position.set(lerp2, lerp, lerp3);
                    }
                } else {
                    if (transitionDuration !== transitionProgressRef.current) {
                        local_coords = mobileRef.current
                            ? groupRef.current.worldToLocal(new THREE.Vector3(130, 50, 0)).clone()
                            : groupRef.current.worldToLocal(new THREE.Vector3(180, 20, 0)).clone();
                        const lerp = easeInOutLerp(local_coords.y, future_y, transitionProgressRef.current / transitionDuration);
                        const lerp2 = easeInOutLerp(local_coords.x, current_x, transitionProgressRef.current / transitionDuration);
                        const lerp3 = easeInOutLerp(local_coords.z, current_z, transitionProgressRef.current / transitionDuration);
                        selectedRef.current.position.set(lerp2, lerp, lerp3);
                    }
                    if (!isNaN(r) && !isNaN(ry)) {
                        mesh.rotation.set(0, ry * Math.PI / 180, r * Math.PI / 180);
                    }
                }
            }
        } else {
            if (expandedRef.current) {
                // console.log('expanding ', transitionProgressRef.current);
                if (dataRef.current && dataRef.current.transparent){
                    (mesh.material as THREE.Material).transparent = dataRef.current.transparent;
                }
                else{
                    (mesh.material as THREE.Material).transparent = true;
                }
                if (dataRef.current && dataRef.current.opacity){
                    (mesh.material as THREE.Material).opacity = dataRef.current.opacity;
                }
                else{
                    (mesh.material as THREE.Material).opacity = 0.7;
                }
                if (transitionProgressRef.current !== transitionDuration) {
                    // console.log("future = ", future_y);
                    // console.log("current y = ", current_y);
                    const lerp = easeInOutLerp(current_y, future_y, transitionProgressRef.current / transitionDuration);
                    mesh.position.y = lerp;
                }
            } else {
                if (dataRef.current && dataRef.current.transparent){
                    (mesh.material as THREE.Material).transparent = dataRef.current.transparent;
                }
                else{
                    (mesh.material as THREE.Material).transparent = true;
                }
                if (dataRef.current && dataRef.current.opacity){
                    (mesh.material as THREE.Material).opacity = dataRef.current.opacity;
                }
                else{
                    (mesh.material as THREE.Material).opacity = 0.7;
                }
                if (transitionProgressRef.current !== transitionDuration) {
                    const lerp = easeInOutLerp(future_y, current_y, transitionProgressRef.current / transitionDuration);
                    mesh.position.y = lerp;
                }
            }
        }
        if (dataRef.current && dataRef.current.spin !== undefined)
        {
            if (spinRef.current) {
                Object.keys(dataRef.current.spin).forEach(key=>{
                    if (mesh.name.includes(key)) {
                        if (spinTransitionProgressRef.current === spinTransitionDuration) {
                            mesh.rotateY(dataRef.current!.spin[key]);
                        } else {
                            const lerp = easeInOutLerp(0.0, dataRef.current!.spin[key], spinTransitionProgressRef.current / spinTransitionDuration);
                            mesh.rotateY(lerp);
                        }
                    }
                })
            
            } else {
                Object.keys(dataRef.current.spin).forEach(key=>{
                    if (mesh.name.includes(key)){
                        if (spinTransitionProgressRef.current !== spinTransitionDuration) {
                            const lerp = easeInOutLerp(dataRef.current!.spin[key], 0.00, spinTransitionProgressRef.current / spinTransitionDuration);
                            mesh.rotateY(lerp);
                        }
                    }
                });
            }
        }
    }
};