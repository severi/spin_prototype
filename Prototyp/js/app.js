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

	self.camera_x = new THREE.Vector3();
	self.camera_x.x=1;
	self.verticalPositionIsOblique=false;
	self.horizontalPositionIsOblique=false;
	self.lastVerticalDirection=null;
	self.lastHorizontalDirection=null;
	self.haveAxisVectorsReachedTargetLocation = false;

	self.targetPosition = new THREE.Vector3();
	self.targetVerticalAxis = new THREE.Vector3();
	self.targetHorizontalAxis = new THREE.Vector3();

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
		if (self.startUpMenuOpen==false && !self.rotationOngoing){
			if (event.keyCode==65){ //a
				self.rotationDirection= ROTATION.LEFT;
			}
			else if (event.keyCode==68){ //d
				self.rotationDirection= ROTATION.RIGHT;
			}
			else if (event.keyCode==83){ //s
				self.rotationDirection= ROTATION.DOWN;
			}
			else if (event.keyCode==87){ //w
				self.rotationDirection= ROTATION.UP;
			} else {
				return;
			}
			self.rotationOngoing = true;

			self.rotationAxis = new THREE.Vector3();
			self.rotationAxisForCameraAxises = new THREE.Vector3();
			self.angleToTargetPosition = new THREE.Vector3();
			self.angleToTargetVerticalAxis = new THREE.Vector3();

			self.calculateTargetLocationForCameraAndAxises();
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
	self.startUpMenuOpen=false;
}

App.prototype.introLevel = function(){
	var self = this;
	self.introCube = new Level(settings.introRows, self.scene, settings.introColors, self.debug, 0);
	self.startUpMenuOpen=true;
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

		if(self.controls != null && self.startUpMenuOpen==false){
			self.controls.update();
		}
		if(self.rotationOngoing==true){
			self.handleCameraRotation();
		} else if(self.startUpMenuOpen==true) {
			self.startUpScreenRotation();
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

App.prototype.startUpScreenRotation = function() {
	var self = this;
	var angle = settings.introRotationSpeed;
	var axis = new THREE.Vector3();
	var target = new THREE.Vector3( 0, 0, 0 );
	var quaternion = new THREE.Quaternion();

	axis.copy(this.camera.up);
	self.applyRotationToCameraVectorsAtStartUpMenu(new THREE.Vector3(1,0,0), angle);
	self.applyRotationToCameraVectorsAtStartUpMenu(axis, angle);
	this.camera.lookAt( target );
};

App.prototype.applyRotationToCameraVectorsAtStartUpMenu = function(axis, angle) {
	var self = this;
	self.applyRotationToPositionVector(this.camera.position, axis, angle);
	self.applyRotationToPositionVector(this.camera.up, axis, angle);
	self.applyRotationToPositionVector(this.camera_x, axis, angle);
};

App.prototype.applyRotationToPositionVector = function(position, axis, angle) {
	var quaternion = new THREE.Quaternion();
	quaternion.setFromAxisAngle( axis, -angle );
	position.applyQuaternion(quaternion);
};

App.prototype.handleCameraRotation = function(){
	var self = this;

	if (self.haveAxisVectorsReachedTargetLocation==false ){
		self.rotateAxisVectorsTowardsTargetLocation();
		self.haveAxisVectorsReachedTargetLocation = this.currentUpAngle>this.angleToTargetVerticalAxis;
	}

	self.rotateCameraTowardsTargetLocation();

	var cameraHasReachedTargetPosition = this.currentAngle>=self.angleToTargetPosition;
	if (cameraHasReachedTargetPosition==true){
		this.setPositionVectorsToTargetPosition();
		this.resetRotationVariables();
	}
}

App.prototype.rotateCameraTowardsTargetLocation = function() {
	var self =this;

	var angle = settings.rotationSpeed;
	this.currentAngle+=angle;
	if (this.currentAngle>self.angleToTargetPosition){
		angle-=this.currentAngle-self.angleToTargetPosition;
	}
	self.applyRotationToPositionVector(this.camera.position, self.rotationAxis, angle);
	var target = new THREE.Vector3( 0, 0, 0 );
	this.camera.lookAt( target );
};

App.prototype.rotateAxisVectorsTowardsTargetLocation = function() {
	var self=this;
	this.currentUpAngle+=settings.rotationSpeed;
	self.applyRotationToPositionVector(this.camera.up, self.rotationAxisForCameraAxises, settings.rotationSpeed);
	self.applyRotationToPositionVector(this.camera_x, self.rotationAxisForCameraAxises, settings.rotationSpeed);

	var axisesAtTargetLocation = this.currentUpAngle>self.angleToTargetVerticalAxis;
	if(axisesAtTargetLocation==true){
		this.camera.up.copy(self.targetVerticalAxis);
		this.camera_x.copy(self.targetHorizontalAxis);
	}
};

App.prototype.setPositionVectorsToTargetPosition = function() {
	var self=this;
	this.camera.up.copy(self.targetVerticalAxis);
	this.camera_x.copy(self.targetHorizontalAxis);
	this.camera.position.copy(self.targetPosition);
};

App.prototype.resetRotationVariables = function(){
	this.rotationOngoing=false;
	this.currentAngle=0;
	this.currentUpAngle=0;
	this.rotationDirection=null;
	this.rotationOngoing=false;
	this.haveAxisVectorsReachedTargetLocation=false;
}

App.prototype.calculateTargetLocationForCameraAndAxises = function(){
	var self = this;

	verticalRotationFromCornerTowardsNewCubeSide = function(){
		horizontalRotationFromObliqueVerticalPosition();
		calculateEndPositionAfterGivenRotation(currentVerticalDirection);
	}

	horizontalRotationFromObliqueVerticalPosition = function(){
		calculateEndPositionAfterGivenRotation(invertDirection(currentVerticalDirection));
		calculateEndPositionAfterGivenRotation(currentHorizontalDirection);
		calculateEndPositionAfterGivenRotation(currentVerticalDirection);
	}

	calculateEndPositionAfterGivenRotation = function(rotation){
			var axis = new THREE.Vector3();
			var quaternion = new THREE.Quaternion();

			if (rotation == ROTATION.RIGHT){
				axis.copy(self.targetVerticalAxis);
			}
			else if (rotation == ROTATION.LEFT){
				axis.copy(self.targetVerticalAxis).negate();
			}
			else if (rotation == ROTATION.DOWN){
				axis.copy(self.targetHorizontalAxis);
			}
			else if (rotation == ROTATION.UP){
				axis.copy(self.targetHorizontalAxis).negate();
			}

			quaternion.setFromAxisAngle( axis.normalize(), -angle );
			self.targetPosition.applyQuaternion( quaternion );
			self.targetVerticalAxis.applyQuaternion( quaternion );
			self.targetHorizontalAxis.applyQuaternion(quaternion);
	}

	calculateTargetLocation = function(){
		if (self.verticalPositionIsOblique && isHorizontalRotation(self.rotationDirection)==true ){
		horizontalRotationFromObliqueVerticalPosition();
		} else if (self.verticalPositionIsOblique && self.horizontalPositionIsOblique && self.rotationDirection==self.lastVerticalDirection ){
			verticalRotationFromCornerTowardsNewCubeSide();
			self.horizontalPositionIsOblique=false;
		} else {
			calculateEndPositionAfterGivenRotation(self.rotationDirection);
		}
	}

	var angle = Math.PI/4;
	self.targetPosition.copy(self.camera.position);
	self.targetVerticalAxis.copy(self.camera.up);
	self.targetHorizontalAxis.copy(self.camera_x);

	var currentVerticalDirection=self.lastVerticalDirection;
	var currentHorizontalDirection=self.lastHorizontalDirection;
	if (isVerticalRotation(self.rotationDirection)==true){
		currentVerticalDirection=self.rotationDirection;
	} else {
		currentHorizontalDirection=self.rotationDirection;
	}

	calculateTargetLocation();
	self.updateCameraRotationVariables();
}

App.prototype.updateCameraRotationVariables = function() {
	var self = this;
	if (isVerticalRotation(self.rotationDirection)==true){
		self.verticalPositionIsOblique=!self.verticalPositionIsOblique;
		self.lastVerticalDirection=self.rotationDirection;
	} else { //horizontal rotation
		self.horizontalPositionIsOblique=!self.horizontalPositionIsOblique;
		self.lastHorizontalDirection=self.rotationDirection;
	}

	self.rotationAxis.crossVectors(self.camera.position,self.targetPosition).normalize().negate();
	self.rotationAxisForCameraAxises.crossVectors(self.camera.up, self.targetVerticalAxis).normalize().negate();
	self.angleToTargetPosition = this.camera.position.angleTo(self.targetPosition);
	self.angleToTargetVerticalAxis = this.camera.up.angleTo(self.targetVerticalAxis);
};