var target1 = new THREE.Vector3();
target1.x=-4;
target1.y=5.656854249492377;
target1.z=4;

var start1 = new THREE.Vector3();
start1.x= 0;
start1.y= 5.656854249492381;
start1.z=5.65685424949238;

var angle1=0.5480284076203126;

var location1=false;
var location2=false;
var lastVerticalDirection=null;

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

			if (event.keyCode==65){ //a
				self.camera_start = new THREE.Vector3();
				self.camera_start.copy(self.camera.position);
				self.rotateCamera(ROTATION.LEFT);
			}
			else if (event.keyCode==68){ //d
				self.camera_start = new THREE.Vector3();
				self.camera_start.copy(self.camera.position);
				self.rotateCamera(ROTATION.RIGHT);
			}
			else if (event.keyCode==83){ //s
				self.camera_start = new THREE.Vector3();
				self.camera_start.copy(self.camera.position);
				self.rotateCamera(ROTATION.DOWN);
			}
			else if (event.keyCode==87){ //w
				self.camera_start = new THREE.Vector3();
				self.camera_start.copy(self.camera.position);
				self.rotateCamera(ROTATION.UP);
			}

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
		/*if(self.rotationOngoing==true){
			self.rotateCamera(self.rotationDirection);
		}*/
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
App.prototype.rotateCamera = function(direction){
	this.rotationDirection=direction;
	this.rotationOngoing = true;

	var angle = settings.rotationSpeed;
	this.currentAngle+=angle;
	this.currentAngle=Math.PI/4;
	angle=Math.PI/4;


	if (this.currentAngle>Math.PI/4){
		angle-=this.currentAngle-Math.PI/4;
	}

	var axis = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();

	var target = new THREE.Vector3( 0, 0, 0 );
	var eye = new THREE.Vector3();
	eye.subVectors( this.camera.position, target );
	axis.copy(this.camera.up);

	if (direction==ROTATION.DOWN){
		location1=!location1;
		lastVerticalDirection=direction;
	}
	else if (direction==ROTATION.UP){
		location1=!location1;
		lastVerticalDirection=direction;
	}else if (direction==ROTATION.LEFT){
		location2!=location2;
	}else if (direction==ROTATION.RIGHT){
		location2!=location2;
	}

	var target_array =  this.calculateTarget(direction, location1);
	var target_new = target_array[0];
	var target_up = target_array[1];
	var target_x = target_array[2];

	axis.crossVectors(this.camera_start, target_new).normalize().negate();

	angle=this.camera_start.angleTo(target_new);

	console.log("isbetween: ");
	console.log(Math.abs(location1%2)==1);
	console.log('\n');

	quaternion.setFromAxisAngle( axis, -angle );
	eye.applyQuaternion( quaternion );
	this.camera.up.applyQuaternion( quaternion );
	this.cameraX.applyQuaternion(quaternion);

	this.camera.position.addVectors(target, eye);
	this.camera.lookAt( target );

	if (true){
		this.camera.lookAt( target );
		// this.camera.up.x=0.5;
		// this.camera.up.y=0.7071067811865475;
		// this.camera.up.z=-0.5;
		this.camera.up=target_up;
		this.cameraX = target_x;
		//console.log("hop1");
		this.rotationOngoing=false;
		this.currentAngle=0;
		this.rotationDirection=null;
		return;
	}

	if (this.currentAngle>=Math.PI/4){
		this.rotationOngoing=false;
		this.currentAngle=0;
		this.rotationDirection=null;
		//console.log(this.camera.up)
		//console.log(this.camera.position)
		//console.log(this.camera.position.angleTo(this.camera_start))
		//console.log(axis)
		var vec = new THREE.Vector3();
		//console.log(vec.crossVectors(this.camera_start,this.camera.position).normalize())
	}
}

App.prototype.calculateTarget = function(direction, isBetween){
	var self = this;

	rotate = function(dir, cameraPos, cameraUp, cameraX, num, callback){
			num+=1;
			var angle = Math.PI/4;
			var axis = new THREE.Vector3();
			var quaternion = new THREE.Quaternion();
			var target = new THREE.Vector3( 0, 0, 0 );
			var eye = new THREE.Vector3();
			eye.subVectors( cameraPos, target );
			axis.copy(cameraUp);

			if (dir == ROTATION.DOWN){
				axis.copy(cameraX);
			} else if (dir == ROTATION.LEFT){
				axis.negate();
			} else if (dir == ROTATION.UP){
				axis.copy(cameraX).negate();
			}
			//
			quaternion.setFromAxisAngle( axis, -angle );
			eye.applyQuaternion( quaternion );
			cameraUp.applyQuaternion( quaternion );
			cameraX.applyQuaternion(quaternion);

			cameraPos.addVectors(target, eye);
			// this.camera.lookAt( target );
			//return [cameraPos,cameraUp,cameraX];

			if (num==1){
				callback(direction, cameraPos, cameraUp, cameraX, num, callback);
			} else if (num==2){
				callback(lastVerticalDirection, cameraPos, cameraUp, cameraX, num, callback);
			}
			return cameraPos;
		}

	var cameraPos = new THREE.Vector3();
	var cameraUp = new THREE.Vector3();
	var cameraX = new THREE.Vector3();
	cameraPos.copy(self.camera.position);
	cameraUp.copy(self.camera.up);
	cameraX.copy(self.cameraX);

	if (isBetween && (direction==ROTATION.LEFT || direction==ROTATION.RIGHT) ){
		cameraPos = rotate(invertDirection(lastVerticalDirection),cameraPos,cameraUp, cameraX, 0, rotate);
	} else {
		cameraPos = rotate(direction,cameraPos,cameraUp, cameraX, -1, null);
	}
	return [cameraPos, cameraUp, cameraX];
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