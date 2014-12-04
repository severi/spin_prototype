function App(){
	var self = this;
    //INIT 3D SCENE
    if(self.init()){
		self.addEventListener();
		self.renderScene();
		self.introLevel();
	}
}

App.prototype.loadSettings = function(){
	var self = this;
	var tCubeRadius;
	self.fps = settings.fps;
	self.rows = settings.rows;
	self.cubeSize = settings.cubeSize;
	self.usedColors = settings.colors;
	tCubeRadius = self.rows *0.5 * self.cubeSize;
	self.center = { x: tCubeRadius, y: tCubeRadius, z:-tCubeRadius };
}

App.prototype.init = function(){
	var self = this;
	self.rotationOngoing=false;
	this.rotationDirection=null;
	this.currentAngle=0;
	this.currentUpAngle=0;

	if(!self.init3dView()){
		console.log("Error during init in class app method init -> initedView returnt false");
		return false;
	}
	//SETUP GUI OBJECT -> NEED TO BE CALLED BEFORE LOGIC BECAUSE OF VALUE DEPENDENCIES
	self.gui = new GUI(self);
	if(!self.gui.init()){
		console.log("Error during init in class app method init -> gui returnt false");
		return false;
	}
	//INIT LOGIC
	self.logic = new Logic(this);
	if(!self.logic.init()){
		console.log("Error during init in class app method init -> logic returnt false");
		return false;
	}

	//SETUP DEBUG OBJECT -> NEED TO BE CALLED AT LAST TO MAKE SURE ALL REQUIRED OBJECTS ARE REALLY CREATED LIKE SCENE ...
	self.debug = new Debug(self);
	if(!self.debug.init()){
		console.log("Error during init in class app method init -> debug returnt false");
		return false;
	}
	//IF EVERYTHING WENT WELL INIT OK
	return true;
}

App.prototype.init3dView = function(){
	var self = this;
	self.levelCubes = new Array();
	//USED TO SET THE HEIGHT OF THE CANVAS VALUES IN % [0-1] e.g 0.5 means 50%;
	self.hScale = 1;
	if(self.hScale <= 0 || self.hScale > 1) {
		alert("ERROR: hScale IS OUT OF EXPECTED RANGE [0.1 - 1]");
		return false;
	}
	//LOADING REQUIRED SETTINGS
	self.loadSettings();

	//SETUP RENDERER
	self.renderer = new THREE.WebGLRenderer({antialias: true, devicePixelRatio: 1});
	self.renderer.setSize(window.innerWidth, window.innerHeight*self.hScale);
	self.renderer.setClearColor(0xffffff, 1);
	document.body.appendChild(self.renderer.domElement);

	//SETUP SCENE AND CAMERA
	self.scene = new THREE.Scene();

	self.initCamera();

	self.projector = new THREE.Projector();
	//INIT SUCCESSFUL
	return true;
}


App.prototype.initCamera = function(){
	var self = this;
	self.camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * self.hScale), 0.1, parseInt(100));
	self.camera.position.z =  self.cubeSize * 8;

	self.cameraX = new THREE.Vector3();
	self.cameraX.x=1;
	self.isBetweenY=false;
	self.isBetweenX=false;
	self.lastVerticalDirection=null;
	self.lastHorizontalDirection=null;
	self.camera_up_ready = false;

	self.target_position = new THREE.Vector3();
	self.target_up = new THREE.Vector3();
	self.target_x = new THREE.Vector3();

	//ADD CONTROLLS ATTENTION THAT CONTROLLS WORK PROPERLY YOU NEED TO CALL controls.update() WITHIN RENDER METHOD
	self.controls = new THREE.TrackballControls( self.camera, self.renderer.domElement );
	//DEACTIVATE USER ZOOM
	self.controls.noZoom = true;
	self.controls.noPan = true;
	//SET THE CENTER TO TRACK
	if(self.center == null){
		return (alert("CALL METHOD 'LOADING SETTINGS' TO INITIAL REQUIRED VALUES"));
	}
	self.controls.target.set( 0, 0, 0 );
}

App.prototype.addEventListener = function(){
	var self = this;

	function keydown( event ) {
		if (!self.rotationOngoing){
			self.rotationOngoing = true;
			self.camera_start = new THREE.Vector3();
			self.camera_start_up = new THREE.Vector3();
			self.camera_start_x = new THREE.Vector3();

			self.camera_start.copy(self.camera.position);
			self.camera_start_up.copy(self.camera.up);
			self.camera_start_x.copy(self.cameraX);

			var direction=null;
			if (event.keyCode==65){ //a
				direction= ROTATION.LEFT;
			}
			else if (event.keyCode==68){ //d
				direction= ROTATION.RIGHT;
			}
			else if (event.keyCode==83){ //s
				direction= ROTATION.DOWN;
			}
			else if (event.keyCode==87){ //w
				direction= ROTATION.UP;
			} else {
				self.rotationOngoing = false;
				return;
			}
			self.rotationDirection = direction;
			self.calculateTargetAndStartRotation(direction);
		}
	}

	window.addEventListener( 'keydown', keydown, false );

	//CLICK EVENT HANDLER BASED ON SEVERI
	self.renderer.domElement.addEventListener( 'click', function(event){

		event.preventDefault();
		//CONVERT MOUSE POSITION TO CORRECT VECTOR
		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		//TRANSLATES A 2D POINT FROM Normalized Device Coordinates TO RAYCASTER THAT CAN BE USED FOR PICKING
		self.projector.unprojectVector( vector, self.camera );
		//RAYCASTER IS NEEDED TO DETECT INTERACTION WITH CUBE SURFACE
		var raycaster = new THREE.Raycaster( self.camera.position, vector.sub( self.camera.position ).normalize() );
		var intersects = raycaster.intersectObjects( self.scene.children );
		//CHANGE COLOR BASED ON INTERSECTION WITH ELEMENT
		if ( intersects.length > 0 && self.logic.gameStarted==true) {
			//SELECTED OBJECT
			self.levelCubes[self.levelCubes.length-1].selectFaces(intersects[0]);
			self.logic.updateColor();
		}
	}, false );

	window.addEventListener("resize", function(){

		self.gui.resize();
		self.camera.aspect = window.innerWidth / (window.innerHeight);
		self.camera.updateProjectionMatrix();
		self.renderer.setSize(window.innerWidth, window.innerHeight);
		self.controls.handleResize();

	}, false);
}

App.prototype.removePreviousLevel = function(){
	var self = this;
	if(self.levelCubes == null && self.levelCubes.length > 0){
		console.log("levelCubes are null in class App removePreviousLevel");
		return;
	}
	//REMOVE ALL LVL EXCEPT THE LATEST NEW ONE THATS WHY length-1
	for(var i=0; i<self.levelCubes.length-1; i++){
		var lvl = self.levelCubes[i];
		lvl.destroy();
		//REMOVE THE PREVIOUS ARRAY POSITION
		self.levelCubes.splice(0,1);
	}
}

App.prototype.removeIntro = function(){
	var self = this;
	if (self.introCube!=null){
		self.introCube.destroy();
	}
}

App.prototype.introLevel = function(){
	var self = this;
	self.introCube = new Level(settings.introRows, self.scene, settings.introColors, self.debug, 0);
}

App.prototype.nextLevel = function(){
	var self = this;
	//ADD NEW ROW TO CUBE
	if(self.usedColors == settings.maxColors && self.rows == settings.maxRows){
		self.usedColors = settings.maxColors;
		self.rows = settings.maxRows;
	} else {
		self.rows++
		if(self.rows > settings.maxRows){
			self.rows = settings.rows + 1;
		}
		//INCREASE COLOR WITH EACH ROUND -> setting.row + 1 BECAUSE IT STARTS IN SETTINGS WITH 0
		if(self.rows == settings.rows + 1){
			self.usedColors++;
			if(self.usedColors > settings.maxColors){
				self.usedColors = settings.colors + 1;
			}
		}
	}

	console.log("colors " + self.usedColors + " rows" + self.rows );

	//dummy algorithm, shouldnt invest more time on prototype coz its anyway gonna change for the real produkt
	var squareNum = self.rows*self.rows*6;
	var maxHelpNum = squareNum-self.usedColors;
	var helpColors=Math.min(Math.ceil(squareNum*self.usedColors*0.05),maxHelpNum);

	//CREATE NEW CUBE
	var levelCube = new Level(self.rows, self.scene, self.usedColors, self.debug, helpColors);
	self.levelCubes.push(levelCube);
	//DESTROY PREVIOUS CUBE
	self.removePreviousLevel();
	self.initCamera();
}

//CALL THIS METHOD IF THE APPLICATION GET DESTROYED
App.prototype.terminateApplication = function(){
	var self = this;
	if(self.updateTimer){
		window.clearInterval(self.updateTimer);
		self.updateTimer = null;
	}
}

App.prototype.renderScene = function(){
	var self = this;
	if(self.fps == null){
		return (alert("CALL METHOD 'LOADING SETTINGS' TO INITIAL REQUIRED VALUES"));
	}
	//RENDER FUNCTION NEED TO BE CALLED THIS WAY OTHERWISE ERROR occurs
	var render = function () {
		requestAnimationFrame(render);
		self.renderer.render(self.scene, self.camera);

		if(self.controls != null){
			self.controls.update();
		}
		if(self.rotationOngoing==true){
			self.rotateCamera();
		}
		if(self.levelCubes[0] != null && self.levelCubes[0].cubes != null && self.logic.gameStarted){
			var cubes = self.levelCubes[0].cubes;
			for(var i=0; i<cubes.length; i++ ){
				var object = cubes[i];
				if(object instanceof Cube){
					cubes[i].moveIn();
				}
			}
		}
	}
	render();
}

App.prototype.update = function(){
	var self = this;
}

App.prototype.start = function(){
	var self = this;
	self.removeIntro();
	self.nextLevel();
	self.logic.start();
}

App.prototype.done = function(){
	var self = this;
	self.logic.done();
}

/*
 *	Rotates the camera around the cube according.
 *	FIXME:
 *		Does only turn the camera from the beginning perspective, so
 *		for example combination "left"+"up" does not work
 *		correctly
 */
App.prototype.rotateCamera = function(){
	var self = this;
	direction = this.rotationDirection;

	var axis = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();

	var axis_cam_up = new THREE.Vector3();
	var quaternion_cam_up = new THREE.Quaternion();

	var target = new THREE.Vector3( 0, 0, 0 );
	var eye = new THREE.Vector3();
	eye.subVectors( this.camera.position, target );


	var target_new = self.target_position;
	var target_up = self.target_up;
	var target_x = self.target_x;

	var angleBetweenPositions = this.camera_start.angleTo(target_new);
	var angleBetweenUp = this.camera_start_up.angleTo(target_up);

	var angle = settings.rotationSpeed;
	var angle_cam_up = settings.rotationSpeed*(angleBetweenUp/angleBetweenPositions);

	this.currentAngle+=angle;
	this.currentUpAngle+=angle_cam_up;

	if (this.currentAngle>angleBetweenPositions){
		angle-=this.currentAngle-angleBetweenPositions;
	}
	if (self.camera_up_ready==false && this.currentUpAngle>angleBetweenPositions){
		self.camera_up_ready=true;
		this.camera.up.copy(target_up);
		this.cameraX.copy(target_x);
	}

	axis.crossVectors(this.camera_start, target_new).normalize().negate();
	quaternion.setFromAxisAngle( axis, -angle );
	eye.applyQuaternion( quaternion );

	if (self.camera_up_ready==false){
		axis_cam_up.crossVectors(this.camera_start_up, target_up).normalize().negate();
		quaternion_cam_up.setFromAxisAngle( axis_cam_up, -angle_cam_up );
		this.camera.up.applyQuaternion( quaternion_cam_up );
		this.cameraX.applyQuaternion(quaternion_cam_up);
	}

	this.camera.position.addVectors(target, eye);
	this.camera.lookAt( target );

	if (this.currentAngle>=angleBetweenPositions){
		this.camera.up.copy(target_up);
		this.cameraX.copy(target_x);
		this.camera.position.copy(target_new);

		// this is needed because the length gets smaller
		// with when doing multiple turns and eventually
		// camera comes closer to the cube
		// EDIT: not needed after axis is normalized before quaternion
		//this.camera.position.setLength(self.camera_distance);

		this.rotationOngoing=false;
		this.currentAngle=0;
		this.currentUpAngle=0;
		this.rotationDirection=null;
		this.rotationOngoing=false;
		self.camera_up_ready=false;
	}
}


/*
	TODO: MAKE THIS FUNCTION CLEAN AND READABLE... :P
 */
App.prototype.calculateTargetAndStartRotation = function(direction){
	var self = this;
	var angle = Math.PI/4;
	self.target_position.copy(self.camera.position);
	self.target_up.copy(self.camera.up);
	self.target_x.copy(self.cameraX);

	rotateCameraTowardsGivenDirection = function(dir){
			var axis = new THREE.Vector3();
			var quaternion = new THREE.Quaternion();
			var target = new THREE.Vector3( 0, 0, 0 );
			var eye = new THREE.Vector3();
			eye.subVectors( self.target_position, target );

			if (dir == ROTATION.RIGHT){
				axis.copy(self.target_up);
			}
			else if (dir == ROTATION.LEFT){
				axis.copy(self.target_up).negate();
			}
			else if (dir == ROTATION.DOWN){
				axis.copy(self.target_x);
			}
			else if (dir == ROTATION.UP){
				axis.copy(self.target_x).negate();
			}

			quaternion.setFromAxisAngle( axis.normalize(), -angle );
			eye.applyQuaternion( quaternion );
			self.target_up.applyQuaternion( quaternion );
			self.target_x.applyQuaternion(quaternion);
			self.target_position.addVectors(target, eye);
		}

	if (self.isBetweenY && (direction==ROTATION.LEFT || direction==ROTATION.RIGHT) ){
		rotateCameraTowardsGivenDirection(invertDirection(self.lastVerticalDirection));
		rotateCameraTowardsGivenDirection(direction);
		rotateCameraTowardsGivenDirection(self.lastVerticalDirection);

	} else if (self.isBetweenY && self.isBetweenX && (direction==self.lastVerticalDirection) ){
		rotateCameraTowardsGivenDirection(invertDirection(self.lastVerticalDirection));
		rotateCameraTowardsGivenDirection(self.lastHorizontalDirection);
		rotateCameraTowardsGivenDirection(self.lastVerticalDirection);
		rotateCameraTowardsGivenDirection(self.lastVerticalDirection);


		self.isBetweenX=false;
	} else {
		rotateCameraTowardsGivenDirection(direction);
	}

	if (direction==ROTATION.UP || direction==ROTATION.DOWN){
		self.isBetweenY=!self.isBetweenY;
		self.lastVerticalDirection=direction;
	} else {
		self.isBetweenX=!self.isBetweenX;
		self.lastHorizontalDirection=direction;
	}
	self.rotateCamera();
}

function invertDirection (direction) {
	if (direction==ROTATION.LEFT){
		return ROTATION.RIGTH;
	}else if (direction==ROTATION.RIGHT){
		return ROTATION.LEFT;
	}else if (direction==ROTATION.UP){
		return ROTATION.DOWN;
	}else if (direction==ROTATION.DOWN){
		return ROTATION.UP;
	}
	return null;
}