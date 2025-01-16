'use client'
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import axios from 'axios';
import { CfnVolumeAttachment } from 'aws-cdk-lib/aws-ec2';



export const loadSTL = (path: string): Promise<THREE.BufferGeometry> => {
    return new Promise((resolve, reject) => {
      const loader:any = new STLLoader();
      loader.load(
        path,
        (geometry: THREE.BufferGeometry) => resolve(geometry),
        undefined,
        (error: any) => reject(error)
      );
    });
  };

type SetLoadingType = React.Dispatch<React.SetStateAction<boolean>>;

export interface LoadModelDependencies {
    setLoading:SetLoadingType
    modelPath: string[];
    debug: boolean;
    sceneRef: React.RefObject<THREE.Scene>;
    guiRef: React.RefObject<any>; // Replace 'any' with the actual type of GUI if available
    groupRef: React.MutableRefObject<THREE.Group | null>;
    setBasic: React.Dispatch<React.SetStateAction<any>>; // Replace 'any' with the actual type
    dataRef: React.MutableRefObject<Record<string, any> | null>;
    originalRotation: React.RefObject<THREE.Quaternion>;
    slightlyRotating: React.RefObject<THREE.Quaternion>;
  }

type SideString = 'FrontSide' | 'BackSide' | 'DoubleSide';
const getThreeSide = (side?: SideString): THREE.Side => {
    switch (side) {
      case 'FrontSide':
        return THREE.FrontSide;
      case 'BackSide':
        return THREE.BackSide;
      case 'DoubleSide':
        return THREE.DoubleSide;
      default:
        return THREE.FrontSide; // Default value
    }
  };
  
export const loadModel = async (version:number, dependencies:LoadModelDependencies) => {
    const {
        setLoading,
        modelPath,
        debug,
        sceneRef,
        guiRef,
        groupRef,
        setBasic,
        dataRef,
        originalRotation,
        slightlyRotating
      } = dependencies;
    

    console.log('loading model', version);
    // console.log('loading model', version);
    setLoading(true);
    axios.get('/api/getFiles',{
      params: {
        folder: modelPath[version],
        debug: debug
      }
    }
    ).then( async (response) => {
      var urls:string[] = [];
      var stls: string[] = [];
      var stls_urls:string[] = [];
      var data;
      if (debug){
        try{
            urls = (response.data.filenames as string[]).map(str => str.split('public')[1]);
            // console.log('urls', urls)
            stls_urls = urls.filter((name): name is string => name !== undefined && name.toLowerCase().endsWith('.stl'));
            stls = stls_urls.map(str => str.split('/').pop()) as string[];

            data = urls
                .filter((name): name is string => name !== undefined && name.toLowerCase().endsWith('data.json'));
            var jsonURL = data[0];
            // console.log(jsonURL);
            
            
            const jsonData = await axios.get(jsonURL);

            dataRef.current = jsonData.data;

            // console.log(Object.keys(dataRef.current?.spin));
            // console.log(dataRef.current?.)
        // console.log(stls);
        }
        catch(error) {
            console.log("error loading files ", error)
        }
      }
      else{
        try {
            urls = response.data.filenames as string[];
            // console.log(urls);
            stls_urls = urls.filter((name): name is string => name !== undefined && name.toLowerCase().endsWith('.stl'));
            stls = stls_urls
                .map(str => str.split('.com/')[1]);
            
            data = urls.filter((name): name is string => name !== undefined && name.toLowerCase().endsWith('data.json'));
            var jsonURL = data[0];            
            const jsonData = await axios.get(jsonURL);

            dataRef.current = jsonData.data;
            
            // console.log(stls);
        }
        catch(error){
            console.log("error loading files ", error)
        }
      }
    
      const groupname = `${version}`
      const group = new THREE.Group();
      group.name = groupname;
      let continueLoading = true;
      // console.log(stls);
      const loader: any = new STLLoader();
      console.log(stls.length, urls.length)
      for (let i = 0; i < stls.length; i++) {
        
        // loader.load(modelPath[version].split("public")[1] + '/' + stls[i], (geometry) => {
        //const geometry = await loadSTL(modelPath[version].split("public")[1] + '/' + stls[i]);
        const geometry = await loadSTL(stls_urls[i]);
      

          if (sceneRef.current?.getObjectByName(stls[i]) !== undefined) {

            continueLoading = false;
            return
          }
          if (continueLoading)
          {
            const material = new THREE.MeshPhysicalMaterial({ color: 0xffffff });
            if (dataRef.current) {
                const {
                    transparent,
                    opacity,
                    metalness,
                    roughness,
                    color,
                    emissive,
                    side,
                    // Add other destructured properties here
                } = dataRef.current;
        
                material.transparent = transparent;
                material.opacity = opacity;
        
                if (metalness !== undefined) material.metalness = metalness;
                if (roughness !== undefined) material.roughness = roughness;
                if (color !== undefined) material.color.set(color);
                if (emissive !== undefined) material.emissive.set(emissive);
                if (side !== undefined) material.side = getThreeSide(side);
                // Add other property assignments as needed
        
                material.needsUpdate = true;
            }
            else{
                material.transparent = true;
                material.opacity = 0.8;
            }
            const mesh = new THREE.Mesh(geometry, material);
            
            var x;
            var y;
            var z; 
            x = readVal(stls[i].split('-')[1]);
            y = readVal(stls[i].split('-')[2]);
            z = readVal(stls[i].split('-')[3]);
            // console.log('coords ', x, y, z)
            const r = readVal(stls[i].split('-')[4]);
            const ry = readVal(stls[i].split('-')[5]);
            const rx = readVal(stls[i].split('-')[6]);
            const ofs = readVal(stls[i].split('(')[1]);
            const zofs = readVal(stls[i].split('(')[2]);
            if (!isNaN(r)){
              mesh.rotateZ(r * Math.PI / 180);
            }
            if (!isNaN(ry)){
              mesh.rotateY(ry * Math.PI / 180);
            }
            if (!isNaN(rx)){
              mesh.rotateX(rx*Math.PI / 180);
            }
            
            mesh.position.set(x,y,z);
            mesh.name = stls[i];
            group.add(mesh);
            geometry.center();
            if (ofs != 0 || zofs != 0){
              const matrix = new THREE.Matrix4();
  
              // Example: Translate the geometry by (1, 2, 3)
              matrix.makeTranslation(ofs, 0, zofs);
              geometry.applyMatrix4(matrix);
            }
            // guiRef.current?.add(mesh.position, 'y', -200, 200).name(`${stls[i]}_y`).step(1);
            if (debug == true && urls[i].indexOf('garry') >=0){

            //   mesh.material.transparent = false;
              guiRef.current?.add(mesh.position, 'y', -100, 200).name(`${stls[i].split("-")[0]}_y`).step(1);
              guiRef.current?.add(mesh.position, 'z', -300, 300).name(`${stls[i].split("-")[0]}_z`).step(1);
              guiRef.current?.add(mesh.position, 'x', -100, 100).name(`${stls[i].split("-")[0]}_x`).step(1);

              guiRef.current?.add(mesh.rotation, 'y', -Math.PI, Math.PI).name(`${stls[i].split("-")[0]}_ry`).step(0.1);
              guiRef.current?.add(mesh.rotation, 'z', -Math.PI, Math.PI).name(`${stls[i].split("-")[0]}_rz`).step(0.1);
              guiRef.current?.add(mesh.rotation, 'x', -Math.PI, Math.PI).name(`${stls[i].split("-")[0]}_rx`).step(0.1);
            }
            // else if (modelPath[i].indexOf('ring_gear') >= 0){
            //   mesh.material.transparent = false;
            // }
            // else if (modelPath[i].indexOf('sun_spiral') >= 0){
            //   mesh.material.transparent = false;
            // }
            //console.log(sceneRef.current?.children);
            // }
          }
        // });
      };
      if (continueLoading)
      {
        if (groupRef.current != null){
          removeModel(groupRef, sceneRef);
        }

        // console.log('adding')
        sceneRef.current?.add(group);
        groupRef.current = group;
        group.rotateX(-Math.PI/2);
        originalRotation.current!.copy(groupRef.current!.quaternion);
        slightlyRotating.current!.copy(groupRef.current!.quaternion);
      }
      setLoading(false);
    });

    // axios.get('/api/getDescription',{
    //   params: {
    //     name: modelPath[version].split('/')[2] + modelPath[version].split('/')[3] + ".json",
    //   }
    // }
    // ).then( (response) => {
    //   setBasic(response.data.filenames);
    // })
  }


export const removeModel = (groupRef:React.MutableRefObject<THREE.Group | null>, sceneRef:React.RefObject<THREE.Scene> ) => {
    if (groupRef.current) {
    //console.log('tryihng to remove');
    //console.log('scene', sceneRef.current.children);
    for (let i = 0; i < groupRef.current.children.length; i++){
        const mesh = groupRef.current.children[i] as THREE.Mesh;
        
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
        } else {
        mesh.material.dispose();
        }
        sceneRef.current?.remove(mesh);
        console.log('removed');
    }
    sceneRef.current?.remove(groupRef.current);
    groupRef.current = null;
    }
}

export const readVal = (name: string | undefined) => {
    if (name === undefined){
      return 0;
    }
    if (!isNaN(parseInt(name))){
      return parseInt(name);
    }
    if (name[0] == 'n'){
      return -parseInt(name.split('n')[1]);
    }
    else return 0;
  }