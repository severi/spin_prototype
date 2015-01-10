/*
 *	public function: Rotation.prototype.<functionName>
 * 	private function: Rotation._prototype.<functionName>
 *  private variables: self._<variableName>
 */

function Rotation(){
	var self = this;
	self._direction=  new Direction();
	self._positionInformation = new PositionInformation();
	self._startPosition= undefined;
	self._angle=undefined;
	self._targetPosition = undefined;
	self._axisForRotationOfAxises = undefined;
	self._axisForRotationOfLocation = undefined;
	self._reset();
}

Rotation.prototype.activate = function(direction, startPosition, angle) {
	var self=this;
	self._initialize(startPosition, angle, direction);
	self._active=true;
	self._update(startPosition, direction);
};

Rotation.prototype.isActive = function() {
	var self=this;
	return self._active;
};

Rotation.prototype.rotate = function(rotationSpeed, location,verticalAxis, horizontalAxis) {
	var self=this;
	if (self._active==true){
		self._applyRotation(rotationSpeed, location,verticalAxis, horizontalAxis);
	}
};

Rotation.prototype.finish = function(location, verticalAxis, horizontalAxis) {
	var self = this;
	self._setPositionToTarget(location,verticalAxis,horizontalAxis);
	self._reset(); //probably not needed anymore
};

Rotation.prototype._reset = function() {
	var self=this;
	self._angleToTargetLocation = 0;
	self._angleToTargetAxises = 0;
	self._locationAngle=0;
	self._axisAngle=0;
	self._active = false;
};

Rotation.prototype._initialize = function(startPosition, angle, direction){
	var self = this;
	self._startPosition= new Position(startPosition);
	self._direction.update(direction);
	self._angle=angle;
	self._targetPosition = self._calculateTargetPosition();
	self._axisForRotationOfAxises = new THREE.Vector3();
	self._axisForRotationOfLocation = new THREE.Vector3();
	self._reset();
};

Rotation.prototype._update = function(position) {
	var self=this;
	self._updateAxises(position.getLocation(),position.getVerticalAxis());
	self._updateAngles(position.getLocation(),position.getVerticalAxis());
	self._positionInformation.update(self._direction.getRotationDirection());
};

Rotation.prototype._updateAxises = function(location, verticalAxis) {
	var self=this;
	self._axisForRotationOfAxises.crossVectors(verticalAxis, self._targetPosition.getVerticalAxis()).normalize().negate();
	self._axisForRotationOfLocation.crossVectors(location,self._targetPosition.getLocation()).normalize().negate();
};

Rotation.prototype._updateAngles = function(location, verticalAxis) {
	var self=this;
	self._angleToTargetLocation = location.angleTo(self._targetPosition.getLocation());
	self._angleToTargetAxises = verticalAxis.angleTo(self._targetPosition.getVerticalAxis());
};


Rotation.prototype._calculateTargetPosition = function(){
	var self = this;
	if (self._positionInformation.verticalPositionIsOblique() && isHorizontalRotation(self._direction.getRotationDirection())==true ){
		var target= self._horizontalRotationFromObliqueVerticalPosition(self._direction, self._startPosition, self._angle);
		return target;
	} else if (isVerticalRotation(self._direction.getRotationDirection())==true && self._positionInformation.positionChangesFromCornerToNewSide(self._direction.getRotationDirection())==true){
		var target = self._verticalRotationFromCornerTowardsNewCubeSide(self._direction, self._startPosition, self._angle);
		return target;
	} else {
		var target = Rotation.calculateTargetPosition(self._direction.getRotationDirection(), self._startPosition, self._angle);
		return target;
	}
}

Rotation.prototype._horizontalRotationFromObliqueVerticalPosition = function(){
		var self = this;
		var targetPosition = new Position(self._startPosition);
		targetPosition = Rotation.calculateTargetPosition(invertDirection(self._direction.getLastVerticalDirection()), targetPosition, self._angle);
		targetPosition = Rotation.calculateTargetPosition(self._direction.getLastHorizontalDirection(), targetPosition, self._angle);
		targetPosition = Rotation.calculateTargetPosition(self._direction.getLastVerticalDirection(), targetPosition, self._angle);
		return targetPosition;
}

Rotation.prototype._verticalRotationFromCornerTowardsNewCubeSide = function(){
		var self = this;
		var targetPosition = new Position(self._startPosition);
		targetPosition = self._horizontalRotationFromObliqueVerticalPosition(self._direction, targetPosition, self._angle);
		targetPosition = Rotation.calculateTargetPosition(self._direction.getLastVerticalDirection(), targetPosition, self._angle);
		return targetPosition;
}

Rotation.prototype._applyRotation = function(rotationSpeed, location,verticalAxis, horizontalAxis) {
	var self=this;
	if (self._isAxisAtTarget()==false ){
		self._rotateAxis(rotationSpeed,verticalAxis, horizontalAxis);
	}
	self._rotateLocation(rotationSpeed,location);

	if (self._isLocationAtTarget()==true){
		self.finish(location, verticalAxis, horizontalAxis);
	}
};

Rotation.prototype._isAxisAtTarget = function(){
	var self=this;
	return self._axisAngle >= self._angleToTargetAxises;
};

Rotation.prototype._rotateAxis = function(rotationSpeed, verticalAxis, horizontalAxis) {
	var self = this;
	self._axisAngle+=rotationSpeed;
	Rotation.applyRotationToVector(verticalAxis, self._axisForRotationOfAxises, rotationSpeed);
	Rotation.applyRotationToVector(horizontalAxis, self._axisForRotationOfAxises, rotationSpeed);
	if(self._isAxisAtTarget()==true){
		verticalAxis.copy(self._targetPosition.getVerticalAxis());
		horizontalAxis.copy(self._targetPosition.getHorizontalAxis());
	}
};

Rotation.prototype._rotateLocation = function(rotationSpeed, location) {
	var self = this;
	self._locationAngle+=rotationSpeed;
	if (self._isLocationAtTarget()==true){
		rotationSpeed -= self._locationAngle-self._angleToTargetLocation;
	}
	Rotation.applyRotationToVector(location, self._axisForRotationOfLocation, rotationSpeed);
};

Rotation.prototype._isLocationAtTarget = function() {
	var self=this;
	return self._locationAngle >= self._angleToTargetLocation;
};

Rotation.prototype._setPositionToTarget = function(location,verticalAxis,horizontalAxis) {
	var self=this;
	verticalAxis.copy(self._targetPosition.getVerticalAxis());
	horizontalAxis.copy(self._targetPosition.getHorizontalAxis());
	location.copy(self._targetPosition.getLocation());
};


// STATIC FUNCTION
Rotation.calculateTargetPosition = function(rotationDirection, startPosition, angle) {
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

Rotation.applyRotationToVector = function(vector, axis, angle) {
	var quaternion = new THREE.Quaternion();
	var rotationAxis = new THREE.Vector3();
	rotationAxis.copy(axis); // dont want to normalize the axis-parameter directly
	quaternion.setFromAxisAngle( rotationAxis.normalize(), -angle );
	vector.applyQuaternion(quaternion);
};