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
	self.curTime = $(".curTime");
	self.curScore = $(".curScore");
	self.doneButton = $(".doneButton");
	self.newGameButton = $(".newGameButton");
	self.gameHeader = $(".gameHeader");
	self.logoHeader = $(".logoHeader");
	//CHECK REFERENCES
	if(self.curTime == null || self.curScore == null || self.doneButton == null || self.newGameButton == null || self.gameHeader == null || self.logoHeader == null){
		console.log("Error ref is null in initValues class GUI");
		return false;
	}
	self.curTime.html( settings.initPlayTime );
	self.curScore.html( settings.initScore );
	//INIT LOGIC
	self.logic = new Logic(self.app);
	if(!self.logic.init()){
		console.log("Error during init in class app method init -> logic returnt false");
		return false;
	}
	self.addEventListener();
	//INIT OK
	return true;
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
}

GUI.prototype.addEventListener = function(){
	var self = this;
	//MAKE SURE ALL LISTENERS ARE REMOVED BEFORE NEW ONE ARE ADDED
	//BUTTONS CONTAIN THE CSS CLASS button TO MAKE REMOVING EVENT LISTENERS EASIER
	self.removeEventListener();
	//ADD EVENTLISTENER NEW GAME BUTTON
	if(self.newGameButton != null){
		self.newGameButton.click(function(){
			if(self.logic == null){
				console.log("Error in addEventListener class GUI");
				return;
			}
			self.translateObject(self.logoHeader, {x: "0px", y: "-200%", z: "0px" }, self.gameHeader);
			self.translateObject(self.newGameButton, {x: "0px", y: "200%", z: "0px" }, self.doneButton);
			self.logic.start();
		});
	}
	//ADD EVENTLISTENER DONE BUTTON
	if(self.doneButton != null){
		self.doneButton.click(function(){
			if(self.logic == null){
				console.log("Error in method addEventListener class GUI");
				return;
			}
			self.translateObject(self.gameHeader, {x: "0px", y: "-200%", z: "0px" }, null);
			self.translateObject(self.doneButton, {x: "0px", y: "200%", z: "0px" }, null);
			alert("TODO SHOW RESULT VIEW IN WHEN YOU CLICK ON DONEBUTTON -> need TO BE IMPLEMENDED IN GUI");
			self.logic.done();
		});
	}
}

GUI.prototype.removeEventListener = function(){
	var self = this;
	var buttons = $(".button");
	for (var i=0; i< buttons.length; i++){
		$(buttons[i]).off();
	};
}

