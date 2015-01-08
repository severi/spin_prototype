function Direction(){
	var self = this;
	self.init();
}

Direction.prototype.init = function() {
	var self = this;

	self.rotationDirection=null;
	self.lastDirection = DIRECTION.UNDEFINED;
    self.lastVerticalDirection = null;
    self.lastHorizontalDirection = null;
};

Direction.prototype.update = function() {
	var self = this;

	if(isVerticalRotation(self.rotationDirection)){
		self.lastDirection = DIRECTION.VERTICAL;
		self.lastVerticalDirection = self.rotationDirection;
	} else if(isHorizontalRotation(self.rotationDirection)){
		self.lastDirection = DIRECTION.HORIZONTAL;
		self.lastHorizontalDirection = self.rotationDirection;
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


