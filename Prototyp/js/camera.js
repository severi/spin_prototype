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

	self.positionInformation = new PositionInformation();

	self.direction = new Direction();

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
		dont confuse rotationDirection with direction parameter used in functions below.
		rotationDirection is an enum
		direction is instance of Direction class (not used in this function)
 */
Camera.prototype.calculateEndPositionAfterGivenRotation = function(rotationDirection, startPosition, angle) {
	var self = this;
	var axis = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();
	var targetPosition = new Position(startPosition);

	if (rotationDirection == ROTATION.RIGHT){
		axis.copy(targetPosition.getVerticalAxis());
	}
	else if (rotationDirection == ROTATION.LEFT){
		axis.copy(targetPosition.getVerticalAxis()).negate();
	}
	else if (rotationDirection == ROTATION.DOWN){
		axis.copy(targetPosition.getHorizontalAxis());
	}
	else if (rotationDirection == ROTATION.UP){
		axis.copy(targetPosition.getHorizontalAxis()).negate();
	}

	quaternion.setFromAxisAngle( axis.normalize(), -angle );
	targetPosition.applyQuaternion( quaternion );
	return targetPosition;
};

Camera.prototype.horizontalRotationFromObliqueVerticalPosition = function(direction, startPosition, angle){
		var self = this;
		var targetPosition = new Position(startPosition);
		targetPosition = self.calculateEndPositionAfterGivenRotation(invertDirection(direction.getLastVerticalDirection()), targetPosition, angle);
		targetPosition = self.calculateEndPositionAfterGivenRotation(direction.getLastHorizontalDirection(), targetPosition, angle);
		targetPosition = self.calculateEndPositionAfterGivenRotation(direction.getLastVerticalDirection(), targetPosition, angle);
		return targetPosition;
	}

Camera.prototype.verticalRotationFromCornerTowardsNewCubeSide = function(direction, startPosition, angle){
		var self = this;
		var targetPosition = new Position(startPosition);
		targetPosition = self.horizontalRotationFromObliqueVerticalPosition(direction, targetPosition, angle);
		targetPosition = self.calculateEndPositionAfterGivenRotation(direction.getLastVerticalDirection(), targetPosition, angle);
		return targetPosition;
	}

/*
	direction: instance of Direction
	startPosition = instance of Position (includes, horizontal and vertical axises, and also the locations. See position.js)
	angle = tells how much should be rotated
 */
Camera.prototype.calculateTargetLocation = function(direction, startPosition, angle){
		var self = this;
		if (self.positionInformation.verticalPositionIsOblique() && isHorizontalRotation(direction.getRotationDirection())==true ){
			var target= self.horizontalRotationFromObliqueVerticalPosition(direction, startPosition, angle);
			return target;
		} else if (isVerticalRotation(direction.getRotationDirection())==true && self.positionInformation.positionChangesFromCornerToNewSide(direction.getRotationDirection())==true){
			var target = self.verticalRotationFromCornerTowardsNewCubeSide(direction, startPosition, angle);
			return target;
		} else {
			var target = self.calculateEndPositionAfterGivenRotation(direction.getRotationDirection(), startPosition, angle);
			return target;
		}
	}

//GETS CALLED BY KEY DOWN EVENT
Camera.prototype.calculateTargetLocationForCameraAndAxises = function(){
	var self = this;
	var angle = Math.PI/4;
	self.targetVerticalAxis.copy(self.up);
	self.targetHorizontalAxis.copy(self.xAxisVector);

	var current = new Position(self.position, self.targetVerticalAxis, self.targetHorizontalAxis);
	var target = self.calculateTargetLocation(self.direction, current, angle);

	self.targetVerticalAxis.copy(target.getVerticalAxis());
	self.targetHorizontalAxis.copy(target.getHorizontalAxis());
	self.targetPosition.copy(target.getLocation());
	self.updateRotationVariables();
}

Camera.prototype.setRotationDirection = function(direction){
	var self = this;
	self.direction.update(direction);
}

Camera.prototype.updateRotationVariables = function() {
	var self = this;

	self.positionInformation.update(self.direction.getRotationDirection());

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


