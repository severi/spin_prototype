function GUI(app){
	var self = this;
	if(app == null){
		console.log("constructor app parameter is null in Logic");
		return;
	}
	self.app = app;
}

GUI.prototype.init = function(){
	var self = this;
	//NEW GAME SCREEN REF
	self.logoHeader = $(".logoHeader");
	self.newGameButton = $(".newGameButton");
	//MEMORIZE SCREEN REF
	self.prepareHeader = $(".prepareHeader");
	self.readyButton = $(".readyButton");
	//INGAME SCREEN REF
	self.curTime = $(".curTime");
	self.prepTime = $(".prepTime");
	self.curScore = $(".curScore");
	self.curColor = $(".curColor");
	self.gameHeader = $(".gameHeader");
	self.submitButton = $(".submitButton");
	//STATISTIC SCREEN REF
	self.statisticHeader = $(".statisticHeader");
	self.viewContainer = $(".viewContainer");
	self.statisticOverview = $(".statisticOverview");
	self.actionButton = $(".actionButton");
	//VALUE FIELDS
	self.requiredValue = $(".requiredValue");
	self.archievedValue = $(".archievedValue");
	self.timeLeftValue = $(".timeLeftValue");
	self.currentScoreValue = $(".currentScoreValue");
	self.bonusValue = $(".bonusValue");
	self.totalValue = $(".totalValue");
	//ACTION BUTTON TEXT
	self.actionButtonText = $(".actionButton div");
	//CHECK REFERENCES
	if(self.logoHeader == null || self.newGameButton == null || self.prepareHeader == null || self.readyButton == null || self.curTime == null || self.prepTime == null || self.curScore == null || self.curColor == null || self.gameHeader == null || self.submitButton == null || self.statisticHeader == null || self.statisticOverview == null || self.actionButton == null){
		console.log("Error ref is null in initValues class GUI");
		return false;
	}
	if(self.requiredValue == null || self.archievedValue == null || self.timeLeftValue == null || self.currentScoreValue == null || self.bonusValue == null || self.totalValue == null){
		console.log("Error ref is null in initValues class GUI --> value fields");
		return false;
	}
	//INITAL SCORE AND TIMER VALUES
	self.prepTime.html( settings.initPreTime);
	self.curTime.html( settings.initPlayTime );
	self.curScore.html( settings.initScore );
	//ADD EVENT LISTENERS
	self.addEventListener();
	self.resize();
	//INIT OK
	return true;
}

GUI.prototype.resize = function(){
	var self = this;
	self.verticalAlignView(self.statisticOverview, $(".overviewContainer"));
}

GUI.prototype.verticalAlignView = function(container, object){
	if(object == null){
		return;
	}
	var heightContainer = parseInt(container.css("height"));
	var heightObject = parseInt(object.css("height"));
	var marginTop = (heightContainer - heightObject)*0.5;
	object.css("margin-top", marginTop +"px");
}

GUI.prototype.addEventListener = function(){
	var self = this;
	//MAKE SURE ALL LISTENERS ARE REMOVED BEFORE NEW ONE ARE ADDED
	//BUTTONS CONTAIN THE CSS CLASS button TO MAKE REMOVING EVENT LISTENERS EASIER
	self.removeEventListener();
	//ADD EVENTLISTENER NEW GAME BUTTON
	if(self.newGameButton != null){
		self.newGameButton.click(function(){
			if(self.app == null){
				console.log("Error in addEventListener class GUI");
				return;
			}
			self.app.start();
		});
	}
	//ADD EVENTLISTENER READY BUTTON
	if(self.readyButton != null){
		self.readyButton.click(function(){
			if(self.app == null){
				console.log("Error in addEventListener class GUI");
				return;
			}
			self.app.logic.runGame();
		});
	}
	//ADD EVENTLISTENER DONE BUTTON
	if(self.submitButton != null){
		self.submitButton.click(function(){
			if(self.app == null){
				console.log("Error in method addEventListener class GUI");
				return;
			}
			self.app.logic.end();
		});
	}

	if(self.actionButton != null){
		self.actionButton.click(function(){
			if(self.actionButtonText == null){
				return;
			}
			if(self.currentScoreValue == null || self.curScore == null){
				return;
			}
			//SELECTION FOR NEXT STEP OF THE GAME
			if(self.actionButton.hasClass(tContinue)){
				//REMOVE CSS CLASS
				self.actionButtonText.removeClass(tContinue);
				self.toggleHeader(self.statisticHeader, self.prepareHeader);
				self.toggleButton(self.actionButton , self.readyButton);
				//HIDE VIEW
				self.hideView(self.viewContainer, 100);
				//LOAD NEXT LEVEL
				self.app.nextLevel();
				//SET SCORE LABEL
				self.curScore.html(self.totalValue.text());
			} else if(self.actionButton.hasClass(tBackToMenu)){
				//REMOVE CSS CLASS
				self.actionButton.removeClass(tBackToMenu);
				//CHANGE HEADER AND BUTTON
				self.toggleHeader(self.statisticHeader, self.logoHeader);
				self.toggleButton(self.actionButton , self.newGameButton);
				//HIDE VIEW
				self.hideView(self.viewContainer, 100);
				//LOAD INIT SETTINGS
				self.app.loadSettings();
				//LOAD INIT LEVEL BASED ON INIT SETTINGS
				self.app.nextLevel();
				//RESET SCORE LABEL
				self.curScore.html(0);
			}
		});
	}
}

GUI.prototype.translateObject = function(object, position, otherObject, callback){
	if(object == null){
		console.log("Error object is not an jQuery Ref or is null");
		return;
	}
	object.css({ "-webkit-transform" : "translate3d(" + position.x + "," + position.y + "," + position.z + ")", 
				 "transform" : "translate3d(" + position.x + "," + position.y + "," + position.z + ")" });
	if(otherObject == null){
		console.log("Error otherObject is not an jQuery Ref or is null");
		return;
	}
	object.bind("webkitTransitionEnd transitionend", function(){
		object.unbind("webkitTransitionEnd transitionend");
		otherObject.css({ 
						  "-webkit-transform" : "translate3d(0px, 0px, 0px)", 
				 		  "transform" : "translate3d(0px, 0px, 0px)"
						});
	});
	if(callback == null){
		console.log("No callback provided -> it is even not required to pass an callback as parameter GUI translateObject method");
		return;
	}
	callback();
}

GUI.prototype.toggleButton = function(object_1, object_2){
	var self = this;
	self.translateObject(object_1, {x: "0px", y: "200%", z: "0px" }, object_2);
}

GUI.prototype.toggleHeader = function(object_1, object_2){
	var self = this;
	self.translateObject(object_1, {x: "0px", y: "-200%", z: "0px" }, object_2);
}

GUI.prototype.showView = function(object){
	var self = this;
	self.translateObject(object, {x: "0px", y: "0%", z: "0px" }, null);
}

GUI.prototype.hideView = function(object, xValue){
	var self = this;
	self.translateObject(object, {x: xValue + "%", y: "0px", z: "0px" }, null);
}

GUI.prototype.removeEventListener = function(){
	var self = this;
	var buttons = $(".button");
	for (var i=0; i< buttons.length; i++){
		$(buttons[i]).off();
	};
}

GUI.prototype.setCurrentColor = function(color){
	var self = this;

	var tmp = color.toString(16);
	if (tmp.length!=6){
		tmp = "0"+tmp;
	}
	color=tmp;
	self.curColor.css("background-color","#"+color);
}

GUI.prototype.getCurrentColor = function(){
	var self = this;
	return self.curColor.css("background-color"); //rgb(x,y,z)
}

GUI.prototype.getScore = function(){
	if(this.curScore == null){
		console.log("Reference is null in class GUI getScore");
		return null;
	}
	return this.curScore.html();
}

GUI.prototype.setScore = function(score){
	if(this.curScore == null){
		console.log("Reference is null in class GUI setScore");
		return null;
	}
	this.curScore.html(score);
}

GUI.prototype.setPlayTime = function(time){
	if(this.curTime == null){
		console.log("Reference is null in class GUI setPlayTime");
		return null;
	}
	this.curTime.html(time);
}
GUI.prototype.getPlayTime = function(){
	if(this.curTime == null){
		console.log("Reference is null in class GUI getTime");
		return null;
	}
	return this.curTime.html();
}

GUI.prototype.setPrepTime = function(time){
	if(this.prepTime == null){
		console.log("Reference is null in class GUI setPrepTime");
		return null;
	}
	this.prepTime.html(time);
}

GUI.prototype.getPrepTime = function(){
	if(this.prepTime == null){
		console.log("Reference is null in class GUI setPrepTime");
		return null;
	}
	return this.prepTime.html();
}

GUI.prototype.setResult = function(result){
	var self = this;
	if(result == null){
		return;
	}
	self.requiredValue.html(result.requiredPercentage);
	self.archievedValue.html(result.archievedPercentage);
	self.timeLeftValue.html(result.timeLeft);
	self.currentScoreValue.html(result.currentScore);
	self.bonusValue.html(result.bonus);
	self.totalValue.html(result.total);
}

GUI.prototype.setActionButtonText = function(text){
	var self = this;
	if(self.actionButtonText == null){
		console.log("actionButtonText is null in setActionButtonText");
		return;
	}
	self.actionButton.addClass(text);
	self.actionButtonText.html(text);
}