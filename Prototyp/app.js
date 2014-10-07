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
	self.activeFaces = [];
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

	if (settings.axes==true){
		var axes = new THREE.AxisHelper( 20 );
		self.scene.add(axes);
	}
	
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
			var sObject = intersects[0];
			sObject.object.colorFaces(sObject, 0x000000);
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
	var cube = new ColorCube( geometry, material);
	cube.position.set(position.x, position.y, position.z);
	self.scene.add(cube); 

	for (var j =0; j < cube.geometry.faces.length ; j++) {
		var face = cube.geometry.faces[j];
		j++; // TODO: not really a good way of finding the faces for square
		var face2 = cube.geometry.faces[j];
		if ((location[0]==0 && face.normal.x==-1)){
			self.activeFaces.push([face,face2]);
		}
		if (location[0]==self.rows -1 && face.normal.x==1){
			self.activeFaces.push([face,face2]);
		}
		if ((location[1]==0 && face.normal.y==-1)){
			self.activeFaces.push([face,face2]);
		}
		if (location[1]==self.rows -1 && face.normal.y==1){
			self.activeFaces.push([face,face2]);
		}
		if ((location[2]==0 && face.normal.z==1)){
			self.activeFaces.push([face,face2]);
		}
		if (location[2]==self.rows -1 && face.normal.z==-1){
			self.activeFaces.push([face,face2]);
		}
	}

}

App.prototype.generateFaceColors = function(){
	var self = this;
	var colors = [faceColors.red,faceColors.blue,faceColors.yellow,faceColors.green];
	colors = self.shuffleArray(colors);
	if (settings.colors>colors.length){
		console.log("ERROR: Amount of colors too big - define more colors in settings.js");
		console.log("setting color amount to: "+colors.length);
		settings.colors=colors.length;
	}
	while (colors.length>settings.colors){
		colors.pop();
	}
	colorArray=[];
	for (var i =0; i < 6*self.rows*self.rows ; i++) {
		colorArray.push(colors[i%colors.length]);
	}
	colorArray=self.shuffleArray(colorArray);

	var self = this;
	for (var i =0; i < self.activeFaces.length ; i++) {
		var color=colorArray.pop();
		self.activeFaces[i][0].color.setHex(color);
		self.activeFaces[i][1].color.setHex(color);
	}
}

/*
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 *
 * copied from:
 * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 *
 * More info:
 * http://bost.ocks.org/mike/shuffle/
 */
App.prototype.shuffleArray = function(array){
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

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

	var position = { x: 0, y:0, z:0 };
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

	self.generateFaceColors();
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