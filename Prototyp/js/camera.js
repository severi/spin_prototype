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
	self.rotationAxis = new THREE.Vector3();
	self.rotationAxisForCameraAxises = new THREE.Vector3();
	self.angleToTargetPosition = new THREE.Vector3();
	self.angleToTargetVerticalAxis = new THREE.Vector3();
	self.targetPosition = new THREE.Vector3();
	self.targetVerticalAxis = new THREE.Vector3();
	self.targetHorizontalAxis = new THREE.Vector3();
	//GRID
	self.gridVectors = new Array();

	//ANIMATION REQUIRED VARIABLES
	self.haveAxisVectorsReachedTargetLocation = false;
	self.cameraHasReachedTargetPosition = false;
	self.verticalPositionIsOblique=false;
	self.horizontalPositionIsOblique=false;
	self.lastVerticalDirection=null;
	self.lastHorizontalDirection=null;
	self.angle = settings.rotationSpeed;
	self.isLockActive = false;
	//SETUP CAMERA SETTINGS
	self.fov = 75;
	self.aspect = window.innerWidth / window.innerHeight;
	self.near = 0.1;
	self.far = parseInt(100);
	self.updateProjectionMatrix();
	//RESET ROTATION VARIABLES
	self.resetRotationVariables();
	self.initGrid();
}

Camera.prototype.constructor = Camera;
Camera.prototype = new THREE.PerspectiveCamera();

Camera.prototype.resetRotationVariables = function(){
	var self = this;
	self.rotationOngoing=false;
	self.currentAngle=0;
	self.currentUpAngle=0;
	self.rotationDirection=null;
	self.haveAxisVectorsReachedTargetLocation=false;
}

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

Camera.prototype.rotateAroundScene = function(){
	var self = this;
	var angle = settings.introRotationSpeed;
	var axis = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();

	axis.copy(self.up);
	self.applyRotationToVector(self.xAxisVector, angle);
	self.applyRotationToVector(axis, angle);
	self.lookAt( self.target );
}

Camera.prototype.userRotation = function(){
	var self = this;

	if (self.haveAxisVectorsReachedTargetLocation==false ){
		self.rotateAxisVectorsTowardsTargetLocation();
		self.haveAxisVectorsReachedTargetLocation = self.currentUpAngle > self.angleToTargetVerticalAxis;
	}
	self.rotateCameraTowardsTargetLocation();
	self.cameraHasReachedTargetPosition = this.currentAngle >= self.angleToTargetPosition;
	if (self.cameraHasReachedTargetPosition==true){
		self.setPositionVectorsToTargetPosition();
		self.resetRotationVariables();
	}
}

Camera.prototype.rotateAxisVectorsTowardsTargetLocation = function() {
	var self=this;
	self.currentUpAngle+=settings.rotationSpeed;
	self.applyRotationToPositionVector(self.up, self.rotationAxisForCameraAxises, settings.rotationSpeed);
	self.applyRotationToPositionVector(self.xAxisVector, self.rotationAxisForCameraAxises, settings.rotationSpeed);

	var axisesAtTargetLocation = self.currentUpAngle>self.angleToTargetVerticalAxis;
	if(axisesAtTargetLocation==true){
		self.up.copy(self.targetVerticalAxis);
		self.xAxisVector.copy(self.targetHorizontalAxis);
	}
};

Camera.prototype.rotateCameraTowardsTargetLocation = function() {
	var self = this;
	var cAngle = settings.rotationSpeed;
	self.currentAngle += self.angle;
	if (self.currentAngle > self.angleToTargetPosition){
		cAngle -= self.currentAngle-self.angleToTargetPosition;
	}
	self.applyRotationToPositionVector(self.position, self.rotationAxis, cAngle);
	self.lookAt( self.target );
};

Camera.prototype.setPositionVectorsToTargetPosition = function() {
	var self=this;
	self.up.copy(self.targetVerticalAxis);
	self.xAxisVector.copy(self.targetHorizontalAxis);
	self.position.copy(self.targetPosition);
};

/*
	USE THIS FOR ROTATING!!!!!!
	direction= the direction of the rotation
	verticalAxis = axis that is used for left and right rotation
	horizontalAxis = axis that is used for up and down rotation
	targetPosition= 1. the current location should be given as parameter here
					2. the targetPosition will be changed to to positionVector that is achieved when currentLocation
						is rotated with the given angle to the given direction
	angle = tells how much should be rotated
 */
Camera.prototype.calculateEndPositionAfterGivenRotation = function(direction, verticalAxis, horizontalAxis, targetPosition, angle) {
	var self = this;
	var axis = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();

	if (direction == ROTATION.RIGHT){
		axis.copy(verticalAxis);
	}
	else if (direction == ROTATION.LEFT){
		axis.copy(verticalAxis).negate();
	}
	else if (direction == ROTATION.DOWN){
		axis.copy(horizontalAxis);
	}
	else if (direction == ROTATION.UP){
		axis.copy(horizontalAxis).negate();
	}

	quaternion.setFromAxisAngle( axis.normalize(), -angle );
	targetPosition.applyQuaternion( quaternion );
	verticalAxis.applyQuaternion( quaternion );
	horizontalAxis.applyQuaternion(quaternion);
};

Camera.prototype.horizontalRotationFromObliqueVerticalPosition = function(verticalDirection, horizontalDirection, verticalAxis, horizontalAxis, targetPosition, angle){
		var self = this;
		self.calculateEndPositionAfterGivenRotation(invertDirection(verticalDirection), verticalAxis, horizontalAxis, targetPosition, angle);
		self.calculateEndPositionAfterGivenRotation(horizontalDirection, verticalAxis, horizontalAxis, targetPosition, angle);
		self.calculateEndPositionAfterGivenRotation(verticalDirection, verticalAxis, horizontalAxis, targetPosition, angle);
	}

Camera.prototype.verticalRotationFromCornerTowardsNewCubeSide = function(verticalDirection, horizontalDirection, verticalAxis, horizontalAxis, targetPosition, angle){
		var self = this;
		self.horizontalRotationFromObliqueVerticalPosition(verticalDirection, horizontalDirection, self.targetVerticalAxis, self.targetHorizontalAxis, self.targetPosition, angle);
		self.calculateEndPositionAfterGivenRotation(verticalDirection, self.targetVerticalAxis, self.targetHorizontalAxis, self.targetPosition, angle);
	}

/*
	rotationDirection: direction that the cube should be rotated , example LEFT
	verticalDirection: the last used vertical direction (if rotationDirection is vertical, it is the same)
	horizontalDirection: the last used horizontal direction (if rotationDirection is horizontal, it is the same)
	verticalAxis = axis that is used for left and right rotation
	horizontalAxis = axis that is used for up and down rotation
	targetPosition= 1. the current location should be given as parameter here
					2. the targetPosition will be changed to to positionVector that is achieved when currentLocation
						is rotated with the given angle to the given direction
	angle = tells how much should be rotated
 */
Camera.prototype.calculateTargetLocation = function(rotationDirection, verticalDirection, horizontalDirection, verticalAxis, horizontalAxis, targetPosition, angle){
		var self = this;
		if (self.verticalPositionIsOblique && isHorizontalRotation(self.rotationDirection)==true ){
		self.horizontalRotationFromObliqueVerticalPosition(verticalDirection, horizontalDirection, verticalAxis, horizontalAxis, targetPosition, angle);
		} else if (self.verticalPositionIsOblique && self.horizontalPositionIsOblique && self.rotationDirection==self.lastVerticalDirection ){
			self.verticalRotationFromCornerTowardsNewCubeSide(verticalDirection, horizontalDirection, verticalAxis, horizontalAxis, targetPosition, angle);
			self.horizontalPositionIsOblique = false;
		} else {
			self.calculateEndPositionAfterGivenRotation(rotationDirection, verticalAxis, horizontalAxis, targetPosition, angle);
		}
	}

//GETS CALLED BY KEY DOWN EVENT
Camera.prototype.calculateTargetLocationForCameraAndAxises = function(){
	var self = this;
	var angle = Math.PI/4;
	self.targetPosition.copy(self.position);
	self.targetVerticalAxis.copy(self.up);
	self.targetHorizontalAxis.copy(self.xAxisVector);

	var currentVerticalDirection=self.lastVerticalDirection;
	var currentHorizontalDirection=self.lastHorizontalDirection;
	if (isVerticalRotation(self.rotationDirection)==true){
		currentVerticalDirection=self.rotationDirection;
	} else {
		currentHorizontalDirection=self.rotationDirection;
	}

	self.calculateTargetLocation(self.rotationDirection, currentVerticalDirection, currentHorizontalDirection, self.targetVerticalAxis, self.targetHorizontalAxis, self.targetPosition, angle);
	self.updateRotationVariables();
}

Camera.prototype.updateRotationVariables = function() {
	var self = this;
	if (isVerticalRotation(self.rotationDirection)==true){
		self.verticalPositionIsOblique=!self.verticalPositionIsOblique;
		self.lastVerticalDirection=self.rotationDirection;
	} else { //horizontal rotation
		self.horizontalPositionIsOblique=!self.horizontalPositionIsOblique;
		self.lastHorizontalDirection=self.rotationDirection;
	}

	self.rotationAxis.crossVectors(self.position,self.targetPosition).normalize().negate();
	self.rotationAxisForCameraAxises.crossVectors(self.up, self.targetVerticalAxis).normalize().negate();
	self.angleToTargetPosition = self.position.angleTo(self.targetPosition);
	self.angleToTargetVerticalAxis = self.up.angleTo(self.targetVerticalAxis);
};

Camera.prototype.applyRotationToVector = function(axis, angle) {
	var self = this;
	self.applyRotationToPositionVector(self.position, axis, angle);
	self.applyRotationToPositionVector(self.up, axis, angle);
};

Camera.prototype.applyRotationToPositionVector = function(position, axis, angle) {
	var quaternion = new THREE.Quaternion();
	quaternion.setFromAxisAngle( axis, -angle );
	position.applyQuaternion(quaternion);
};

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


