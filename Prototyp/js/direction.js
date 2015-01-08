function Direction(){
	var self = this;
	self.init();
}

Direction.prototype.init = function() {
	var self = this;
	self.lastDirection = DIRECTION.UNDEFINED;
    self.lastVerticalDirection = null;
    self.lastHorizontalDirection = null;
    self.verticalCounter =0;
    self.horizontalCounter = 0;
};

Direction.prototype.updateCounters = function() {
	var self = this;
	var direction = self.getRotationDirection()
	if (self.lastDirection==DIRECTION.VERTICAL){
		self.updateVerticalCounter(direction)
	} else if (self.lastDirection==DIRECTION.HORIZONTAL){
		self.updateHorizontalCounter(direction)
	}
};

Direction.prototype.updateVerticalCounter = function(direction) {
	var self = this;
	if (direction==ROTATION.UP){
		self.verticalCounter+=1;
	} else if (direction==ROTATION.DOWN){
		self.verticalCounter-=1;
	}
	if (Math.abs(self.verticalCounter)>=2){
		self.verticalCounter=0;
		self.horizontalCounter=0;
	}
};

Direction.prototype.updateHorizontalCounter = function(direction) {
	var self = this;
	if (direction==ROTATION.LEFT){
		self.horizontalCounter+=1;
	} else if (direction==ROTATION.RIGHT){
		self.horizontalCounter-=1;
	}
	if (Math.abs(self.horizontalCounter)>=2){
		self.horizontalCounter=0;
	}
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

Direction.prototype.horizontalPositionIsOblique = function() {
	var self = this;
	return self.horizontalCounter!=0;
};

Direction.prototype.verticalPositionIsOblique = function() {
	var self = this;
	return self.verticalCounter!=0;
};

Direction.prototype.isCornerPosition = function() {
	var self = this;
	return self.verticalPositionIsOblique() && self.horizontalPositionIsOblique();
};

Direction.prototype.positionChangesFromCornerToNewSide = function(direction) {
	var self = this;
	if (self.isCornerPosition()==false){
		return false;
	}
	return  (self.verticalCounter==1 && direction==ROTATION.UP) || (self.verticalCounter==-1 && direction==ROTATION.DOWN);
};