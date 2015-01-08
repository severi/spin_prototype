function PositionInformation(){
	var self = this;
	self.verticalCounter=0;
	self.horizontalCounter=0;
}

PositionInformation.prototype.update = function(rotation) {
	var self = this;
	if (isVerticalRotation(rotation)){
		self.updateCountersAfterVerticalRotation(rotation)
	} else if (isHorizontalRotation(rotation)){
		self.updateCountersAfterHorizontalRotation(rotation)
	}
};

PositionInformation.prototype.updateCountersAfterVerticalRotation = function(rotation) {
	var self = this;
	if (rotation==ROTATION.UP){
		self.verticalCounter+=1;
	} else if (rotation==ROTATION.DOWN){
		self.verticalCounter-=1;
	}
	if (Math.abs(self.verticalCounter)>=2){
		self.verticalCounter=0;
		self.horizontalCounter=0;
	}
};

PositionInformation.prototype.updateCountersAfterHorizontalRotation = function(rotation) {
	var self = this;
	if (rotation==ROTATION.LEFT){
		self.horizontalCounter+=1;
	} else if (rotation==ROTATION.RIGHT){
		self.horizontalCounter-=1;
	}
	if (Math.abs(self.horizontalCounter)>=2){
		self.horizontalCounter=0;
	}
};

PositionInformation.prototype.horizontalPositionIsOblique = function() {
	var self = this;
	return self.horizontalCounter!=0;
};

PositionInformation.prototype.verticalPositionIsOblique = function() {
	var self = this;
	return self.verticalCounter!=0;
};

PositionInformation.prototype.isCornerPosition = function() {
	var self = this;
	return self.verticalPositionIsOblique() && self.horizontalPositionIsOblique();
};

PositionInformation.prototype.positionChangesFromCornerToNewSide = function(rotation) {
	var self = this;
	if (self.isCornerPosition()==false){
		return false;
	}
	return  (self.verticalCounter==1 && rotation==ROTATION.UP) || (self.verticalCounter==-1 && rotation==ROTATION.DOWN);
};