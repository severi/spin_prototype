function App(){
	var self = this;

	if(self.init()){
		self.addEventListener();
		self.generateLevel(self.rows);
		self.renderScene();
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
	self.cube = new Cube(settings.rows);
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
	self.camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * hScale), 0.1, parseInt(self.rows * 10 * self.cubeSize));
	self.camera.position.z = self.rows* 5 * self.cubeSize;

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
			//var sObject = intersects[0];
			self.cube.selectFaces(intersects[0]);
			//sObject.object.colorFaces(sObject, 0x000000);
		}
	}, false );
}

App.prototype.addCube = function(position, location){
	var self = this;
	
	if(position == null){
		position = { x: 0, y: 0, z: 0};
	}
	//SETUP GEOMETRY AND CUBE SIZE FOR TESTING CUBE SIZE OF 1 is OK
	var geometry = new THREE.BoxGeometry( self.cubeSize, self.cubeSize, self.cubeSize);
	var material = new THREE.MeshBasicMaterial( {vertexColors: THREE.FaceColors } );
	var box = new ColorCube( geometry, material);
	box.position.set(position.x, position.y, position.z);
	self.cube.addFacesFromBox(box, location);
	//IF PARENT CUBE EXISTS AND DEBUG MODE IS ACTIVE ADD NEW CUBE TO PARENT CUBE
	if( !settings.debug && self.debug.cube != null){
		self.debug.cube.add(box);
		console.log("box added to parent Cube for debugging")
		return;
	}
	self.scene.add(box); 
}


// TODO: maybe move this to cube.js and eventually rename to "generateCube"
App.prototype.generateLevel = function(){

	var self = this;

	if(self.rows == null){
		return (alert("CALL METHOD 'LOADING SETTINGS' TO INITIAL REQUIRED VALUES"));
	}
	
	/*
	 * The correct size for a hollow cube is:
	 * 		amount of boxes in a solid cube 
	 * 			minus
	 * 		amount of boxes in a smaller solid cube that precicely fits inside of the bigger cube
	 *
	 * Math:
	 * if self.rows >= 3
	 * 		amount: self.rows^3 - (self.rows-2)^3
	 * else
	 * 		amount: self.rows^3
	 *
	 * BTW this is where unit testing would be handy instead of putting  this inside of code ;)
	 */
	
	//INITPOS IS CALCULATED BECAUSE OF THE MESH ORIGIN WHICH IS NORMALY [0.5, 0.5] SO YOU NEED TO CALCULATED BASED ON THE FORMULAR BELLOW
	var initPos = -settings.rows * settings.cubeSize *0.5 + settings.cubeSize*0.5;
	//SET INITPOS
	var position = { x: initPos, y: initPos, z: -initPos };
	var amount=0;
	for (var x=0; x<self.rows; x++){
		//ADD A NEW CUBE X-AXIS
		for(var y=0; y<self.rows; y++){
			//ADD A NEW CUBE Y-AXIS
			for(var z=0; z<self.rows; z++){
				if ((x==0 || x==self.rows-1) || (y==0 || y==self.rows-1) || (z==0 || z==self.rows-1)) {
					amount++;
					//ADD A NEW CUBE Z-AXIS
					self.addCube( self.setOffset(position, 0, y*self.cubeSize, -z*self.cubeSize), [x,y,z]);
				}
			}
		}
		//UPDATE THE POSITION OF X-AXIS BASED ON CUBE SIZE
		position = self.setOffset(position, self.cubeSize, 0 , 0);
	}

	var minus = (self.rows>2)?Math.pow(self.rows-2,3):0;
	console.log("amount: "+amount+ " - should be: "+( Math.pow(self.rows,3) - minus));

	self.cube.generateFaceColors();
	self.scene.traverse(function (e) {
                if (e instanceof ColorCube) {
                	e.geometry.colorsNeedUpdate = true;
                }
            });
}

App.prototype.setOffset = function(curValue, x, y, z){
	if(x == null){ x = 0; }
	if(y == null ){ y = 0; }
	if(z == null){ z = 0; }

	var rValue = curValue;
	if(curValue == null){
		rValue = {x: x, y: y, z:z };
	}	
	return {x: (rValue.x + x), y: (rValue.y + y), z: (rValue.z + z) }
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
	//CALL REQUIRED GAME LOGIC HERE
}