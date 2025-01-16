// modelPathonents/ThreeScene.js
"use client"
import { use, useEffect, useRef, useState, MutableRefObject, RefObject } from 'react';
import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
//import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import GUI from 'lil-gui' ;
//import { Sky } from 'three/addons/objects/Sky.js';
import Version from '@/components/Version';
import axios from 'axios';
import Info from '@/components/Info';
import Loading from './Loading';
import InfoTest from './InfoTest';
import LearnMore from './LearnMore';
import Title from './Title';
import Image from 'next/image';
import BasicFacts from './BasicFacts';
import Test from './Test';
import {loadSTL, loadModel, LoadModelDependencies, removeModel, readVal} from './ThreeJsHelpers'
import { easeInOutLerp, handleAnimation, HandleAnimationDependencies} from './ThreeJsInteractive';


interface threeProps {
  modelPath: string[];
  setModelPath: React.Dispatch<React.SetStateAction<string[]>>;
  debug: boolean;
  mobileRef: RefObject<boolean>;
  models: string[];
  // modelRef: MutableRefObject<string[]>;
}







const ThreeScene:React.FC<threeProps> = ({models, modelPath, setModelPath, debug=false, mobileRef}) => {
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
  const learnmoreTransitionDuration = 0.5;
  const learnmoreTransitionProgressRef = useRef(learnmoreTransitionDuration);
  const versionRef = useRef(0);
  const [intersect, setIntersect] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const intersectRef = useRef<THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[]>([]);
  const downRef = useRef(false);
  const selectedRef = useRef<THREE.Mesh | null>(null);
  const [selected, setSelected] = useState<THREE.Mesh | null>(null);
  const reverseRef = useRef(false);
  const rotationRef = useRef<THREE.Euler | null>(null);
  const modelPathRef = useRef<string[] | null>(modelPath);
  const [isLoading,setLoading] = useState(false);
  const [learnMore, setLearnMore] = useState(false);
  const learnMoreRef = useRef(false);
  const originalRotationRef = useRef<THREE.Vector3 | null>(null);
  const [basic, setBasic] = useState({});
  const labelRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<[{x:number, y:number, name:string}] | null>(null);
  const passive_rotationRef = useRef(true);
  const [passiveRotation, setPassiveRotation] = useState(true);
  const [unMount, setUnMount] = useState(true);
  const iconRef = useRef<HTMLImageElement>(null);

  const originalRotation = useRef(new THREE.Quaternion());
  const slightlyRotating = useRef(new THREE.Quaternion());
  const dataRef = useRef<Record<string, any> | null>(null);
  const storyRef = useRef(false);
  const [storyState, setStoryState] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollMulti = 1.0;
  const initialCamera = new THREE.Vector3(300, 0 ,0);

  const handleIconClick = () => {
      
      setPassiveRotation(!passiveRotation);
      
  };
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
        setUnMount(false);
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
  const handleScroll = () => {

  }

  const handleBack = () =>{
    if (selectedRef.current && selected){
      setUnMount(true);
    }
    reverseRef.current = true;
    if (learnMore){
      setLearnMore(false);
    }
  }
  const cameraTarget = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  useEffect(() => {

    const obj_position = new THREE.Vector3(200,-30,0);

    window.addEventListener('click', handleFocus);
    if (!guiRef.current && debug==true) {
      guiRef.current = new GUI();
      
    }
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    // cameraRef.current.lookAt(cameraTarget.current.x, cameraTarget.current.y, cameraTarget.current.z);


    if (debug){

      guiRef.current?.add(camera.position, 'y', -300, 300).name(`camera_y`).step(1);
      guiRef.current?.add(camera.position, 'z', -300, 300).name(`camera_z`).step(1);
      guiRef.current?.add(camera.position, 'x', -300, 300).name(`camera_x`).step(1);

      guiRef.current?.add(cameraTarget.current, 'x', -200, 200).name('LookAt X');
      guiRef.current?.add(cameraTarget.current, 'y', -200,200).name('LookAt Y');
      guiRef.current?.add(cameraTarget.current, 'z', -200, 200).name('LookAt Z');
    }

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

    const spotlight3= new THREE.SpotLight(0xffffff, 400, 2000, Math.PI/2, 1, 1);
    spotlight3.position.set(0, 300, 0);
    spotlight3.lookAt(0,0,0);
    scene.add(spotlight3);

    const spotlight4= new THREE.SpotLight(0xffffff, 400, 2000, Math.PI/2, 1, 1);
    spotlight4.position.set(-166, 100, 300);
    spotlight4.lookAt(0,0,0);
    scene.add(spotlight4);
    const spotlight5= new THREE.SpotLight(0xffffff, 400, 2000, Math.PI/2, 1, 1);
    spotlight5.position.set(0, 0, -200);
    spotlight5.lookAt(0,0,0);
    scene.add(spotlight5);

    const pointer = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    // if (!debug){
      window.addEventListener('mousemove', handleMouseMove);
    // }


    const raycaster = new THREE.Raycaster();

    //const controls = new OrbitControls( camera, renderer.domElement );
    //controlsRef.current = controls;
    // Load STL file
    var loadmodeldepend: LoadModelDependencies = {
      setLoading: setLoading,
      modelPath: modelPath,
      debug: debug,
      sceneRef: sceneRef,
      guiRef: guiRef,
      groupRef: groupRef, 
      setBasic: setBasic,
      dataRef: dataRef,
      originalRotation: originalRotation,
      slightlyRotating: slightlyRotating
    }
    loadModel(version, loadmodeldepend);
    // originalRotation.current.copy(groupRef.current!.quaternion);

    console.log('scene num', scene.children);
    //   // Center the object
    //   geometry.center();
    // });
    camera.position.copy(initialCamera);
    camera.lookAt(0,0,0);
    //controls.update();
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
      if (downRef.current && !learnMoreRef.current){
        const deltaX = (event.clientX - mouseX)/2;
        const deltaY =(event.clientY - mouseY)/2;
        mouseX = event.clientX;
        mouseY = event.clientY;
        rotateScene(deltaX, deltaY);
      }
    }

    const rotateScene = (deltaX:number, deltaY:number) => {
      if (groupRef.current && !isNaN(deltaX) && !isNaN(deltaY) && !storyRef.current){
        if (modelPathRef.current && modelPathRef.current[0].indexOf('testingjig') >= 0){
          const yAxis = new THREE.Vector3(0, 1, 0);
          const zAxis = new THREE.Vector3(0, 0, 1);
          groupRef.current.rotateOnWorldAxis(yAxis, deltaX/100);
          groupRef.current.position.set(0,-mouseY/10 + 50,0);
          // for (let i = 0; i < groupRef.current.children.length; i++){
          //   if (groupRef.current.children[i].name.indexOf("stand") < 0){
          //     (groupRef.current.children[i] as THREE.Mesh).translateOnAxis(zAxis, -deltaY);
          //   }
          // }
        }
        else if (selectedRef.current){
          const zAxis = groupRef.current.worldToLocal(new THREE.Vector3(0, 0, 1)).clone();
          const yAxis = groupRef.current.worldToLocal(new THREE.Vector3(0, 1, 0)).clone();
          selectedRef.current.rotateOnWorldAxis(yAxis, deltaX/100);
          selectedRef.current.rotateOnWorldAxis(zAxis, -deltaY/100);
        }
        else{
          const zAxis = new THREE.Vector3(0, 0, 1);
          const yAxis = new THREE.Vector3(0, 1, 0);
          // console.log('rotationg ', groupRef.current.rotation);
          groupRef.current.rotateOnWorldAxis(yAxis, deltaX/100);
          groupRef.current.rotateOnWorldAxis(zAxis, -deltaY/100);
          
        }
      }
    
  }
  window.addEventListener('scroll', handleScroll);

  // if (!debug){
    
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
  // }

    const currentLookAt = new THREE.Vector3();

    // Animation loop
    const animate = (time: number) => {
      // const internal = new THREE.Vector3(cursor.x * 2, cursor.y*2, 1.303)
      // const test2 = new THREE.Vector3(internal.x, internal.y,internal.z)
      // raycaster.setFromCamera(test2,camera)
      requestAnimationFrame(animate);
      //making sure when the user fiddles with an object, it returns to the upright position
      if (groupRef.current && storyRef.current){
        groupRef.current.quaternion.slerp(originalRotation.current, 0.02);
      }
      else if (groupRef.current && !downRef.current) {
        groupRef.current.quaternion.slerp(slightlyRotating.current, 0.02);
      }
      //this is for making sure the camera is stays at its original position when storymode is off
      if (!storyRef.current){
        if (cameraRef.current) cameraRef.current.position.lerp(initialCamera, 0.03);
      }
      cameraRef.current?.lookAt(cameraTarget.current.x, cameraTarget.current.y, cameraTarget.current.z);
      //console.log(versionRef.current);
      if (storyRef.current && dataRef.current && dataRef.current.camera_positions && dataRef.current.camera_positions.length >=2){
        const cameraPositions = dataRef.current.camera_positions;
        const numTransitions = cameraPositions.length - 1;

        const scrollElement = scrollRef.current;
        if (scrollElement) {
          const scrollTop = scrollElement.scrollTop;
          const viewportHeight = window.innerHeight * scrollMulti;
          const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;

          // Calculate how many full 100vh segments fit into the current scrollHeight
          const availableTransitions = numTransitions
          // console.log('avaialbe ', availableTransitions);

          // Total scroll range dedicated to transitions
          const totalTransitionScroll = availableTransitions *viewportHeight;

          // Current scroll position within the transition range
          const currentScroll = Math.min(scrollTop, totalTransitionScroll);

          // Determine the current transition segment
          const currentSegment = Math.floor(currentScroll / viewportHeight);
          // Local interpolation factor within the current segment
          const t = (currentScroll % viewportHeight) / viewportHeight;

          if (currentSegment < availableTransitions) {
            const currentPos = cameraPositions[currentSegment];
            const nextPos = cameraPositions[currentSegment + 1];

            // Create Vector3 instances for start and end positions
            const startPos = new THREE.Vector3(
              currentPos.position[0],
              currentPos.position[1],
              currentPos.position[2]
            );
            const endPos = new THREE.Vector3(
              nextPos.position[0],
              nextPos.position[1],
              nextPos.position[2]
            );

            // Create Vector3 instances for start and end lookAt positions
            const startLookAt = new THREE.Vector3(
              currentPos.lookAt[0],
              currentPos.lookAt[1],
              currentPos.lookAt[2]
            );
            const endLookAt = new THREE.Vector3(
              nextPos.lookAt[0],
              nextPos.lookAt[1],
              nextPos.lookAt[2]
            );

            // Apply easing to t if desired (optional)
            // Example using a simple ease-in-out function
            const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

            // Interpolate camera position
            camera.position.lerpVectors(startPos, endPos, easedT);

            // Interpolate lookAt target
            currentLookAt.lerpVectors(startLookAt, endLookAt, easedT);
            camera.lookAt(currentLookAt);
          }
        }
      }
      
      transitionProgressRef.current += (time - prev)/1000;
      spinTransitionProgressRef.current += (time - prev)/3000;
      learnmoreTransitionProgressRef.current += (time - prev)/3000;
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
      if (learnmoreTransitionProgressRef.current > learnmoreTransitionDuration){
        learnmoreTransitionProgressRef.current = learnmoreTransitionDuration;
      }

      if (groupRef.current != null){
        if (true){
          //console.log( 'rotation angle ', groupRef.current.rotation)
          if (!downRef.current && !selectedRef.current && !storyRef.current){
            if (passive_rotationRef.current && !learnMoreRef.current){
              const rotationIncrement = new THREE.Quaternion();
              rotationIncrement.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.001); // small rotation around the Y-axis

              // Apply this small rotation to the originalRotation quaternion
              slightlyRotating.current.multiplyQuaternions(rotationIncrement, slightlyRotating.current);
            }
          }
          if (learnMoreRef.current && originalRotationRef.current &&learnmoreTransitionProgressRef.current != learnmoreTransitionDuration ){

            const lerp = easeInOutLerp(originalRotationRef.current.y,0, learnmoreTransitionProgressRef.current / learnmoreTransitionDuration);
            const lerp2 = easeInOutLerp( originalRotationRef.current.x, -Math.PI / 2,learnmoreTransitionProgressRef.current / learnmoreTransitionDuration);
            const lerp3 = easeInOutLerp(originalRotationRef.current.z, 0, learnmoreTransitionProgressRef.current / learnmoreTransitionDuration);

            groupRef.current.rotation.set(lerp2,lerp,lerp3);
          }

          var depends: HandleAnimationDependencies = {
            groupRef: groupRef, 
            selectedRef: selectedRef,
            reverseRef: reverseRef,
            expandedRef: expandedRef,
            transitionDuration: transitionDuration,
            transitionProgressRef: transitionProgressRef,
            mobileRef: mobileRef,
            spinRef: spinRef,
            spinTransitionProgressRef: spinTransitionProgressRef,
            spinTransitionDuration: spinTransitionDuration,
            dataRef: dataRef,
      };
        handleAnimation(depends);
        }
        if (expandedRef.current && !selectedRef.current && transitionProgressRef.current == transitionDuration && !downRef.current && !learnMoreRef.current)
        {
          raycaster.setFromCamera( pointer, camera );
    
            // calculate objects intersecting the picking ray
          intersectRef.current = raycaster.intersectObjects( scene.children );
          if (intersectRef.current.length > 0){
            //console.log('intersects', intersects[0].object.name);
            ((intersectRef.current[ 0 ].object as THREE.Mesh).material as THREE.Material).transparent= false;
            setIntersect(intersectRef.current[0].object.name.split('-')[0].split('/')[intersectRef.current[0].object.name.split('-')[0].split('/').length-1]);
            if (labelRef.current){
              var location = new THREE.Vector3();
              (intersectRef.current[0].object as THREE.Mesh).getWorldPosition(location);
              if (cameraRef.current){
                const ndc = location.project(cameraRef.current);
                const x = ((ndc.x + 1) / (2)) * 100;
                const y = ((-ndc.y + 1) / (2)) * 100;
                labelRef.current.style.transform = `translateX(${x}vw) translateY(${y}vh)`;
              }              
    
            }
          }
          else{
            setIntersect(null);
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
      window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('mousemove', onMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
      window.removeEventListener('click', handleFocus);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  useEffect(() => {
    if (groupRef.current){
      versionRef.current = 0;
      setVersion(0);
      setExpanded(false);
      expandedRef.current = false;
      removeModel(groupRef, sceneRef);
      var loadmodeldepend: LoadModelDependencies = {
        setLoading: setLoading,
        modelPath: modelPath,
        debug: debug,
        sceneRef: sceneRef,
        guiRef: guiRef,
        groupRef: groupRef, 
        setBasic: setBasic,
        dataRef: dataRef,
        originalRotation: originalRotation,
        slightlyRotating: slightlyRotating
      }
      loadModel(0, loadmodeldepend);
      selectedRef.current = null;
      setUnMount(true);
      modelPathRef.current = modelPath;

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
    const rotateScene = (deltaX:number, deltaY:number) => {
      if (groupRef.current && !isNaN(deltaX) && !isNaN(deltaY)){
        if (modelPathRef.current && modelPathRef.current[0].indexOf('testingjig') >= 0){
          const yAxis = new THREE.Vector3(0, 1, 0);
          const zAxis = new THREE.Vector3(0, 0, 1);

          groupRef.current.rotateOnWorldAxis(yAxis, deltaX/100);
          groupRef.current.position.set(0,-mouseY/10 + 50,0);
          // for (let i = 0; i < groupRef.current.children.length; i++){
          //   if (groupRef.current.children[i].name.indexOf("stand") < 0){
          //     (groupRef.current.children[i] as THREE.Mesh).translateOnAxis(zAxis, -deltaY);
          //   }
          // }

        }
        else if (selectedRef.current){
          const zAxis = groupRef.current.worldToLocal(new THREE.Vector3(0, 0, 1)).clone();
          const yAxis = groupRef.current.worldToLocal(new THREE.Vector3(0, 1, 0)).clone();
          selectedRef.current.rotateOnWorldAxis(yAxis, deltaX/100);
          selectedRef.current.rotateOnWorldAxis(zAxis, -deltaY/100);
        }
        else{
          const zAxis = new THREE.Vector3(0, 0, 1);
          const yAxis = new THREE.Vector3(0, 1, 0);
          // console.log('rotationg ', groupRef.current.rotation);
          groupRef.current.rotateOnWorldAxis(yAxis, deltaX/100);
          groupRef.current.rotateOnWorldAxis(zAxis, -deltaY/100);
          
        }
      }
    
  }
    const onTouchStart = (event: TouchEvent) => {
      downRef.current = true;
      console.log("touchstart");
      if (event.touches.length > 0) {
          const touch = event.touches[0];
          mouseX = touch.clientX;
          mouseY = touch.clientY;
      }
  };

  const onTouchEnd = (event: TouchEvent) => {
      downRef.current = false;
  };

  const onTouchMove = (event: TouchEvent) => {
      if (downRef.current && event.touches.length > 0) {
          const touch = event.touches[0];
          const deltaX = (touch.clientX - mouseX) / 2;
          const deltaY = (touch.clientY - mouseY) / 2;
          mouseX = touch.clientX;
          mouseY = touch.clientY;
          rotateScene(deltaX, deltaY);
      }
  };

    if (mobileRef){
      var mouseX:number;
      var mouseY:number;
        
      const options = { passive: false } as AddEventListenerOptions;
      if (mountRef.current){

        mountRef.current.addEventListener('touchstart', onTouchStart,options);
        mountRef.current.addEventListener('touchmove',onTouchMove,options);
        mountRef.current.addEventListener('touchend', onTouchEnd,options);
      }
    }
    

    return ()=>{
      if (mobileRef){
        const options = { passive: false } as AddEventListenerOptions;
        if (mountRef.current){
          mountRef.current.removeEventListener('touchstart', onTouchStart, options);
          mountRef.current.removeEventListener('touchmove',onTouchMove,options);
          mountRef.current.removeEventListener('touchend', onTouchEnd, options);
        }
      }
      
    }
  }, [mountRef.current])

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

  useEffect(()=>{
    if (transitionDuration == transitionProgressRef.current){
      transitionProgressRef.current = 0;
    }
    else if (transitionDuration != transitionProgressRef.current){
      transitionProgressRef.current = 1 - transitionProgressRef.current;
    }
    if (unMount){
    setTimeout(()=> {
      setSelected(null);
    }, 1000)}
  },[unMount])

  useEffect(() => {
    if (versionRef.current != version){
      versionRef.current = version;
      removeModel(groupRef, sceneRef);
      setExpanded(false);
      expandedRef.current = false;
      var loadmodeldepend: LoadModelDependencies = {
        setLoading: setLoading,
        modelPath: modelPath,
        debug: debug,
        sceneRef: sceneRef,
        guiRef: guiRef,
        groupRef: groupRef, 
        setBasic: setBasic,
        dataRef: dataRef,
        originalRotation: originalRotation,
        slightlyRotating: slightlyRotating
      }
      loadModel(version, loadmodeldepend);
      selectedRef.current = null;
      setUnMount(true);
    }
  }, [version]);

  useEffect(()=> {
    // if (rotationRef != null){
    //   groupRef.current?.rotation.set(0,0,0);
    // }

  },[selected])

  useEffect(()=>{
    learnMoreRef.current = learnMore;
    if (learnMore && groupRef.current){
      setExpanded(true);
      learnmoreTransitionProgressRef.current = 0;
      const quaternion = new THREE.Quaternion();
      // Get the world matrix
      const worldMatrix = groupRef.current.matrixWorld;

      // Decompose the world matrix to extract rotation
      worldMatrix.decompose(new THREE.Vector3(), quaternion, new THREE.Vector3());

      // If you need to convert the quaternion to Euler angles
      const euler = new THREE.Euler();
      euler.setFromQuaternion(quaternion, 'XYZ'); // or any other order you prefer

      // Now you have the rotation in Euler angles
      console.log('Rotation in radians: ', euler.x, euler.y, euler.z);

      originalRotationRef.current = new THREE.Vector3(euler.x, euler.y, euler.z);
      var lis: [{x:number, y:number, name:string}]  = [{x:0, y:0, name:'test'}];
      for (let i = 0; i < groupRef.current.children.length; i++){
        const mesh = groupRef.current.children[i] as THREE.Mesh;
        const name = mesh.name;
        const y = readVal(name.split('_')[1]);
        const x = readVal(name.split('-')[1]);
        const z = readVal(name.split('-')[3]);
        const coords = new THREE.Vector3(x,y,z);

        if (cameraRef.current){
          const ndc = coords.project(cameraRef.current);

          const width = window.innerWidth;
          const height = window.innerHeight;

          const screenCoordinates = {
            x: ((ndc.y/cameraRef.current.aspect + 1) / (2)) * 100,
            y: ((ndc.x * cameraRef.current.aspect + 1) / (2)) * 100,
            name: mesh.name.split("/")[mesh.name.split("/").length - 1].split("-")[0],
          };
          console.log('aspect ', cameraRef.current.aspect);
          lis.push(screenCoordinates);
        }

      }
      coordsRef.current = lis;
      
    
    }
    else if (!learnMore){
      originalRotationRef.current = null;
      setExpanded(false);
    }
  }, [learnMore])

  useEffect(()=>{
    passive_rotationRef.current = passiveRotation;
    console.log('rotate', passive_rotationRef.current);
  },[passiveRotation])


  return<>
     <div
        ref={mountRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          touchAction: 'none',
          zIndex: -1, // Ensure it's behind other elements
        }}
      ></div>
    {storyState ? (
      <div
        ref={scrollRef}
        className="fixed top-0 left-0 w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth z-10 hide-scrollbar"
        onScroll={(event) => {
          console.log((event.target as any).scrollTop);
          // scrollRef.current = event.target.scrollTop;
        }}
      >
        {
        dataRef.current?.camera_positions ? dataRef.current?.camera_positions.map((item:any, index: number) => (
          <section
            key={index} // Ensure each section has a unique key
            style={{ height: `${scrollMulti * 100}vh` }}
            className="snap-start flex items-center justify-center"
          >
            {/* Content for each section */}
            <h1 className="text-white text-4xl">Section {index + 1}</h1>
          </section>
        )): null
      }
        
      </div>
) : null}

    <div style={{touchAction: "none"}} className="fixed z-30 text-3xl flex flex-wrap place-items-center bottom-[20%] left-1/2 transform -translate-x-1/2 gap-4 text-white">
      {
        selected != null || learnMore ?
        <button className={`w-[14rem] h-[4rem] bg-[green] rounded-full ${mobileRef.current ? 'absolute left-1/2 transform -translate-x-1/2 bottom-[-10vh]' : ''}`}
        onClick={handleBack}>
          back
        </button>
        :
        <div></div>
      }
    </div>

    {/* {selected == null && !mobileRef.current && <BasicFacts
    data = {basic}
    />} */}
    <div className = "fixed top-0 left-0 w-full h-[20%] flex flex-col items-center justify-center">
        <div className="text-titlexl lg:text-title_large">{modelPath[0].split('/')[2]}</div>
       {
        <div className={`relative flex items-center gap-3 justify-center duration-1000 ${
        storyState ? 'opacity-0 pointer-events-none':'opacity-100'}`}>
          <div className={`w-[60px] h-[60px] flex items-center justify-center`}>
            {selected == null && (passiveRotation ?
            <Image onClick = {handleIconClick} src={"/icons/stationary.svg"} alt={"stop rotating"} 
            width={40}
            height={40}
            className="cursor-pointer"/>
            : 
            <Image onClick = {handleIconClick} src={"/icons/rotate.svg"} alt={"rotate"} 
            width={60}
            height={60}
            className="cursor-pointer"/>)
            }
          </div>
          {
            // modelPath[0].indexOf('actuator') >= 0 ? 
            dataRef.current?.expand !== undefined && dataRef.current.expand ?
            <>
            <div className="w-[60px] h-[60px] flex items-center justify-center">
          {
            selected == null && (expanded ?
            <Image onClick = {()=>{
              if (selectedRef.current ==null)
                {setExpanded(!expanded)}
            }} src={"/icons/collapse.svg"} alt={"collapse"} 
            width={40}
            height={40}
            className="cursor-pointer"/>
            :
            <Image onClick = {()=>{
              if (selectedRef.current ==null)
                {setExpanded(!expanded)}
            }} src={"/icons/expand.svg"} alt={"expand"} 
            width={40}
            height={40}
            className="cursor-pointer"/>)
          }
          </div>
          <div className="w-[60px] h-[60px] flex items-center justify-center">
            {spin ? <div className="cursor-pointer" onClick = {()=>{setSpin(false)}}> Stop Rotate</div> : <div className="cursor-pointer" onClick = {()=>{setSpin(true)}}> Rotate</div>}
            </div>
          </>
          :
          null

          }
          
        </div>}
        
    </div>
    {/* {learnMore && coordsRef.current && <Test coords = {coordsRef.current}/>} */}
    {dataRef.current?.camera_positions ? storyState ? 
    <div className = "absolute text-titlexl lg:text-title_large bottom-5 right-5 cursor-pointer z-40" onClick = {() => {setStoryState(false); storyRef.current = false;}}>Exit</div> :
    <div className = "absolute text-titlexl lg:text-title_large bottom-5 right-5 cursor-pointer" onClick = {() => {setStoryState(true); storyRef.current = true;}}>Discover</div> : null
    }
    {
      <div
        ref = {labelRef}
        className = {`pointer-events-none absolute rounded-lg width-[20%] height-[20%] p-1 bg-[#ffffff70] text-black top-0 left-0 transition-opacity duration-500 ease-in-out ${intersect && selected == null ? 'opacity-100' : 'opacity-0'}`}
        >{intersect}</div>}
    {selected != null && <Info title={selected.name} mobileRef={mobileRef} unMount= {unMount}/>}
    {/* <Info title={'test'} mobileRef={mobileRef}/> */}
    {selected == null && !storyState && <Version value={modelPath.length} sharedState={version} setSharedState={setVersion} sharedRef={versionRef}/>}
    {isLoading && <Loading/>}
  </>;
};

export default ThreeScene;
