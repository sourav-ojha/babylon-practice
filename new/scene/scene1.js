import { customControls } from "./control.js";

export const createScene1 = function (canvas, engine) {
  var scene = new BABYLON.Scene(engine);

  var light = new BABYLON.DirectionalLight(
    "Omni",
    new BABYLON.Vector3(-2, -5, 2),
    scene
  );

  //Add the camera, to be shown as a cone and surrounding collision volume
  var camera = new BABYLON.UniversalCamera(
    "MyCamera",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  camera.minZ = 0.0001;
  camera.attachControl(canvas, true);
  // camera.speed = 0.005;
  camera.speed = 0.005;
  camera.angularSpeed = 0.02;
  camera.angle = Math.PI / 2;
  camera.direction = new BABYLON.Vector3(
    Math.cos(camera.angle),
    0,
    Math.sin(camera.angle)
  );

  //Add viewCamera that gives first person shooter view
  var viewCamera = new BABYLON.UniversalCamera(
    "viewCamera",
    new BABYLON.Vector3(0, 3, -3),
    scene
  );
  viewCamera.parent = camera;
  viewCamera.setTarget(new BABYLON.Vector3(0, -0.0001, 1));

  //Activate both cameras
  scene.activeCameras.push(viewCamera);
  scene.activeCameras.push(camera);

  //Add two viewports
  // camera.viewport = new BABYLON.Viewport(0, 0.5, 1.0, 0.5);
  viewCamera.viewport = new BABYLON.Viewport(0, 1, 1.0, 1);

  //Dummy camera as cone
  var cone = BABYLON.MeshBuilder.CreateCylinder(
    "dummyCamera",
    { diameterTop: 0.01, diameterBottom: 0.2, height: 0.2 },
    scene
  );
  cone.parent = camera;
  cone.rotation.x = Math.PI / 2;

  /* Set Up Scenery 
    _____________________*/

  //Ground
  var ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 100, height: 100 },
    scene
  );
  ground.material = new BABYLON.StandardMaterial("groundMat", scene);
  ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
  ground.material.backFaceCulling = false;

  var lowerGround = ground.clone("lowerGround");
  lowerGround.scaling.x = 4;
  lowerGround.scaling.z = 4;
  lowerGround.position.y = -16;
  lowerGround.material = ground.material.clone("lowerMat");
  lowerGround.material.diffuseColor = new BABYLON.Color3(0, 1, 0);

  var randomNumber = function (min, max) {
    if (min == max) {
      return min;
    }
    var random = Math.random();
    return random * (max - min) + min;
  };

  var box = new BABYLON.MeshBuilder.CreateBox("crate", { size: 2 }, scene);
  box.material = new BABYLON.StandardMaterial("Mat", scene);
  box.material.diffuseTexture = new BABYLON.Texture(
    "/1/textures/crate.png",
    scene
  );
  box.checkCollisions = true;

  var boxNb = 6;
  var theta = 0;
  var radius = 6;
  box.position = new BABYLON.Vector3(
    (radius + randomNumber(-0.5 * radius, 0.5 * radius)) *
      Math.cos(theta + randomNumber(-0.1 * theta, 0.1 * theta)),
    1,
    (radius + randomNumber(-0.5 * radius, 0.5 * radius)) *
      Math.sin(theta + randomNumber(-0.1 * theta, 0.1 * theta))
  );

  var boxes = [box];
  for (var i = 1; i < boxNb; i++) {
    theta += (2 * Math.PI) / boxNb;
    var newBox = box.clone("box" + i);
    boxes.push(newBox);
    newBox.position = new BABYLON.Vector3(
      (radius + randomNumber(-0.5 * radius, 0.5 * radius)) *
        Math.cos(theta + randomNumber(-0.1 * theta, 0.1 * theta)),
      1,
      (radius + randomNumber(-0.5 * radius, 0.5 * radius)) *
        Math.sin(theta + randomNumber(-0.1 * theta, 0.1 * theta))
    );
  }
  /* End Create Scenery */

  //Gravity and Collisions Enabled
  scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
  scene.collisionsEnabled = true;

  camera.checkCollisions = true;
  camera.applyGravity = true;

  ground.checkCollisions = true;
  lowerGround.checkCollisions = true;

  camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

  //Create Visible Ellipsoid around camera
  var a = 0.5;
  var b = 1;
  var points = [];
  for (var theta = -Math.PI / 2; theta < Math.PI / 2; theta += Math.PI / 36) {
    points.push(
      new BABYLON.Vector3(0, b * Math.sin(theta), a * Math.cos(theta))
    );
  }

  var ellipse = [];
  ellipse[0] = BABYLON.MeshBuilder.CreateLines("e", { points: points }, scene);
  ellipse[0].color = BABYLON.Color3.Red();
  ellipse[0].parent = camera;
  ellipse[0].rotation.y = (5 * Math.PI) / 16;
  for (var i = 1; i < 23; i++) {
    ellipse[i] = ellipse[0].clone("el" + i);
    ellipse[i].parent = camera;
    ellipse[i].rotation.y = (5 * Math.PI) / 16 + (i * Math.PI) / 16;
  }

  customControls(scene, canvas, camera);

  return scene;
};
