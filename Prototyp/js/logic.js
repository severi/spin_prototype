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
	self.showNewColor();
}

Logic.prototype.resetTimer = function(){
	var self = this;
	if(self.gameTimer != null){
		window.clearInterval(self.gameTimer);
	}
	var timerObject = null;
	self.gameTimer = window.setInterval(function(){
		if(self.gui == null){
			console.log("Error self.gui is null in start class Logic");
			return;
		}
		//GET CURRENT DISPLAYED TIMER VARIABLE AND VALUE -> SET THE REFERENCE FOR timerObject DEPENDING ON APPLICATION STATE
		var time = null;
		if( self.gameStarted == false){
			timerObject = self.gui.prepTime;
			time = parseInt(self.app.gui.getPrepTime());
		} else {
			timerObject = self.gui.curTime;
			time = parseInt(self.app.gui.getPlayTime());
		}
		//REDUCE CURRENT TIME BY 1s
		if(settings.debug){
			console.log(timerObject);
			console.log("updateTimer " + timerObject.html());
		}
		//IF THE GAME STATE DIDNT START == IN PREPARE MODE OR THE TIME GETS 0 START THE GAME 
		if( self.gameStarted==false && time == 0){
			self.runGame();
			return;
		}
		//IF TIME BECOMES 0 THE GAME ENDS
		if( time == 0){
			self.end();
			self.gameStarted=false;
			return;
		}
		//REDUCE CURRENT TIME
		time--;
		//UPDATE LABEL TIME
		if( self.gameStarted == false){
			self.app.gui.setPrepTime(time);
			return;
		}
		self.app.gui.setPlayTime(time);
	}, 1000); // 1 second per count
}

Logic.prototype.runGame = function(){
	var self = this;
	if( self.gameStarted==false ){
		var gui = self.app.gui;
		//HEADER AND BUTTON ANIMATION
		gui.toggleButton(gui.readyButton , gui.submitButton);
		gui.toggleHeader(gui.prepareHeader, gui.gameHeader);
		//remove cube colors;
		gui.setPlayTime(settings.initPlayTime);
		self.cube.hideColors();
		self.gameStarted=true;
	}
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
	var result = self.calculateResult();
	var gui = self.gui;
	gui.setResult(result);
	if(result.archievedPercentage < result.requiredPercentage && settings.alwaysWin==false){
		gui.setActionButtonText(tBackToMenu);
		return;
	}
	gui.setActionButtonText(tContinue);
}

Logic.prototype.end = function(){
	var self = this;
	self.clearTimer();
	self.gameStarted = false;
	//HEADER AND BUTTON ANIMATION
	var gui = self.app.gui;
	gui.toggleButton(gui.submitButton, gui.actionButton);
	gui.toggleHeader(gui.gameHeader, gui.statisticHeader);
	gui.showView(gui.viewContainer);
	self.done();
}

Logic.prototype.calculateResult = function(){
	var self = this;
	var gui = self.app.gui;
	var maxNumber = self.cube.getTotalNumberPlayableColors();
	var array = self.cube.getNumberOfCorrectAndWrongColors();
	//RESULT JSON
	var result = {
					requiredPercentage : settings.requiredPercentage,
					archievedPercentage : 0,
					timeLeft : 0,
					currentScore : 0,
					bonus : 0,
					total : 0
				 };

	result.archievedPercentage = parseInt(array[0] / maxNumber * 100);
	result.timeLeft = gui.getPlayTime();
	result.currentScore = parseInt(gui.getScore()) + parseInt(array[0] * settings.scorePerFace);
	result.bonus = result.timeLeft * settings.scorePerFace - (array[1] * settings.scorePerFace);
	if(result.bonus <= 0 ){
		result.bonus = 0;
	}
	result.total = parseInt(result.currentScore) + parseInt(result.bonus);
	if(result.total <= 0 ){
		result.total = 0;
	}
	console.log(result);
	return result;
}

Logic.prototype.updateColor = function(){
	var self = this;
	self.gui.setCurrentColor(self.cube.getCurrentColor());
}

Logic.prototype.showNewColor = function(){
	var self = this;
	var color = self.cube.getNextColor();
	self.gui.setCurrentColor(color);
}