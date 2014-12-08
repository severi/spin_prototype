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

Camera.prototype.calculateTargetLocationForCameraAndAxises = function(){
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
			self.horizontalPositionIsOblique = false;
		} else {
			calculateEndPositionAfterGivenRotation(self.rotationDirection);
		}
	}

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

	calculateTargetLocation();
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

Camera.prototype.setPositionVectorsToTargetPosition = function() {
	var self=this;
	self.up.copy(self.targetVerticalAxis);
	self.xAxisVector.copy(self.targetHorizontalAxis);
	self.position.copy(self.targetPosition);
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

Camera.prototype.lockToGridFromVector = function(vector){
	var self = this;
	
	if(self.isLockActive == false){
		var angle = Math.acos( self.up.dot(vector) );
		var quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle(self.up, angle);
		self.position.applyQuaternion(quaternion);
		self.lookAt( self.target );
	}
	//USED TO PREVENT 2 TIMES CALL -> TRACKBALL.JS IS SENDING FEEDBACK TWICE BUT IT SHOULD BE ONLY 1 TIME
	self.isLockActive = self.isLockActive ? false : true;
}


