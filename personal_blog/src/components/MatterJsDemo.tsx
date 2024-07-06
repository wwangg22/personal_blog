// app/MatterJsDemo.js
"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter, {
  Engine,
  Render,
  World,
  Bodies,
  Body,
  Mouse,
  MouseConstraint,
  Events,
  Constraint,
} from "matter-js";
import TextBox from "@/components/TextBox";
import { create } from "domain";
import EnterButton from "@/components/EnterBtn";

function extractPartsFromUrls(urls: string[]): string[] {
  // Regular expression to capture the part before the last dot
  const regex = /\/([^\/]+)\.\w+$/;

  return urls.map((url) => {
    const match = url.match(regex);
    return match ? match[1] : "";
  });
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const radiansToDegrees = (radians: number) => {
  return radians * (180 / Math.PI);
};
const getMaxScrollValue = () => {
  const body = document.body;
  const html = document.documentElement;

  const documentHeight = Math.max(
    body.scrollHeight,
    html.scrollHeight,
    body.offsetHeight,
    html.offsetHeight,
    body.clientHeight,
    html.clientHeight
  );

  const windowHeight = window.innerHeight;

  return documentHeight - windowHeight;
};

async function grabHTML(link: string) {
  const response = await fetch(link);
  const text = await response.text();
  return text;
}

interface matterProps {
  blocks: string[];
}

const MatterJsDemo: React.FC<matterProps> = ({ blocks }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const selectedBox = useRef<Matter.Body | null>(null);
  const names = extractPartsFromUrls(blocks);
  //console.log(blocks);
  //console.log(names);

  const [textBoxPosition, setTextBoxPosition] = useState<{
    x: number;
    y: number;
    rotation: number;
    offset: number;
    title: string;
    text: string;
  } | null>(null);
  const [enterPosition, setEnterPosition] = useState<{
    x: number;
    y: number;
    offset: number;
  } | null>(null);
  useEffect(() => {
    var numOfBoxes = blocks.length;
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
      sceneRef.current.innerHTML = "";
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
      element: sceneRef.current ? sceneRef.current : undefined,
      engine: engine,
      options: {
        width: width,
        height: height,
        showVelocity: true,
        showAngleIndicator: true,
        wireframes: false, // Ensure this is false to see textures
        background: "transparent",
      },
    });

    // Update the canvas size on window resize

    // Set the initial canvas size

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    setCanvasSize(render);
    Render.run(render);
    // add bodies
    const dirt_image = new Image();
    dirt_image.src = "/trans.png";
    const dirt_imageWidth = dirt_image.naturalWidth;
    const dirt_imageHeight = dirt_image.naturalHeight;
    const createBoundaries = () => {
      return [
        //Bodies.rectangle(0, -200, width*2, 50, { isStatic: true }),
        Bodies.rectangle(0, height * 1.25, width * 2, 300, {
          isStatic: true,
          render: {
            sprite: {
              texture: "/trans.png", // Replace with the path to your image
              yScale: 300 / dirt_imageHeight,
              xScale: (width * 2) / dirt_imageWidth,
            },
          },
        }),

        //Bodies.rectangle(-300, 0, 50, height*2 + 100, { isStatic: true }),
        //Bodies.rectangle(width+100, 0, 50, height*2 + 100, { isStatic: true })
      ];
    };
    var boundaries = createBoundaries();
    Composite.add(world, boundaries);

    const imagePath = "/sky15.png";
    const image = new Image();
    image.src = imagePath;
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;

    engine.gravity.y = 0.8;
    const createDrop = () => {
      const stringLength = 100;
      const segmentCount = 10;
      const segmentLength = stringLength / segmentCount;
      const block = Bodies.rectangle(
        window.innerWidth / 2,
        -300 + stringLength + (1 * height) / (numOfBoxes + 1) / 2 + 10,
        width / 4,
        (1 * height) / (numOfBoxes + 1),
        {
          friction: 1.0, // Set the friction value here
          mass: 0.08,
          render: {
            sprite: {
              texture: "/sky15.png", // Replace with the path to your image
              xScale: width / 4 / imageWidth,
              yScale: (1 * height) / (numOfBoxes + 1) / imageHeight,
            },
          },
        }
      );
      block.label = "block";

      const segments = [];
      let previous: { body: Matter.Body | null } = { body: null };

      for (let i = 0; i <= segmentCount; i++) {
        const segment = Bodies.rectangle(
          window.innerWidth / 2,
          -300 + i * segmentLength,
          10,
          segmentLength,
          {
            isStatic: i === 0,
            mass: 0.08,
          }
        );
        segments.push(segment);
        World.add(world, segment);
        if (previous.body) {
          const constraint = Constraint.create({
            bodyA: previous.body,
            bodyB: segment,
            pointA: { x: 0, y: segmentLength / 2 },
            pointB: { x: 0, y: -segmentLength / 2 },
            stiffness: 1,
          });
          World.add(world, constraint);
        }
        previous.body = segment;
      }
      const finalConstraint = Constraint.create({
        bodyA: segments[segments.length - 1],
        bodyB: block,
        pointA: { x: 0, y: segmentLength / 2 },
        pointB: { x: 0, y: -(1 * height) / (numOfBoxes + 1) / 2 },
        stiffness: 1,
      });
      World.add(world, [block, finalConstraint]);
      return [...segments, block];
    };
    var z = createDrop();
    const createGarage = () => {
      const garage_image = new Image();
      garage_image.src = "garage.png";
      const imageWidth = garage_image.naturalWidth;
      const imageHeight = garage_image.naturalHeight;
      const box_height = (1 * height) / (numOfBoxes + 1);
      const box_width = width / 4;
      const gar = Bodies.rectangle(
        box_width / 2 + 100,
        height * 1.25 - 300,
        box_width,
        box_height,
        {
          friction: 1.0, // Set the friction value here
          mass: 0.08,
          render: {
            sprite: {
              texture: "garage.png", // Replace with the path to your image
              xScale: box_width / imageWidth,
              yScale: box_height / imageHeight,
            },
          },
        }
      );
      gar.label = "garage";
      return gar;
    };
    var garage = createGarage();
    World.add(world, garage);

    const createStack = () => {
      console.log("runing");
      const box_height = (1 * height) / (numOfBoxes + 1);
      const box_width = width / 4;
      var i = 0;
      return Composites.stack(
        width / 2 - width / 8,
        height * 1.25 - 150 - numOfBoxes * box_height,
        1,
        numOfBoxes,
        0,
        0,
        function (x: number, y: number) {
          const offsetX = Common.random(-width / 22, width / 22); // Slight horizontal offset within a range

          const box = Bodies.rectangle(x + offsetX, y, box_width, box_height, {
            friction: 1.0, // Set the friction value here
            mass: 0.08,
            render: {
              sprite: {
                texture: "/sky15.png", // Replace with the path to your image
                xScale: box_width / imageWidth,
                yScale: box_height / imageHeight,
              },
            },
          });
          box.label = `${i}`;
          (box as any).imageWidth = imageWidth;
          (box as any).imageHeight = imageHeight;
          i++;

          return box;
        }
      );
    };

    var Stack = createStack();

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
    render.canvas.addEventListener("mousedown", (event) => {
      // console.log("clicking!!");
      const mousePosition = mouse.position;
      const scrollY = window.scrollY;
      console.log("mouseposition x ", mousePosition.x / window.innerWidth);
      console.log("width ", window.innerWidth);
      // console.log("mouse position", mousePosition.y - window.scrollY);
      // console.log("height", window.innerHeight);
      // console.log("bounds ", render.bounds.min.y - window.scrollY);
      const bodies = Matter.Composite.allBodies(engine.world);
      for (let i = 1; i < bodies.length; i++) {
        const body = bodies[i];
        if (Matter.Bounds.contains(body.bounds, mousePosition)) {
          // Increase the size of the clicked box
          setEnterPosition(null);
          console.log(i);
          if (body.label == "block") {
            const constraints = Matter.Composite.allConstraints(world);
            constraints.forEach((constraint) => {
              if (constraint.bodyB && constraint.bodyB.label === "block") {
                Matter.World.remove(world, constraint);
              }
            });
            return;
          }

          const imageWidth = (body as any).imageWidth;
          const imageHeight = (body as any).imageHeight;
          if (selectedBox.current) {
            Body.scale(selectedBox.current, 1 / 1.2, 1 / 1.2); // Decrease the size by 20%
            if (selectedBox.current.render.sprite) {
              selectedBox.current.render.sprite.xScale =
                (selectedBox.current.render.sprite.xScale * 1) / 1.2;
              selectedBox.current.render.sprite.yScale =
                (selectedBox.current.render.sprite.yScale * 1) / 1.2;
            }
            if (selectedBox.current == body) {
              selectedBox.current = null;
              setTextBoxPosition(null);
              break;
            }
          }
          console.log(imageWidth, imageHeight);
          var rotation = radiansToDegrees(body.angle);
          Body.scale(body, 1.2, 1.2); // Increase the size by 20%
          if (body.render.sprite) {
            body.render.sprite.xScale = body.render.sprite.xScale * 1.2;
            body.render.sprite.yScale = body.render.sprite.yScale * 1.2;
          }
          selectedBox.current = body;
          //console.log(render.bounds.min.y,render.bounds.max.y, body.position.y,window.scrollY - render.bounds.min.y);
          if (body.label == "garage") {
            const current_scroll = window.scrollY;
            const dis = window.innerHeight;
            const distance = width / 8 + 75;
            const centerX = body.position.x;
            const centerY = body.position.y;
            const targetOffset =
              body.position.y - dis / 2 - render.bounds.min.y;
            var totalOffset = targetOffset + current_scroll;
            const max_scroll = getMaxScrollValue();

            // console.log("max scroll", max_scroll);
            // console.log("scroll rn", window.scrollY);

            if (totalOffset > max_scroll) {
              totalOffset = max_scroll;
            } else if (totalOffset < 0) {
              totalOffset = 0;
            }
            // console.log("total offset", totalOffset);
            // console.log("dis vs height ", dis, window.innerHeight);
            // console.log("body positin ", (((body.position.y - totalOffset) - (render.bounds.min.y - totalOffset))) / (render.bounds.max.y - render.bounds.min.y));

            window.scrollTo({ top: totalOffset, behavior: "smooth" });

            const leftPercent = centerX / window.innerWidth;
            const topPercent =
              (centerY - totalOffset - (render.bounds.min.y - scrollY)) /
              window.innerHeight;
            setEnterPosition({
              x: leftPercent,
              y: topPercent,
              offset: totalOffset,
            });
            // console.log("total offset ", totalOffset);

            //console.log("relative" , body.position.x / window.innerWidth);

            //requestAnimationFrame(() => updateCamera(render, body.position.y));

            break;
          }
          if (!isNaN(parseInt(body.label))) {
            const current_scroll = window.scrollY;
            const dis = window.innerHeight;
            const distance = width / 8 + 75;
            const centerX = body.position.x;
            const centerY = body.position.y;
            const targetOffset =
              body.position.y - dis / 2 - render.bounds.min.y;
            var totalOffset = targetOffset + current_scroll;
            const max_scroll = getMaxScrollValue();

            // console.log("max scroll", max_scroll);
            // console.log("scroll rn", window.scrollY);

            if (totalOffset > max_scroll) {
              totalOffset = max_scroll;
            } else if (totalOffset < 0) {
              totalOffset = 0;
            }
            // console.log("total offset", totalOffset);
            // console.log("dis vs height ", dis, window.innerHeight);
            // console.log("body positin ", (((body.position.y - totalOffset) - (render.bounds.min.y - totalOffset))) / (render.bounds.max.y - render.bounds.min.y));

            window.scrollTo({ top: totalOffset, behavior: "smooth" });
            var pos = body.position.x / window.innerWidth;
            var phase = Math.PI;
            if (pos > 0.5) {
              rotation += 180;
            } else {
              phase = 0;
            }
            const perpendicularX = Math.cos(body.angle + phase) * distance;
            const perpendicularY = Math.sin(body.angle + phase) * distance;

            const newX = centerX + perpendicularX;
            const newY = centerY + perpendicularY;

            const leftPercent = newX / window.innerWidth;
            const topPercent =
              (newY - totalOffset - (render.bounds.min.y - scrollY)) /
              window.innerHeight;
            // console.log("total offset ", totalOffset);

            //console.log("relative" , body.position.x / window.innerWidth);

            // console.log('title ', names[-i + 12 + numOfBoxes], -i + 12 + numOfBoxes);
            console.log("label", body.label, parseInt(body.label));
            grabHTML(blocks[parseInt(body.label)]).then((text) => {
              setTextBoxPosition({
                x: leftPercent,
                y: topPercent,
                rotation: rotation,
                offset: totalOffset,
                title: names[parseInt(body.label)],
                text: text,
              });
            });

            //requestAnimationFrame(() => updateCamera(render, body.position.y));

            break;
          }
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
      max: { x: width, y: window.innerHeight },
    });

    const lerp = (start: number, end: number, t: number) =>
      start * (1 - t) + end * t;

    const updateCamera = (render: Matter.Render, targetY: number) => {
      const current_scroll = window.scrollY;
      const dis = render.bounds.max.y - render.bounds.min.y;
      const targetOffset = targetY - dis / 2 + 100 - render.bounds.min.y;
      const totalOffset = targetOffset + current_scroll;
      const newScroll = lerp(current_scroll, totalOffset, 0.4);

      window.scrollTo(0, newScroll);
      console.log("tesljdfn");

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
      overlay.addEventListener("mousemove", forwardEvent);
      overlay.addEventListener("mousedown", forwardEvent);
      overlay.addEventListener("mouseup", forwardEvent);
    }

    const reset = () => {
      const bodies = Matter.Composite.allBodies(world);
      Matter.World.remove(world, bodies);
      const constraints = Matter.Composite.allConstraints(world);
      Matter.World.remove(world, constraints);
      const composites = Matter.Composite.allComposites(world);
      Matter.World.remove(world, composites);
      selectedBox.current = null;
      setTextBoxPosition(null);
      Stack = createStack();
      Composite.add(world, Stack);
      boundaries = createBoundaries();
      Composite.add(world, boundaries);
      garage = createGarage();
      Composite.add(world, garage);
      z = createDrop();
    };
    document.getElementById("resetButton")?.addEventListener("click", reset);

    const canv = document.getElementById("canvas");
    if (canv) {
      canv.style.background = 'url("/labg3.png") no-repeat';
      canv.style.backgroundSize = "cover";
    }
    const handleResize = () => {
      setCanvasSize(render);
      reset();

      // if (Stack) {
      //   const bodies = Stack.bodies;
      //   const newStack = createStack();
      //   bodies.forEach((body, index) => {
      //     const newBody = newStack.bodies[index];
      //     Body.setPosition(body, { x: newBody.position.x, y: newBody.position.y });
      //     Body.setVertices(body, newBody.vertices);
      //   });
      // }
      // if (boundaries){
      //     const bodies = boundaries;
      //     const newBoundaries = createBoundaries();
      //     bodies.forEach((body, index) => {
      //         const newBody = newBoundaries[index];
      //         Body.setPosition(body, { x: newBody.position.x, y: newBody.position.y });
      //         Body.setVertices(body, newBody.vertices);
      //       });
      // }
      // if (z){
      //     const constraints = Matter.Composite.allConstraints(world);

      //     constraints.forEach((constraint,index) => {
      //       Matter.World.remove(world, constraint);

      //     });
      //     Matter.World.remove(world,z);
      //     z = createDrop();

      // }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleScroll = () => {
      //event.preventDefault();
      const scrollTop = window.scrollY;
      console.log("scrolling");
      if (render) {
        Render.lookAt(render, {
          min: { x: 0, y: scrollTop },
          max: { x: width, y: scrollTop + window.innerHeight },
        });
      }
      const parallax1Elements = document.querySelectorAll("#canvas");
      parallax1Elements.forEach((element) => {
        (element as HTMLElement).style.backgroundPositionY = `${
          scrollTop * -0.08
        }px`;
      });
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      // Clean up Matter.js renderer and engine on component unmount
      if (overlay) {
        overlay.removeEventListener("mousemove", forwardEvent);
        overlay.removeEventListener("mousedown", forwardEvent);
        overlay.removeEventListener("mouseup", forwardEvent);
      }
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      Matter.World.clear(world, false);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document
        .getElementById("resetButton")
        ?.removeEventListener("click", reset);
    };
  }, []);

  return (
    <>
      <button
        id="resetButton"
        type="button"
        className="fixed bg-violet-500 hover:bg-violet-700 text-white text-4xl font-bold py-2 px-4 rounded-full z-30 mt-[10px] ml-[30px]"
      >
        Reset!
      </button>
      <div
        ref={sceneRef}
        id="canvas"
        className="fixed w-screen h-[calc(100vh+60px)] -z-10 "
      />
      <div ref={overlayRef} className="fixed w-screen h-screen" />
      {textBoxPosition && (
        <TextBox
          x={textBoxPosition.x}
          y={textBoxPosition.y}
          rotation={textBoxPosition.rotation}
          offset={textBoxPosition.offset}
          title={textBoxPosition.title}
          text={textBoxPosition.text}
        />
      )}
      {enterPosition && (
        <EnterButton
          x={enterPosition.x}
          y={enterPosition.y}
          offset={enterPosition.offset}
        />
      )}
    </>
  );
};

export default MatterJsDemo;
