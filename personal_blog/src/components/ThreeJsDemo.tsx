// modelPathonents/ThreeScene.js
"use client"
import { use, useEffect, useRef, useState, MutableRefObject } from 'react';
import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
//import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import GUI from 'lil-gui' ;
//import { Sky } from 'three/addons/objects/Sky.js';
import Version from '@/components/Version';
import axios from 'axios';
import Info from '@/components/Info';




interface threeProps {
  modelPath: string[];
  setModelPath: React.Dispatch<React.SetStateAction<string[]>>;
  // modelRef: MutableRefObject<string[]>;
}

const readVal = (name: string | undefined) => {
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

function easeInOutLerp(start: number, end: number, t: number): number {
  t = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  return start + (end - start) * t;
}



const ThreeScene:React.FC<threeProps> = ({modelPath, setModelPath}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  //const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const guiRef = useRef<GUI | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const expandedRef = useRef(false);
  const animationFrameIdRef = useRef<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const spinRef = useRef(false);
  const [spin, setSpin] = useState(false);
  const transitionDuration = 1;
  const transitionProgressRef = useRef(transitionDuration);
  const spinTransitionDuration = 1;
  const spinTransitionProgressRef = useRef(spinTransitionDuration);
  const versionRef = useRef(0);
  const [version, setVersion] = useState(0);
  const intersectRef = useRef<THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[]>([]);
  const downRef = useRef(false);
  const selectedRef = useRef<THREE.Mesh | null>(null);
  const [selected, setSelected] = useState<THREE.Mesh | null>(null);
  const reverseRef = useRef(false);
  const rotationRef = useRef<THREE.Euler | null>(null);

  const loadSTL = (path: string): Promise<THREE.BufferGeometry> => {
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

  const loadModel = async (version:number) => {
    console.log('loading model', version);
    // console.log('loading model', version);
    axios.get('/api/getFiles',{
      params: {
        folder: modelPath[version]
      }
    }
    ).then( async (response) => {
      const urls = response.data.filenames as string[];
      const stls = urls.map((str) => { return str.split('.com/')[1]});
      const groupname = `${version}`
      const group = new THREE.Group();
      group.name = groupname;
      let continueLoading = true;
      // console.log(stls);
      const loader: any = new STLLoader();
      for (let i = 0; i < stls.length; i++) {
        
        // loader.load(modelPath[version].split("public")[1] + '/' + stls[i], (geometry) => {
        //const geometry = await loadSTL(modelPath[version].split("public")[1] + '/' + stls[i]);
        const geometry = await loadSTL(urls[i]);
          if (sceneRef.current?.getObjectByName(stls[i]) !== undefined) {

            continueLoading = false;
            return
          }
          if (continueLoading)
          {
            const material = new THREE.MeshPhysicalMaterial({ color: 0xffffff });
            material.metalness = 1;
            material.roughness = 0.6;
            material.transparent = true;
            material.opacity = 0.3;
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
            const ofs = readVal(stls[i].split('(')[1]);
            const zofs = readVal(stls[i].split('(')[2]);
            if (!isNaN(r)){
              mesh.rotateZ(r * Math.PI / 180);
            }
            if (!isNaN(ry)){
              mesh.rotateY(ry * Math.PI / 180);
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
            // if (modelPath[version].indexOf('robotleg/1') >= 0){

            // //   mesh.material.transparent = false;
          
            //   guiRef.current?.add(mesh.position, 'y', -300, 300).name(`${stls[i].split("-")[0]}_y`).step(1);
            //   guiRef.current?.add(mesh.position, 'z', -300, 300).name(`${stls[i].split("-")[0]}_z`).step(1);
            //   guiRef.current?.add(mesh.position, 'x', -300, 300).name(`${stls[i].split("-")[0]}_x`).step(1);

            //   guiRef.current?.add(mesh.rotation, 'y', -Math.PI, Math.PI).name(`${stls[i].split("-")[0]}_ry`).step(0.1);
            //   guiRef.current?.add(mesh.rotation, 'z', -Math.PI, Math.PI).name(`${stls[i].split("-")[0]}_rz`).step(0.1);
            //   guiRef.current?.add(mesh.rotation, 'x', -Math.PI, Math.PI).name(`${stls[i].split("-")[0]}_rx`).step(0.1);
            // }
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
        // console.log('adding')
        sceneRef.current?.add(group);
        groupRef.current = group;
        group.rotateX(-Math.PI/2);
      }
    });
  }
  const removeModel = () => {
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
  const handleFocus = (event: MouseEvent) => {
    if(intersectRef.current.length > 0){
      if (cameraRef.current && groupRef.current){
        var distance = 100;
        const object = intersectRef.current[0].object as THREE.Mesh;
        // cameraRef.current.updateMatrixWorld();
        //   // Get the camera's direction
        // var direction = new THREE.Vector3(0,0,-200);
        // cameraRef.current.localToWorld(direction);
        //cameraRef.current.getWorldDirection(direction);
        
        // Calculate the new position of the object
        //var newPosition = cameraRef.current.getWorldPosition(new THREE.Vector3()).clone();
        //newPosition.add(direction.clone().multiplyScalar(distance));
        
        // Assuming you have an object that you want to position
        //object.position.set(200,-30,0);
        selectedRef.current = object;
        rotationRef.current = groupRef.current.rotation.clone();
        setSelected(object);
        intersectRef.current = [];
        setSpin(false);
        // if (groupRef.current){
        //   object.position.copy(groupRef.current.worldToLocal(new THREE.Vector3(200,-30,0)));
        // }

        
        // Make the object look at the camera
        // object.lookAt(cameraRef.current.position);
        
      }
    }
  }

  const handleBack = () =>{
    if (selectedRef.current && selected){
      setSelected(null);
    }
    reverseRef.current = true;
  }

  
  useEffect(() => {

    const obj_position = new THREE.Vector3(200,-30,0);

    window.addEventListener('click', handleFocus);
    if (!guiRef.current) guiRef.current = new GUI();
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;

    const gradientTexture = new THREE.TextureLoader().load('/3.jpg');
    gradientTexture.minFilter = THREE.NearestFilter;
    gradientTexture.magFilter = THREE.NearestFilter;
    gradientTexture.generateMipmaps = false;

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);
    function onWindowResize() {
      // Update camera aspect ratio and renderer size
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    //scene.add(light);
    const light_bottom = new THREE.DirectionalLight(0xffffff, 1);
    light_bottom.position.set(-5, -5, -5).normalize();

    const spotlight = new THREE.SpotLight(0xffffff, 400, 2000, Math.PI/2, 1, 1);
    spotlight.position.set(700, 300, 0);
    spotlight.lookAt(0,0,0);
    scene.add(spotlight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 9);
    scene.add(ambientLight);

    const spotlight2 = new THREE.SpotLight(0xffffff, 400, 2000, Math.PI/2, 1, 1);
    spotlight2.position.set(700, -300, 0);
    spotlight2.lookAt(0,0,0);
    scene.add(spotlight2);

    const spotlight3= new THREE.SpotLight(0xffffff, 200, 2000, Math.PI/2, 1, 1);
    spotlight3.position.set(0, 200, 0);
    spotlight3.lookAt(0,0,0);
    scene.add(spotlight3);

    const spotlight4= new THREE.SpotLight(0xffffff, 200, 2000, Math.PI/2, 1, 1);
    spotlight3.position.set(0, 0, 200);
    spotlight3.lookAt(0,0,0);
    scene.add(spotlight4);
    const spotlight5= new THREE.SpotLight(0xffffff, 200, 2000, Math.PI/2, 1, 1);
    spotlight3.position.set(0, 0, -200);
    spotlight3.lookAt(0,0,0);
    scene.add(spotlight5);

    // let sky = new Sky();
    // sky.scale.setScalar( 450000 );
    // scene.add( sky );
    // let sun = new THREE.Vector3();

    // const elevation = 0.8;
    // const azimuth = 180;
    // const turbidity = 12.3;
    // const rayleigh=1.964;
    // const mieCoefficient=0.006;
    // const mieDirectionalG = 0.52;
  
    // const phi = THREE.MathUtils.degToRad( 90 - elevation );
    // const theta = THREE.MathUtils.degToRad( azimuth );
    // sun.setFromSphericalCoords( 1, phi, theta );

    
    // sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    // sky.material.uniforms[ 'turbidity' ].value = turbidity;
    // sky.material.uniforms[ 'rayleigh' ].value = rayleigh;
    // sky.material.uniforms[ 'mieCoefficient' ].value = mieCoefficient;
    // sky.material.uniforms[ 'mieDirectionalG' ].value = mieDirectionalG;


    // guiRef.current?.add(sky.material.uniforms[ 'turbidity' ], 'value', 0.1, 20, 0.1).name('turbidity');
    // guiRef.current?.add(sky.material.uniforms[ 'rayleigh' ], 'value', 0.1, 4, 0.001).name('rayleigh');
    // guiRef.current?.add(sky.material.uniforms[ 'mieCoefficient' ], 'value', 0.0001, 0.1, 0.0001).name('mieCoefficient');
    // guiRef.current?.add(sky.material.uniforms[ 'mieDirectionalG' ], 'value', 0.1, 1, 0.001).name('mieDirectionalG');



    // const rgbeLoader = new RGBELoader();
    // rgbeLoader.load('/hilly_terrain_01_2k.hdr', (environmentMap)=>{
    //   environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    //   scene.background = environmentMap;
    //   scene.environment = environmentMap;
    // })
    const pointer = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const raycaster = new THREE.Raycaster();

    //const controls = new OrbitControls( camera, renderer.domElement );
    //controlsRef.current = controls;
    // Load STL file
    loadModel(version);
    console.log('scene num', scene.children);

    //   // Center the object
    //   geometry.center();
    // });

    camera.position.set(300,0,0);
    camera.lookAt(0,0,0);
    // controls.update();
    var prev = 0;
    var mouseX:number;
    var mouseY:number;
    const onMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      downRef.current = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    }
    const onMouseUp = (event: MouseEvent) => {
      event.preventDefault();
      downRef.current = false;
    }
    const onMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      if (downRef.current){
        const deltaX = (event.clientX - mouseX)/2;
        const deltaY =(event.clientY - mouseY)/2;
        mouseX = event.clientX;
        mouseY = event.clientY;
        rotateScene(deltaX, deltaY);
      }
    }
    const rotateScene = (deltaX:number, deltaY:number) => {
      if (groupRef.current && !isNaN(deltaX) && !isNaN(deltaY)){
        if (selectedRef.current){
          const zAxis = groupRef.current.worldToLocal(new THREE.Vector3(0, 0, 1)).clone();
          const yAxis = groupRef.current.worldToLocal(new THREE.Vector3(0, 1, 0)).clone();
          selectedRef.current.rotateOnWorldAxis(yAxis, deltaX/100);
          selectedRef.current.rotateOnWorldAxis(zAxis, -deltaY/100);


        }
        else{
          const zAxis = new THREE.Vector3(0, 0, 1);
          const yAxis = new THREE.Vector3(0, 1, 0);
          console.log('rotationg ', groupRef.current.rotation);
          groupRef.current.rotateOnWorldAxis(yAxis, deltaX/100);
          groupRef.current.rotateOnWorldAxis(zAxis, -deltaY/100);
          
        }
      }
    
  }
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('mousemove', onMouseMove);
  const axesHelper = new THREE.AxesHelper( 5 );
  scene.add( axesHelper );
    // Animation loop
    const animate = (time: number) => {
      // const internal = new THREE.Vector3(cursor.x * 2, cursor.y*2, 1.303)
      // const test2 = new THREE.Vector3(internal.x, internal.y,internal.z)
      // raycaster.setFromCamera(test2,camera)
      requestAnimationFrame(animate);
      //console.log(versionRef.current);
      
      transitionProgressRef.current += (time - prev)/1000;
      spinTransitionProgressRef.current += (time - prev)/3000;
      if (transitionProgressRef.current > transitionDuration){
        if (reverseRef.current && selectedRef.current && groupRef.current){
          groupRef.current.add(selectedRef.current);
          selectedRef.current = null;
          reverseRef.current = false;
        }
        // else if (!reverseRef.current && selectedRef.current && groupRef.current && rotationRef.current){
        //   groupRef.current.rotation.set(-Math.PI/2,0,0);
        // }
        transitionProgressRef.current = transitionDuration;
      }
      else{
        // if (reverseRef.current && groupRef.current && selectedRef.current && rotationRef.current){
        //   groupRef.current.rotation.copy(rotationRef.current);
        //   rotationRef.current = null;
        // }
      }
      if (spinTransitionProgressRef.current > spinTransitionDuration){
        spinTransitionProgressRef.current = spinTransitionDuration;
      }

      //console.log('transitionProgress', transitionProgressRef.current, 'transitionDuration', transitionDuration

      if (groupRef.current != null){
        if (true){
          //console.log( 'rotation angle ', groupRef.current.rotation)
          if (!downRef.current && !selectedRef.current){
            groupRef.current.rotateOnWorldAxis(new THREE.Vector3(0,1,0), 0.001);
          }
          for (let i = 0; i < groupRef.current.children.length; i++){
            const mesh = groupRef.current.children[i] as THREE.Mesh;
            if (selectedRef.current){
              console.log()
              if (mesh == selectedRef.current){
                (mesh.material as THREE.Material).transparent = false;
              }
              else{
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
            if (selectedRef.current ){
              if (mesh == selectedRef.current){
                //console.log("selected", selected, selectedRef.current);
                if (!reverseRef.current){
                  if (transitionDuration != transitionProgressRef.current){

                    const local_coords = groupRef.current.worldToLocal(new THREE.Vector3(180,20,0)).clone();
                    const lerp = easeInOutLerp(future_y, local_coords.y, transitionProgressRef.current / transitionDuration);
                    const lerp2 = easeInOutLerp(current_x, local_coords.x, transitionProgressRef.current / transitionDuration);
                    const lerp3 = easeInOutLerp(current_z, local_coords.z, transitionProgressRef.current / transitionDuration);

                    selectedRef.current.position.y = lerp;
                    selectedRef.current.position.x = lerp2;
                    selectedRef.current.position.z = lerp3;
                  }
                }
                else{
                  if (transitionDuration != transitionProgressRef.current){
                    const local_coords = groupRef.current.worldToLocal(new THREE.Vector3(180,20,0)).clone();
                    const lerp = easeInOutLerp(local_coords.y,future_y, transitionProgressRef.current / transitionDuration);
                    const lerp2 = easeInOutLerp( local_coords.x, current_x,transitionProgressRef.current / transitionDuration);
                    const lerp3 = easeInOutLerp(local_coords.z, current_z, transitionProgressRef.current / transitionDuration);

                    selectedRef.current.position.y = lerp;
                    selectedRef.current.position.x = lerp2;
                    selectedRef.current.position.z = lerp3;
                  }
                    if (!isNaN(r) && !isNaN(ry)){
                      mesh.rotation.set(0,ry * Math.PI / 180, r * Math.PI / 180);
                    }
                  }
                }
            }
            else {
              if (expandedRef.current){
                (mesh.material as THREE.Material).transparent = true;
                (mesh.material as THREE.Material).opacity = 0.5;
                if (transitionProgressRef.current != transitionDuration){
                  const lerp = easeInOutLerp(current_y, future_y, transitionProgressRef.current / transitionDuration);
                  
                  mesh.position.y = lerp;};
                }
                else{
                  (mesh.material as THREE.Material).transparent = true;
                  (mesh.material as THREE.Material).opacity = 0.5;
                  if (transitionProgressRef.current != transitionDuration){
                    const lerp = easeInOutLerp(future_y, current_y, transitionProgressRef.current / transitionDuration);
                    
                    mesh.position.y = lerp;
                }
              }
            } 
            
            if (spinRef.current){
              if (mesh.name.indexOf('sun') >= 0){
                if (spinTransitionProgressRef.current == spinTransitionDuration){
                  mesh.rotateY(0.06);
                }
                else{
                  const lerp = easeInOutLerp(0.0, 0.06, spinTransitionProgressRef.current / spinTransitionDuration);
                  mesh.rotateY(lerp);
                }
              }
              else if (mesh.name.indexOf('planet') >= 0){
                if (spinTransitionProgressRef.current == spinTransitionDuration){
                  mesh.rotateY(0.01);
                }
                else{
                  const lerp = easeInOutLerp(0.0, 0.01, spinTransitionProgressRef.current / spinTransitionDuration);
                  mesh.rotateY(lerp);
                }
              }
              else if (mesh.name.indexOf('rotor')>= 0){
                if (spinTransitionProgressRef.current == spinTransitionDuration){
                  mesh.rotateY(-0.06);
                }
                else{
                  const lerp = easeInOutLerp(0.0, -0.06, spinTransitionProgressRef.current / spinTransitionDuration);
                  mesh.rotateY(lerp);
                }
              }
              
            }
            else{
              if (mesh.name.indexOf('sun') >= 0){
                if (spinTransitionProgressRef.current != spinTransitionDuration){
                  const lerp = easeInOutLerp(0.06, 0.00, spinTransitionProgressRef.current / spinTransitionDuration);
                  mesh.rotateY(lerp);
                }
              }
              else if (mesh.name.indexOf('planet') >= 0){
                if (spinTransitionProgressRef.current != spinTransitionDuration){
  
                  const lerp = easeInOutLerp(0.01, 0.00, spinTransitionProgressRef.current / spinTransitionDuration);
                  mesh.rotateY(lerp);
                }
              }
              else if (mesh.name.indexOf('rotor')>= 0){
                if (spinTransitionProgressRef.current == spinTransitionDuration){
  
                  const lerp = easeInOutLerp(-0.06, 0.00, spinTransitionProgressRef.current / spinTransitionDuration);
                  mesh.rotateY(lerp);
                }
              }
            }
            
          }
        }
        if (expandedRef.current && !selectedRef.current && transitionProgressRef.current == transitionDuration && !downRef.current)
        {
          raycaster.setFromCamera( pointer, camera );
    
            // calculate objects intersecting the picking ray
          intersectRef.current = raycaster.intersectObjects( scene.children );
          if (intersectRef.current.length > 0){
            //console.log('intersects', intersects[0].object.name);
            ((intersectRef.current[ 0 ].object as THREE.Mesh).material as THREE.Material).transparent= false;
          }
        }
      }
      
      prev = time;
     

      	// required if controls.enableDamping or controls.autoRotate are set to true
	    //controls.update();
      renderer.render(scene, camera);
      
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      mountRef.current?.removeChild(renderer.domElement);
      window.removeEventListener('click', handleFocus);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);


    };
  }, []);

  useEffect(() => {
    if (groupRef.current){
      console.log('resetting');

      versionRef.current = 0;
      setVersion(0);
      setExpanded(false);
      expandedRef.current = false;
      removeModel();
      loadModel(0);
      selectedRef.current = null;
      setSelected(null);

    }
  },[modelPath]);

  useEffect(() => {
    console.log("i am being ran!");
    if (groupRef.current)
      {
        if (expanded != expandedRef.current){
          console.log('setting to zero')
          if (transitionProgressRef.current == transitionDuration){
            transitionProgressRef.current = 0;
          }
          else{
            transitionProgressRef.current = 1 - transitionProgressRef.current;
          }
          expandedRef.current = expanded;
        };
        
      }
    // if (!groupRef.current) return;
    // for (let i = 0; i < groupRef.current.children.length; i++){
    //   const mesh = groupRef.current.children[i] as THREE.Mesh;

    //   mesh.position.y = 1.5 * ((mesh.position.y/70 *20) + mesh.position.y)
      
    // };
    return () =>{

    }
  }, [expanded]);

  useEffect(()=>{
    if (groupRef.current){
      
      if (spinRef.current != spin){
        if (spinTransitionProgressRef.current == spinTransitionDuration){
          spinTransitionProgressRef.current = 0;
        }
        else{
          spinTransitionProgressRef.current = 1 - spinTransitionProgressRef.current;
        }
        spinRef.current = spin;
      }
    }

  },[spin])

  useEffect(() => {
    console.log('heyasda' , version);
    if (versionRef.current != version){
      console.log('trigger me');
      versionRef.current = version;
      removeModel();
      setExpanded(false);
      expandedRef.current = false;
      loadModel(version);
      selectedRef.current = null;
      setSelected(null);
    }
    
  }, [version]);

  useEffect(()=> {
    if (transitionDuration == transitionProgressRef.current){
      transitionProgressRef.current = 0;
    }
    else if (transitionDuration != transitionProgressRef.current){
      transitionProgressRef.current = 1 - transitionProgressRef.current;
    }
    // if (rotationRef != null){
    //   groupRef.current?.rotation.set(0,0,0);
    // }

  },[selected])


  return<>
    <div ref={mountRef}></div>
    <div className="fixed z-30 text-3xl flex flex-wrap place-items-center bottom-[20%] left-1/2 transform -translate-x-1/2 gap-4">
      
     { selected != null ? 
     (
      <>
        <button className="w-[14rem] h-[4rem] bg-[green] rounded-full"
        onClick={handleBack}>
          back
        </button>
      </>
     )
     :
     modelPath[0].indexOf('actuator') >= 0 ? 
      (
        <>
        <button className = "w-[14rem] h-[4rem] bg-[green] rounded-full"onClick={() => {
          if (selectedRef.current ==null)
          {setExpanded(!expanded)}}}
          >{expanded ? 'collapse' : 'expand'}</button>
          <button className = "w-[14rem] h-[4rem] bg-[green] rounded-full"onClick={() => {
            if (selectedRef.current == null)
              {
                setSpin(!spin)
              }
          }
            }>{spin ? 'stop' : 'run'}</button>
        </>
      ) : (
        <div></div>
      )}
    
    </div>
    {selected != null && <Info title={(selectedRef.current as THREE.Mesh).name}/>}
    {selected == null && <Version value={modelPath.length} sharedState={version} setSharedState={setVersion} sharedRef={versionRef}/>}

  </>;
};

export default ThreeScene;
