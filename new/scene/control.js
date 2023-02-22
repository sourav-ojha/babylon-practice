export const customControls = function (scene, canvas, camera) {
  /* New Input Management for Camera
    __________________________________*/

  //First remove the default management.
  camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
  camera.inputs.removeByType("FreeCameraMouseInput");

  //Key Input Manager To Use Keys to Move Forward and BackWard and Look to the Left or Right
  var FreeCameraKeyboardWalkInput = function () {
    this._keys = [];
    this.keysUp = [38, 87];
    this.keysDown = [40, 83];
    this.keysLeft = [37, 65];
    this.keysRight = [39, 68];
  };

  //Add attachment controls
  FreeCameraKeyboardWalkInput.prototype.attachControl = function (
    noPreventDefault
  ) {
    var _this = this;
    var engine = this.camera.getEngine();
    var element = engine.getInputElement();
    if (!this._onKeyDown) {
      element.tabIndex = 1;
      this._onKeyDown = function (evt) {
        console.log(evt.keyCode);
        if (
          _this.keysUp.indexOf(evt.keyCode) !== -1 ||
          _this.keysDown.indexOf(evt.keyCode) !== -1 ||
          _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
          _this.keysRight.indexOf(evt.keyCode) !== -1
        ) {
          var index = _this._keys.indexOf(evt.keyCode);
          if (index === -1) {
            _this._keys.push(evt.keyCode);
          }
          if (!noPreventDefault) {
            evt.preventDefault();
          }
        }
      };
      this._onKeyUp = function (evt) {
        if (
          _this.keysUp.indexOf(evt.keyCode) !== -1 ||
          _this.keysDown.indexOf(evt.keyCode) !== -1 ||
          _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
          _this.keysRight.indexOf(evt.keyCode) !== -1
        ) {
          var index = _this._keys.indexOf(evt.keyCode);
          if (index >= 0) {
            _this._keys.splice(index, 1);
          }
          if (!noPreventDefault) {
            evt.preventDefault();
          }
        }
      };
      element.addEventListener("keydown", this._onKeyDown, false);
      element.addEventListener("keyup", this._onKeyUp, false);
    }
  };

  //Add detachment controls
  FreeCameraKeyboardWalkInput.prototype.detachControl = function () {
    var engine = this.camera.getEngine();
    var element = engine.getInputElement();
    if (this._onKeyDown) {
      element.removeEventListener("keydown", this._onKeyDown);
      element.removeEventListener("keyup", this._onKeyUp);
      // BABYLON.Tools.UnregisterTopRootEvents(canvas, [
      //   { name: "blur", handler: this._onLostFocus },
      // ]);
      this._keys = [];
      this._onKeyDown = null;
      this._onKeyUp = null;
    }
  };

  //Keys movement control by checking inputs
  FreeCameraKeyboardWalkInput.prototype.checkInputs = function () {
    if (this._onKeyDown) {
      var camera = this.camera;
      for (var index = 0; index < this._keys.length; index++) {
        var keyCode = this._keys[index];
        var speed = camera.speed;
        if (this.keysLeft.indexOf(keyCode) !== -1) {
          camera.rotation.y -= camera.angularSpeed;
          camera.direction.copyFromFloats(0, 0, 0);
        } else if (this.keysUp.indexOf(keyCode) !== -1) {
          camera.direction.copyFromFloats(0, 0, speed);
        } else if (this.keysRight.indexOf(keyCode) !== -1) {
          camera.rotation.y += camera.angularSpeed;
          camera.direction.copyFromFloats(0, 0, 0);
        } else if (this.keysDown.indexOf(keyCode) !== -1) {
          camera.direction.copyFromFloats(0, 0, -speed);
        }
        if (camera.getScene().useRightHandedSystem) {
          camera.direction.z *= -1;
        }
        camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
        BABYLON.Vector3.TransformNormalToRef(
          camera.direction,
          camera._cameraTransformMatrix,
          camera._transformedDirection
        );
        camera.cameraDirection.addInPlace(camera._transformedDirection);
      }
    }
  };

  //Add the onLostFocus function
  FreeCameraKeyboardWalkInput.prototype._onLostFocus = function (e) {
    this._keys = [];
  };

  //Add the two required functions for the control Name
  FreeCameraKeyboardWalkInput.prototype.getClassName = function () {
    return "FreeCameraKeyboardWalkInput";
  };

  FreeCameraKeyboardWalkInput.prototype.getSimpleName = function () {
    return "keyboard";
  };

  //Add the new keys input manager to the camera.
  camera.inputs.add(new FreeCameraKeyboardWalkInput());

  //The Mouse Manager to use the mouse (touch) to search around including above and below
  var FreeCameraSearchInput = function (touchEnabled) {
    if (touchEnabled === void 0) {
      touchEnabled = true;
    }
    this.touchEnabled = touchEnabled;
    this.buttons = [0, 1, 2];
    this.angularSensibility = 2000.0;
    this.restrictionX = 100;
    this.restrictionY = 60;
  };

  //add attachment control which also contains the code to react to the input from the mouse
  FreeCameraSearchInput.prototype.attachControl = function (noPreventDefault) {
    var _this = this;
    var engine = this.camera.getEngine();
    var element = engine.getInputElement();
    var angle = { x: 0, y: 0 };
    if (!this._pointerInput) {
      this._pointerInput = function (p, s) {
        var evt = p.event;
        if (!_this.touchEnabled && evt.pointerType === "touch") {
          return;
        }
        if (
          p.type !== BABYLON.PointerEventTypes.POINTERMOVE &&
          _this.buttons.indexOf(evt.button) === -1
        ) {
          return;
        }
        if (p.type === BABYLON.PointerEventTypes.POINTERDOWN) {
          try {
            evt.srcElement.setPointerCapture(evt.pointerId);
          } catch (e) {
            //Nothing to do with the error. Execution will continue.
          }
          _this.previousPosition = {
            x: evt.clientX,
            y: evt.clientY,
          };
          if (!noPreventDefault) {
            evt.preventDefault();
            element.focus();
          }
        } else if (p.type === BABYLON.PointerEventTypes.POINTERUP) {
          try {
            evt.srcElement.releasePointerCapture(evt.pointerId);
          } catch (e) {
            //Nothing to do with the error.
          }
          _this.previousPosition = null;
          if (!noPreventDefault) {
            evt.preventDefault();
          }
        } else if (p.type === BABYLON.PointerEventTypes.POINTERMOVE) {
          if (!_this.previousPosition || engine.isPointerLock) {
            return;
          }
          var offsetX = evt.clientX - _this.previousPosition.x;
          var offsetY = evt.clientY - _this.previousPosition.y;
          angle.x += offsetX;
          angle.y -= offsetY;
          if (Math.abs(angle.x) > _this.restrictionX) {
            angle.x -= offsetX;
          }
          if (Math.abs(angle.y) > _this.restrictionY) {
            angle.y += offsetY;
          }
          if (_this.camera.getScene().useRightHandedSystem) {
            if (Math.abs(angle.x) < _this.restrictionX) {
              _this.camera.cameraRotation.y -=
                offsetX / _this.angularSensibility;
            }
          } else {
            if (Math.abs(angle.x) < _this.restrictionX) {
              _this.camera.cameraRotation.y +=
                offsetX / _this.angularSensibility;
            }
          }
          if (Math.abs(angle.y) < _this.restrictionY) {
            _this.camera.cameraRotation.x += offsetY / _this.angularSensibility;
          }
          _this.previousPosition = {
            x: evt.clientX,
            y: evt.clientY,
          };
          if (!noPreventDefault) {
            evt.preventDefault();
          }
        }
      };
    }
    this._onSearchMove = function (evt) {
      if (!engine.isPointerLock) {
        return;
      }
      var offsetX =
        evt.movementX ||
        evt.mozMovementX ||
        evt.webkitMovementX ||
        evt.msMovementX ||
        0;
      var offsetY =
        evt.movementY ||
        evt.mozMovementY ||
        evt.webkitMovementY ||
        evt.msMovementY ||
        0;
      if (_this.camera.getScene().useRightHandedSystem) {
        _this.camera.cameraRotation.y -= offsetX / _this.angularSensibility;
      } else {
        _this.camera.cameraRotation.y += offsetX / _this.angularSensibility;
      }
      _this.camera.cameraRotation.x += offsetY / _this.angularSensibility;
      _this.previousPosition = null;
      if (!noPreventDefault) {
        evt.preventDefault();
      }
    };
    this._observer = this.camera
      .getScene()
      .onPointerObservable.add(
        this._pointerInput,
        BABYLON.PointerEventTypes.POINTERDOWN |
          BABYLON.PointerEventTypes.POINTERUP |
          BABYLON.PointerEventTypes.POINTERMOVE
      );
    element.addEventListener("mousemove", this._onSearchMove, false);
  };

  //Add detachment control
  FreeCameraSearchInput.prototype.detachControl = function () {
    var engine = this.camera.getEngine();
    var element = engine.getInputElement();
    if (this._observer && element) {
      this.camera.getScene().onPointerObservable.remove(this._observer);
      element.removeEventListener("mousemove", this._onSearchMove);
      this._observer = null;
      this._onSearchMove = null;
      this.previousPosition = null;
    }
  };

  //Add the two required functions for names
  FreeCameraSearchInput.prototype.getClassName = function () {
    return "FreeCameraSearchInput";
  };

  FreeCameraSearchInput.prototype.getSimpleName = function () {
    return "MouseSearchCamera";
  };

  //Add the new mouse input manager to the camera
  camera.inputs.add(new FreeCameraSearchInput());

  const btnProp = {
    width: "70px",
    height: "50px",
    color: "white",
    background: "green",
  };
  let rotate = 0,
    move = 0;

  // create button to control the camera as a player
  var upBtn = BABYLON.GUI.Button.CreateSimpleButton("but", "up");
  upBtn.width = btnProp.width;
  upBtn.height = btnProp.height;
  upBtn.color = btnProp.color;
  upBtn.background = btnProp.background;
  upBtn.top = "-50px";

  var leftBtn = BABYLON.GUI.Button.CreateSimpleButton("but", "left");
  leftBtn.width = btnProp.width;
  leftBtn.height = btnProp.height;
  leftBtn.color = btnProp.color;
  leftBtn.background = btnProp.background;
  leftBtn.left = `-${btnProp.width}`;

  var downBtn = BABYLON.GUI.Button.CreateSimpleButton("but", "down");
  downBtn.width = btnProp.width;
  downBtn.height = btnProp.height;
  downBtn.color = btnProp.color;
  downBtn.background = btnProp.background;

  var rightBtn = BABYLON.GUI.Button.CreateSimpleButton("but", "right");
  rightBtn.width = btnProp.width;
  rightBtn.height = btnProp.height;
  rightBtn.color = btnProp.color;
  rightBtn.background = btnProp.background;
  rightBtn.left = btnProp.width;

  // place the buttons together in a container
  var panel = new BABYLON.GUI.Container();
  panel.width = "300px";
  panel.fontSize = "24px";
  //   panel.horizontalAlignment = BABYLON.GUI.Container.HORIZONTAL_ALIGNMENT_LEFT;
  // place the panel in left bottom corner
  panel.verticalAlignment = BABYLON.GUI.Container.VERTICAL_ALIGNMENT_BOTTOM;
  panel.left = "10px";
  panel.top = "40%";

  // add the buttons to the container

  panel.addControl(upBtn);
  panel.addControl(downBtn);
  panel.addControl(leftBtn);
  panel.addControl(rightBtn);

  // add the container to the advanced dynamic texture
  var advancedTexture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  advancedTexture.addControl(panel);

  // add event listener to the buttons
  leftBtn.onPointerDownObservable.add(() => (rotate = -1));
  rightBtn.onPointerDownObservable.add(() => (rotate = 1));
  upBtn.onPointerDownObservable.add(() => (move = 1));
  downBtn.onPointerDownObservable.add(() => (move = -1));
  leftBtn.onPointerUpObservable.add(() => (rotate = 0));
  rightBtn.onPointerUpObservable.add(() => (rotate = 0));
  upBtn.onPointerUpObservable.add(() => (move = 0));
  downBtn.onPointerUpObservable.add(() => (move = 0));

  scene.onBeforeRenderObservable.add(() => {
    if (rotate != 0) {
      camera.rotation.y = camera.rotation.y + rotate * camera.angularSpeed;
      camera.direction.copyFromFloats(0, 0, 0);
    }
    if (move != 0) {
      camera.direction.copyFromFloats(0, 0, camera.speed * move);
      if (camera.getScene().useRightHandedSystem) {
        camera.direction.z *= -1;
      }
      camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
      BABYLON.Vector3.TransformNormalToRef(
        camera.direction,
        camera._cameraTransformMatrix,
        camera._transformedDirection
      );
      camera.cameraDirection.addInPlace(camera._transformedDirection);
    }
  });

  // check for device type
  const isMobile = () => {
    console.log("mobile device detected");
    return (
      typeof window.orientation !== "undefined" ||
      navigator.userAgent.indexOf("IEMobile") !== -1
    );
  };

  if (isMobile()) {
    // remove mouse input and touch input

    console.log(camera.inputs);
    camera.inputs.removeByType("FreeCameraSearchInput");
    camera.inputs.removeByType("FreeCameraKeyboardWalkInput");
    camera.inputs.removeByType("FreeCameraTouchInput");
    console.log(camera.inputs);
    console.log("controls removed");
  }
};

// FreeCameraKeyboardMoveInput
// FreeCameraMouseInput

// FreeCameraKeyboardWalkInput - FreeCameraKeyboardWalkInput - keyboard
// FreeCameraSearchInput - FreeCameraSearchInput - MouseSearchCamera
