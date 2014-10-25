function Logic(app){
	var self = this;
	if(app == null){
		console.log("constructor app parameter is null in Logic");
		return;
	}
	self.app = app;
}

Logic.prototype.init = function(){
	var self = this;
	if(self.app == null){
		console.log("Parameter not set in constructor");
		return false;
	}
	self.gui = self.app.gui;
	return true;
}

Logic.prototype.start = function(){
	var self = this;
	self.cube = self.app.levelCubes[self.app.levelCubes.length-1];
	if(self.app.levelCubes == null){
		console.log("Error self.app.levelCubes is null in start class Logic");
		return;
	}
	if(self.gui == null){
		console.log("Error self.curTime is null in start class Logic");
		return;
	}
	self.resetTimer();
	self.setCurrentColor();
}

Logic.prototype.resetTimer = function(){
	var self = this;
	if(self.gameTimer != null){
		window.clearInterval(self.gameTimer);
	}
	self.gameTimer = window.setInterval(function(){
		self.gui = app.gui;
		if(self.gui == null){
			console.log("Error self.gui is null in start class Logic");
			return;
		}
		//GET DISPLAYED TIME
		var time = parseInt(self.gui.curTime.html());
		//REDUCE CURRENT TIME BY 1s
		if(settings.debug){
			console.log("updateTimer " + self.gui.curTime.html());
		}
		if( time == 0){
			self.end();
			return;
		}
		//REDUCE CURRENT TIME
		time--;
		//UPDATE LABEL TIME
		self.gui.curTime.html(time);
	}, 1000); // 1 second per count
}

Logic.prototype.clearTimer = function(){
	var self = this;
	if(self.gameTimer != null){
		window.clearInterval(self.gameTimer);
		self.gameTimer = null;
	}
}

Logic.prototype.done = function(){
	var self = this;
	self.clearTimer();
	alert("TODO SHOW SHOW RESULTS VIEW + HEADER (VIEW ANIMATION => SLIDE FROM SIDE) AND CALCULATE VALUES -> METHOD done in class LOGIC");
}

Logic.prototype.end = function(){
	var self = this;
	self.clearTimer();
	alert("Game Over TODO SHOW MENU");
}

Logic.prototype.setCurrentColor = function(){
	var self = this;

	self.gui.setCurrentColor(self.cube.getNextColor());
}