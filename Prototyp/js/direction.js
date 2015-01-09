function Direction(a){
	var self = this;
	self.init();
	if (a instanceof Direction){
		self._constructWithDirection(a);
	}
}

Direction.prototype._constructWithDirection = function(direction) {
	var self=this;
	self.copy(direction);
};

Direction.prototype.copy = function(direction) {
	var self=this;
	self.lastDirection = direction.lastDirection;
    self.lastVerticalDirection = direction.lastVerticalDirection;
    self.lastHorizontalDirection = direction.lastHorizontalDirection;
    self.verticalCounter = direction.verticalCounter;
    self.horizontalCounter = direction.horizontalCounter;
};

Direction.prototype.init = function() {
	var self = this;
	self.lastDirection = DIRECTION.UNDEFINED;
    self.lastVerticalDirection = null;
    self.lastHorizontalDirection = null;
    self.verticalCounter =0;
    self.horizontalCounter = 0;
};

Direction.prototype.update = function(rotationDirection) {
	var self = this;

	if(isVerticalRotation(rotationDirection)){
		self.lastDirection = DIRECTION.VERTICAL;
		self.lastVerticalDirection = rotationDirection;
	} else if(isHorizontalRotation(rotationDirection)){
		self.lastDirection = DIRECTION.HORIZONTAL;
		self.lastHorizontalDirection = rotationDirection;
	} else {
		self.lastDirection = DIRECTION.UNDEFINED;
	}
}

Direction.prototype.getLastDirection =  function(){
	var self = this;
	if (self.lastDirection==DIRECTION.VERTICAL){
		return self.lastVerticalDirection;
	} else if (self.lastDirection==DIRECTION.HORIZONTAL){
		return self.lastHorizontalDirection;
	}
	return undefined;
}

Direction.prototype.getLastVerticalDirection =  function(){
	var self = this;
	return self.lastVerticalDirection;
}
Direction.prototype.getLastHorizontalDirection =  function(){
	var self = this;
	return self.lastHorizontalDirection;
}

Direction.prototype.getRotationDirection =  function(){
	var self = this;
	if (self.lastDirection==DIRECTION.VERTICAL){
		return self.lastVerticalDirection;
	} else if (self.lastDirection==DIRECTION.HORIZONTAL){
		return self.lastHorizontalDirection;
	}
	throw "No rotation direction defined!!!"
	return null;
}