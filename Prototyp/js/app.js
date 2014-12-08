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
	//INIT CAMERA
	self.initCamera();
	self.projector = new THREE.Projector();
	//INIT SUCCESSFUL
	return true;
}

App.prototype.initCamera = function(){
	var self = this;
	//self.camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * self.hScale), 0.1, parseInt(100));
	self.camera = new Camera(self, self.hScale);
	self.camera.position.z =  self.cubeSize * 8;
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

	window.addEventListener( 'keydown', 	function ( event ) {
		if (self.startUpMenuOpen==false && !self.camera.rotationOngoing){
			if (event.keyCode==65){ //a
				self.camera.rotationDirection = ROTATION.LEFT;
			}
			else if (event.keyCode==68){ //d
				self.camera.rotationDirection = ROTATION.RIGHT;
			}
			else if (event.keyCode==83){ //s
				self.camera.rotationDirection = ROTATION.DOWN;
			}
			else if (event.keyCode==87){ //w
				self.camera.rotationDirection = ROTATION.UP;
			} else {
				return;
			}
			self.camera.rotationOngoing = true;
			self.camera.calculateTargetLocationForCameraAndAxises();
		}
	}, false );

	//CLICK EVENT HANDLER BASED ON SEVERI
	self.renderer.domElement.addEventListener( 'click', function(event){

		event.preventDefault();
		if(self.controls == null){
			console.log("ERROR in addEventListener app.js");
			return;
		}
		//IF TRACKBALL CONTROLLS ARE USED TO MOVE THE CAMERA DO NOT ALLOW FACE SELECTING OR DESELECTING
		if(self.controls.isMoving == true){
			return;
		}
		if(settings.debug){
			console.log("click Event in app.js");
		}
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
		self.camera.resize();
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
	$(window).off();
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
		if(self.startUpMenuOpen==true) {
			self.camera.rotateAroundScene();
		}
		else if(self.camera.rotationOngoing==true){
			self.camera.userRotation();
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




