import { createScene1 } from "./scene/scene1.js";
import { createScene2 } from "./scene/scene2.js";

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const loadScene = () => {
  // get query string
  const urlParams = new URLSearchParams(window.location.search);
  const sceneId = urlParams.get("id");
  console.log("sceneId", sceneId);
  if (sceneId === null) {
    return createScene1();
  }
  // load scene
  // const scene = require(`./scene/scene${sceneId}.js`);
  return sceneId === "1" ? createScene1() : createScene2();
  // const scene = CreateScene1();
};

const scene = loadScene(); //Call the createScene function
// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
  scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
  engine.resize();
});
