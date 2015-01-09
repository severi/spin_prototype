function Camera(app, hScale){
	var self = this;
	self.app = app;
	//CALL SUPER CONSTRUCTOR
	THREE.PerspectiveCamera.call(this);
	//AXIS VECTORS
	self.xAxisVector = new THREE.Vector3(1, 0, 0);
	self.yAxisVector = new THREE.Vector3(0, 1, 0);
	self.zAxisVector = new THREE.Vector3(0, 0, 1);
	//UTILITY VECTORS
	self.target = new THREE.Vector3(0, 0, 0);
	self.zero = new THREE.Vector3();
	self.currentRotation = new Rotation();

	//GRID
	self.gridVectors = new Array();

	self.isLockActive = false;
	//SETUP CAMERA SETTINGS
	self.fov = 75;
	self.aspect = window.innerWidth / window.innerHeight;
	self.near = 0.1;
	self.far = parseInt(100);
	self.updateProjectionMatrix();
	self.initGrid();
}

Camera.prototype.constructor = Camera;
Camera.prototype = new THREE.PerspectiveCamera();

Camera.prototype.initGrid = function(){
	var self = this;
	if(self.app == null || self.gridVectors == null){
		return;
	}
	if(self.gridVectors){
		self.gridVectors.slice(0, self.gridVectors.length-1);
	}
	//LOCAL VARIABLES
	var value = settings.cubeSize * settings.cameraZOffeset;
	var rows = self.app.rows;
	var radius = settings.cubeSize * self.app.rows;
	var angle45 = 45*Math.PI/180;
	var angle54 = 54*Math.PI/180;
	//X AXIS RELATIED
	self.gridVectors.push( new THREE.Vector3(value,0,0));
	self.gridVectors.push( new THREE.Vector3(-value,0,0));
	self.gridVectors.push( new THREE.Vector3(value,0,0).applyAxisAngle(self.xAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(-value,0,0).applyAxisAngle(self.xAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(value,0,0).applyAxisAngle(self.yAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(-value,0,0).applyAxisAngle(self.yAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(value,0,0).applyAxisAngle(self.zAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(-value,0,0).applyAxisAngle(self.zAxisVector, angle45));
	// //Y AXIS RELATIED
	self.gridVectors.push( new THREE.Vector3(0,value,0));
	self.gridVectors.push( new THREE.Vector3(0,-value,0));
	self.gridVectors.push( new THREE.Vector3(0,value,0).applyAxisAngle(self.xAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,-value,0).applyAxisAngle(self.xAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,value,0).applyAxisAngle(self.yAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,-value,0).applyAxisAngle(self.yAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,value,0).applyAxisAngle(self.zAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,-value,0).applyAxisAngle(self.zAxisVector, angle45));
	// //Z AXIS RELATIED
	self.gridVectors.push( new THREE.Vector3(0,0,value));
	self.gridVectors.push( new THREE.Vector3(0,0,-value));
	self.gridVectors.push( new THREE.Vector3(0,0,value).applyAxisAngle(self.zAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,0,-value).applyAxisAngle(self.zAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,0,value).applyAxisAngle(self.yAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,0,-value).applyAxisAngle(self.yAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,0,value).applyAxisAngle(self.xAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,0,-value).applyAxisAngle(self.xAxisVector, angle45));
	//DIAGONALS
	self.gridVectors.push( new THREE.Vector3(0,0,value).applyAxisAngle(self.yAxisVector, angle54 ).applyAxisAngle(self.zAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,0,-value).applyAxisAngle(self.yAxisVector, angle54 ).applyAxisAngle(self.zAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,0,value).applyAxisAngle(self.yAxisVector, -angle54 ).applyAxisAngle(self.zAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,0,-value).applyAxisAngle(self.yAxisVector, -angle54 ).applyAxisAngle(self.zAxisVector, angle45));
	self.gridVectors.push( new THREE.Vector3(0,0,value).applyAxisAngle(self.yAxisVector, -angle54 ).applyAxisAngle(self.zAxisVector, -angle45));
	self.gridVectors.push( new THREE.Vector3(0,0,-value).applyAxisAngle(self.yAxisVector, -angle54 ).applyAxisAngle(self.zAxisVector, -angle45));
	self.gridVectors.push( new THREE.Vector3(0,0,value).applyAxisAngle(self.yAxisVector, angle54 ).applyAxisAngle(self.zAxisVector, -angle45));
	self.gridVectors.push( new THREE.Vector3(0,0,-value).applyAxisAngle(self.yAxisVector, angle54 ).applyAxisAngle(self.zAxisVector, -angle45));

	if(settings.showGrid){
		var material = new THREE.LineBasicMaterial({ color: 0x0000ff });
		for(var i=0; i<self.gridVectors.length; i++){

			var geometry = new THREE.Geometry();
			geometry.vertices.push(
				new THREE.Vector3( 0, 0, 0 ),
				self.gridVectors[i]);
			var line = new THREE.Line( geometry, material );
			self.app.scene.add( line );
		}
	}
}

Camera.prototype.checkDistancesToGridVectors = function(vector){
	var self = this;
	if(self.gridVectors == null){
		return;
	}
	var distance=0;
	var vec = new THREE.Vector3();
	for(var i=0; i< self.gridVectors.length; i++){
		var gridVector = self.gridVectors[i];
		var gridDistance = vector.distanceTo(gridVector);
		if(i==0 || gridDistance <= distance){
			distance = gridDistance;
			vec.copy(gridVector);
		}
	}
	self.position.copy(vec);
	self.lookAt(self.target);
}

Camera.prototype.resize = function(){
	var self = this;
	self.aspect = window.innerWidth / (window.innerHeight);
	self.updateProjectionMatrix();
}

Camera.prototype.lockToGrid = function(start, end){
	var self = this;

	if(self.isLockActive == false){
		self.checkDistancesToGridVectors(self.position);
	}
	//USED TO PREVENT 2 TIMES CALL -> TRACKBALL.JS IS SENDING FEEDBACK TWICE BUT IT SHOULD BE ONLY 1 TIME
	self.isLockActive = self.isLockActive ? false : true;
}

Camera.prototype.activateRotation = function(direction) {
	var self=this;
	var angle = Math.PI/4;
	var currentPosition = new Position(self.position, self.up, self.xAxisVector);
	self.currentRotation.activate(direction, currentPosition, angle);
};

Camera.prototype.userRotation = function(){
	var self = this;
	self.currentRotation.rotate(settings.rotationSpeed, self.position,self.up, self.xAxisVector);
	self.lookAt(self.target);
}

Camera.prototype.finishRotation = function() {
	var self=this;
	self.currentRotation.finish(self.position,self.up, self.xAxisVector);
};

Camera.prototype.isRotationActive = function() {
	var self=this;
	return self.currentRotation.isActive();
};

Camera.prototype.rotateAroundScene = function(){
	var self = this;
	var angle = settings.introRotationSpeed;
	if(self.currentRotation.isActive()==true){
		self.currentRotation.rotate(angle, self.position,self.up, self.xAxisVector);
		self.lookAt(self.target);
	} else {
		self.activateRotation(Math.floor((Math.random() * 4))); // random direction
	}
};