function Logic(app){
	var self = this;
	if(app == null){
		console.log("constructor app parameter is null in Logic");
		return;
	}
	self.gameStarted =false;
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
		if(self.gui == null){
			console.log("Error self.gui is null in start class Logic");
			return;
		}
		//GET DISPLAYED TIME
		var time = parseInt(self.gui.getTime());
		//REDUCE CURRENT TIME BY 1s
		if(settings.debug){
			console.log("updateTimer " + self.gui.curTime.html());
		}

		if( self.gameStarted==false && time == 0){
			//remove cube colors;
			self.gui.setTime(settings.initPlayTime);
			self.cube.hideColors();
			preGameTime=false;
			self.gameStarted=true;
			return;
		}

		if( time == 0){
			self.end();
			self.gameStarted=false;
			return;
		}
		//REDUCE CURRENT TIME
		time--;
		//UPDATE LABEL TIME
		self.gui.setTime(time);
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
	var score = self.calculatePoints();
	self.gui.setScore(score);
	console.log("score: "+score)
	console.log("TODO SHOW SHOW RESULTS VIEW + HEADER (VIEW ANIMATION => SLIDE FROM SIDE) AND CALCULATE VALUES -> METHOD done in class LOGIC");
}

Logic.prototype.end = function(){
	var self = this;

	self.done();
	console.log("Game Over TODO SHOW MENU");
}

Logic.prototype.calculatePoints = function(){
	var self = this;

	var array = self.cube.getNumberOfCorrectAndWrongColors();
	return array[0]-array[1];
}


Logic.prototype.setCurrentColor = function(){
	var self = this;

	self.gui.setCurrentColor(self.cube.getNextColor());
}

Logic.prototype.revertColor = function(color){
	var self=this;
	self.cube.revertColor(color);
}