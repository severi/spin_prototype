function Logic(app){
	var self = this;
	if(app == null){
		console.log("Parameter not set in constructor");
		return false;
	}
	self.app = app;
	return true;
}

Logic.prototype.start = function(){
	var self = this;
	self.cube = self.app.levelCubes;
	if(self.app.levelCubes == null){
		console.log("Error self.app.levelCubes is null in start class Logic");
	}
	self.curTime = settings.maxPlayTime;
	self.resetTimer();
}

Logic.prototype.resetTimer = function(){
	var self = this;
	if(self.gameTimer != null){
		window.clearInterval(self.gameTimer);
	}
	self.gameTimer = window.setInterval(function(){
		self.curTime--;
		if(settings.debug){
			console.log("updateTimer " + self.curTime);
		}
		if(self.curTime == 0){
			self.end();
		}
	}, 1000); // 1 second per count
}

Logic.prototype.clearTimer = function(){
	var self = this;
	if(self.gameTimer != null){
		window.clearInterval(self.gameTimer);
		self.gameTimer = null;
	}
}

Logic.prototype.end = function(){
	var self = this;
	self.clearTimer();
	alert("TIME IS OUT GAME DONE");
}