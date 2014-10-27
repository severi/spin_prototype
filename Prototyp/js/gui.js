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
	//JQUERY REFERENCES
	self.curTime = $(".curTime");
	self.prepTime = $(".prepTime");
	self.curScore = $(".curScore");
	self.curColor = $(".curColor");
	self.doneButton = $(".doneButton");
	self.newGameButton = $(".newGameButton");
	self.readyButton = $(".readyButton");
	self.gameHeader = $(".gameHeader");
	self.logoHeader = $(".logoHeader");
	self.prepareHeader = $(".prepareHeader");
	//CHECK REFERENCES
	if(self.curTime == null || self.curScore == null || self.doneButton == null || self.newGameButton == null || self.gameHeader == null || self.logoHeader == null){
		console.log("Error ref is null in initValues class GUI");
		return false;
	}
	//INITAL SCORE AND TIMER VALUES
	self.prepTime.html( settings.initPreTime);
	self.curTime.html( settings.initPlayTime );
	self.curScore.html( settings.initScore );
	//ADD EVENT LISTENERS
	self.addEventListener();
	//INIT OK
	return true;
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
	if(self.doneButton != null){
		self.doneButton.click(function(){
			if(self.app == null){
				console.log("Error in method addEventListener class GUI");
				return;
			}
			self.app.logic.end();
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
	self.translateObject(object_1, {x: "0px", y: "250%", z: "0px" }, object_2);
}

GUI.prototype.toggleHeader = function(object_1, object_2){
	var self = this;
	self.translateObject(object_1, {x: "0px", y: "-250%", z: "0px" }, object_2);
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