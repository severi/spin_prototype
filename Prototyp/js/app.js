function App(){
	var self = this;
    //INIT 3D SCENE
    if(self.init()){
		self.addEventListener();
		self.renderScene();
		self.nextLevel();
	}
}

App.prototype.loadSettings = function(){
	var self = this;
	var tCubeRadius;
	self.fps = settings.fps;
	self.rows = settings.rows;
	self.cubeSize = settings.cubeSize;
	tCubeRadius = self.rows *0.5 * self.cubeSize;
	self.center = { x: tCubeRadius, y: tCubeRadius, z:-tCubeRadius };
}

App.prototype.init = function(){
	var self = this;
	self.levelCubes = new Array();
	//USED TO SET THE HEIGHT OF THE CANVAS VALUES IN % [0-1] e.g 0.5 means 50%;
	var hScale = 1;
	if(hScale <= 0 || hScale > 1) { 
		alert("ERROR: hScale IS OUT OF EXPECTED RANGE [0.1 - 1]"); 
		return false;
	}
	//LOADING REQUIRED SETTINGS
	self.loadSettings();
	
	//SETUP RENDERER
	self.renderer = new THREE.WebGLRenderer({antialias: true});
	self.renderer.setSize(window.innerWidth, window.innerHeight*hScale);
	self.renderer.setClearColor(0xffffff, 1);
	document.body.appendChild(self.renderer.domElement);
	
	//SETUP SCENE AND CAMERA
	self.scene = new THREE.Scene();
	self.camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * hScale), 0.1, parseInt(100));
	self.camera.position.z =  self.cubeSize * 8;

	self.projector = new THREE.Projector();
	//SETUP DEBUG OBJECT -> NEED TO BE CALLED AT LAST TO MAKE SURE ALL REQUIRED OBJECTS ARE REALLY CREATED LIKE SCENE ...
	self.debug = new Debug(self);
	//INIT SUCCESSFUL
	return true;
}

App.prototype.addEventListener = function(){
	var self = this;
	//ADD CONTROLLS ATTENTION THAT CONTROLLS WORK PROPERLY YOU NEED TO CALL controls.update() WITHIN RENDER METHOD
	self.controls = new THREE.TrackballControls( self.camera, self.renderer.domElement );
	//DEACTIVATE USER ZOOM
	self.controls.noZoom = true;
	//SET THE CENTER TO TRACK
	if(self.center == null){
		return (alert("CALL METHOD 'LOADING SETTINGS' TO INITIAL REQUIRED VALUES"));
	}
	self.controls.target.set( 0, 0, 0 );
	console.log(self.center);
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
		if ( intersects.length > 0 ) {
			//SELECTED OBJECT
			self.levelCubes[self.levelCubes.length-1].selectFaces(intersects[0]); //FIXME
		}
	}, false );

	window.addEventListener("resize", function(){

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
	}
}

App.prototype.nextLevel = function(){
	var self = this;
	var timer = window.setInterval(function(){
			//MAX ROWS ARCHIEVED
			if(self.rows >= settings.maxRows){
				console.log("MAX ROWS ARCHIEVED");
				return;
			}
			
			var cube = new Cube(self.rows, self.scene, self.debug);
			self.levelCubes.push(cube);
			self.rows+=1;
			// destroy old level
			self.removePreviousLevel();
	}, 3000);
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
	}
	render();

	var tRepeat = 1000/ self.fps;
	self.updateTimer = window.setInterval(function(){
		self.update();
	}, tRepeat);
}

App.prototype.update = function(){
	var self = this;

}