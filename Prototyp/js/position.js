function Position(a, b, c){
	var self = this;
	self.init();
	if (a instanceof THREE.Vector3){
		self._constructWithVectors(a,b,c);
	} else if (a instanceof Position){
		self._constructWithPosition(a);
	}
}

Position.prototype._constructWithVectors = function(location, vAxis, hAxis){
	var self = this;
    self.location.copy(location);
    self.verticalAxis.copy(vAxis);
    self.horizontalAxis.copy(hAxis);
}

Position.prototype._constructWithPosition = function(position){
	var self = this;
    self.copyPosition(position);
}

Position.prototype.init = function() {
	var self = this;

	self.location = new THREE.Vector3();
    self.verticalAxis = new THREE.Vector3();
    self.horizontalAxis = new THREE.Vector3();
};
Position.prototype.setLocation = function(location){
	var self = this;
	self.location.copy(location);
}

Position.prototype.getLocation = function(){
	var self = this;
	return self.location;
}

Position.prototype.setHorizontalAxis = function(axis){
	var self = this;
	self.horizontalAxis.copy(axis);
}

Position.prototype.getHorizontalAxis = function(axis){
	var self = this;
	return self.horizontalAxis;
}

Position.prototype.setVerticalAxis = function(axis){
	var self = this;
	self.verticalAxis.copy(axis);
}

Position.prototype.getVerticalAxis = function(axis){
	var self = this;
	return self.verticalAxis;
}

Position.prototype.copyPosition = function(position){
	var self = this;
	self.setLocation(position.getLocation());
	self.setHorizontalAxis(position.getHorizontalAxis());
	self.setVerticalAxis(position.getVerticalAxis());
}

Position.prototype.applyQuaternion = function(quaternion){
	var self = this;
	self.location.applyQuaternion( quaternion );
	self.verticalAxis.applyQuaternion( quaternion );
	self.horizontalAxis.applyQuaternion(quaternion);
}