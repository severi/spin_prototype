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
	self.controls.target.set( self.center.x, self.center.y, self.center.z );

	//CLICK EVENT HANDLER BASED ON SEVERI
	self.renderer.domElement.addEventListener( 'mousedown', function(event){
		
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
			var sObject = intersects[0];
			var cColor = 0x000000
			sObject.face.color.setHex(cColor);
			sObject.object.geometry.colorsNeedUpdate = true;
			normalValues = intersects[0].face.normal;

			for(var i=0; i< sObject.object.geometry.faces.length; i++){
				var face = sObject.object.geometry.faces[i];
				var fNormals = face.normal;

				if(normalValues.x == fNormals.x && normalValues.y == fNormals.y && normalValues.z == fNormals.z){
					face.color.setHex(cColor);
				}	
			}
		}
	}, false );
}

App.prototype.addCube = function(position, color){
	var self = this;
	
	if(position == null){
		position = { x: 0, y: 0, z: 0};
	}
	//SETUP GEOMETRY AND CUBE SIZE FOR TESTING CUBE SIZE OF 1 is OK
	var geometry = new THREE.BoxGeometry( self.cubeSize, self.cubeSize, self.cubeSize);
	var material = new THREE.MeshBasicMaterial( {color: color, vertexColors: THREE.FaceColors } );
	var cube = new ColorCube( geometry, material);
	cube.position.set(position.x, position.y, position.z);
	self.scene.add(cube); 
}

App.prototype.generateLevel = function(){

	var self = this;

	if(self.rows == null){
		return (alert("CALL METHOD 'LOADING SETTINGS' TO INITIAL REQUIRED VALUES"));
	}

	var position = { x: 0, y:0, z:0 };
	
	for(var x=1; x<= self.rows; x++){
		//ADD A NEW CUBE X-AXIS
		self.addCube(position, 0xff0000);
		for(var y=0; y<self.rows; y++){
			//ADD A NEW CUBE Y-AXIS
			self.addCube( self.setOffset(position, 0, y*self.cubeSize), 0x00ff00  );
			for(var z=0; z<self.rows; z++){
				//ADD A NEW CUBE Z-AXIS
				if(x == 1 || x == self.rows){
					self.addCube( self.setOffset(position, 0, y*self.cubeSize, -z*self.cubeSize), 0x0000ff );
				}
				else if(z == self.rows-1 || y == 0 || y == self.rows-1){
					self.addCube( self.setOffset(position, 0, y*self.cubeSize, -z*self.cubeSize), 0x0000ff );
				}
			}
		}
		//UPDATE THE POSITION OF X-AXIS BASED ON CUBE SIZE
		position = self.setOffset(position, self.cubeSize, 0 , 0);
	}
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