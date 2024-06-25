// app/MatterJsDemo.js
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Matter, { Engine, Render, World, Bodies,Body,Mouse, MouseConstraint, Events  } from 'matter-js';

const MatterJsDemo = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const selectedBox = useRef<Matter.Body | null>(null);
  useEffect(() => {
    var numOfBoxes = 7;
    var height = 1.5 * window.innerHeight;
    var width = sceneRef.current?.clientWidth || window.innerWidth;
    //console.log("sceneRef", sceneRef.current?.clientWidth, sceneRef.current?.clientHeight)
    // Clear the existing content of the ref element
    const setCanvasSize = (render: Render) => {
        if (render.canvas) {
            
            width = sceneRef.current?.clientWidth || window.innerWidth;
            //console.log(height,width);
            render.bounds.max.x = width;
            //render.bounds.max.y = height;
            render.options.width = width;
           // render.options.height = height;
           render.canvas.width = width;
           // render.canvas.height = height;
           Matter.Render.setPixelRatio(render, window.devicePixelRatio); // added this
        }
      };

      
    if (sceneRef.current) {
        sceneRef.current.innerHTML = '';
    }
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Composite = Matter.Composite,
        Bodies = Matter.Bodies;
    // Create an engine
    var engine = Engine.create(),
        world = engine.world;


    // Create a renderer
    var render = Render.create({
        element: sceneRef.current,
        engine: engine,
        options: {
            width: width,
            height: height,
            showVelocity: true,
            showAngleIndicator: true
        }
    });
    

     // Update the canvas size on window resize
    
    // Set the initial canvas size


    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);
    
    setCanvasSize(render);
    Render.run(render);
    // add bodies
    const createBoundaries = () => {
        return [//Bodies.rectangle(0, -200, width*2, 50, { isStatic: true }),
            Bodies.rectangle(0, height*1.25, width*2, 300, { isStatic: true }),
            //Bodies.rectangle(-300, 0, 50, height*2 + 100, { isStatic: true }),
            //Bodies.rectangle(width+100, 0, 50, height*2 + 100, { isStatic: true })
        ];
    };
    var boundaries = createBoundaries();
    Composite.add(world, boundaries);

    engine.gravity.y = 0.8;
    const createStack = () => {
        console.log('runing');
        return Composites.stack(width/2 - (width / 8),  height*1.25 - 150 - (numOfBoxes*((1*height)/numOfBoxes)), 1, numOfBoxes, 0, 0, function(x, y) {
          const offsetX = Common.random(-width/22, width/22); // Slight horizontal offset within a range
          
          const box = Bodies.rectangle(x + offsetX, y, width / 4, (1*height)/numOfBoxes, {
            friction: 1.0, // Set the friction value here
            mass: 0.08,
            render: {
                sprite: {
                  texture: 'https://static.vecteezy.com/system/resources/previews/029/089/228/non_2x/3d-home-cartoon-minimal-illustration-free-png.png', // Replace with the path to your image
                  xScale: 1,
                  yScale: 1
                }
              }
          });

          return box;
        });
      };

    const Stack = createStack();
    
    Composite.add(world, Stack);
     // add mouse control
     /*
     var mouse = Mouse.create(render.canvas),
     mouseConstraint = MouseConstraint.create(engine, {
         mouse: mouse,
         constraint: {
             stiffness: 0.2,
             render: {
                 visible: false
             }
         }
     });

    Composite.add(world, mouseConstraint);

    */
    const mouse = Mouse.create(render.canvas);
    mouse.pixelRatio = window.devicePixelRatio;
    render.canvas.addEventListener('mousedown', (event) => {
        console.log("clicking!!");
        const mousePosition = mouse.position;
        const bodies = Matter.Composite.allBodies(engine.world);
  
        for (let i = 1; i < bodies.length; i++) {
          const body = bodies[i];
          if (Matter.Bounds.contains(body.bounds, mousePosition)) {
            // Increase the size of the clicked box
            if (selectedBox.current){
                Body.scale(selectedBox.current, 1/1.2, 1/1.2); // Decrease the size by 20%
                if (selectedBox.current == body){
                    selectedBox.current = null;
                    break;
                }
            }
            Body.scale(body, 1.2, 1.2); // Increase the size by 20%
            selectedBox.current = body;
            //console.log(render.bounds.min.y,render.bounds.max.y, body.position.y,window.scrollY - render.bounds.min.y);
            const current_scroll = window.scrollY;
            const dis = render.bounds.max.y - render.bounds.min.y;
            const targetOffset = (body.position.y - dis/2 + 100) - render.bounds.min.y;
            const totalOffset = targetOffset + current_scroll;

            window.scrollTo({ top: totalOffset, behavior: 'smooth' });
            //requestAnimationFrame(() => updateCamera(render, body.position.y));
            
            break;
          }
    }
    });
    /*
    Events.on(mouse, 'mousedown', (event) => {
        console.log("clicking!!");
        const mousePosition = event.mouse.position;
        const bodies = Matter.Composite.allBodies(engine.world);
  
        for (let i = 0; i < bodies.length; i++) {
          const body = bodies[i];
          if (Matter.Bounds.contains(body.bounds, mousePosition)) {
            // Increase the size of the clicked box
            Body.scale(body, 1.2, 1.2); // Increase the size by 20%
            break;
          }
        }
      });
    */

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: width, y: window.innerHeight }
    });

    const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

    const updateCamera = (render: Matter.Render, targetY: number) => {
    
        const current_scroll = window.scrollY;
        const dis = render.bounds.max.y - render.bounds.min.y;
        const targetOffset = (targetY - dis/2 + 100) - render.bounds.min.y;
        const totalOffset = targetOffset + current_scroll;
        const newScroll = lerp(current_scroll, totalOffset, 0.4);

        window.scrollTo(0, newScroll);
        console.log('tesljdfn');

  requestAnimationFrame(() => updateCamera(render, targetY));
};


    // Overlay event forwarding
    const overlay = overlayRef.current;
    const forwardEvent = (event: MouseEvent) => {
  
        const mouseEvent = new MouseEvent(event.type, {
          clientX: event.clientX,
          clientY: event.clientY,
          bubbles: true,
          cancelable: true,
          view: window,
        });
        render.canvas.dispatchEvent(mouseEvent);
      };

      if (overlay) {
        overlay.addEventListener('mousemove', forwardEvent);
        overlay.addEventListener('mousedown', forwardEvent);
        overlay.addEventListener('mouseup', forwardEvent);
      }


    const handleResize = () => {
        setCanvasSize(render);
  
        if (Stack) {
          const bodies = Stack.bodies;
          const newStack = createStack();
          bodies.forEach((body, index) => {
            const newBody = newStack.bodies[index];
            Body.setPosition(body, { x: newBody.position.x, y: newBody.position.y });
            Body.setVertices(body, newBody.vertices);
          });
        }
        if (boundaries){
            const bodies = boundaries;
            const newBoundaries = createBoundaries();
            bodies.forEach((body, index) => {
                const newBody = newBoundaries[index];
                Body.setPosition(body, { x: newBody.position.x, y: newBody.position.y });
                Body.setVertices(body, newBody.vertices);
              });
        }
      };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleScroll = () => {
        if (render){
            const scrollTop = window.scrollY;
            Render.lookAt(render, {
            min: { x: 0, y: scrollTop },
            max: { x: width, y: scrollTop + window.innerHeight}
        });
        }
        
      };
    window.addEventListener('scroll', handleScroll);

    return () => {
      // Clean up Matter.js renderer and engine on component unmount
      if (overlay) {
        overlay.removeEventListener('mousemove', forwardEvent);
        overlay.removeEventListener('mousedown', forwardEvent);
        overlay.removeEventListener('mouseup', forwardEvent);
      }
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      Matter.World.clear(world, false);
      Matter.Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: width, y: height },
      });
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <>
  <div ref={sceneRef} className="fixed w-screen h-screen -z-10 "/>
  <div ref={overlayRef} className="fixed w-screen h-screen" />
  </>;
};

export default MatterJsDemo;
