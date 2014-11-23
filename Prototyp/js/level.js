function Level(rows, scene, colors, debug, helpColors){
	var self=this;
	this.rows = rows;
	this.cubes = [];
	self.colors = colors;
	self.percentage = settings.percentage;
	self.debug=debug;
	self.helpColors = helpColors;

	/*
	 * 	2 dimensional list including all outer faces
	 * 	structure:
	 * 		this.activeFaces[x]
	 * 							[0][1] 	= face pair forming a square
	 * 							[2]		= correct color of the square (for example faceColors.red)
	 * 							[3]		= boolean value telling whether square has been selected or not
	 * 										true: no color has been placed on square
	 * 										false:color is placed on this square
	 */
	this.activeFaces = [];
	self.placedCubeColors = {};
	self.freeCubeColors = {};
	self.currentCubeColor = undefined;

	self.freeCubeColors[faceColors.red]=0;
	self.freeCubeColors[faceColors.blue]=0;
	self.freeCubeColors[faceColors.yellow]=0;
	self.freeCubeColors[faceColors.green]=0;

	self.placedCubeColors[faceColors.red]=0;
	self.placedCubeColors[faceColors.blue]=0;
	self.placedCubeColors[faceColors.yellow]=0;
	self.placedCubeColors[faceColors.green]=0;

	self.scene = scene;
	self.generateCube();
}

/*
 * 	Add all outer faces of the newly created box to activeFaces list
 */
Level.prototype.addFacesFromBox = function(box, location){
	var self=this;
	for (var j =0; j < box.geometry.faces.length ; j++) {
		var face = box.geometry.faces[j];
		if ((location[0]==0 && face.normal.x==-1) ||
			(location[0]==self.rows -1 && face.normal.x==1) ||
			(location[1]==0 && face.normal.y==-1) ||
			(location[1]==self.rows -1 && face.normal.y==1) ||
			(location[2]==0 && face.normal.z==1) ||
			(location[2]==self.rows -1 && face.normal.z==-1)){
			this.activeFaces.push([face, box.geometry.faces[++j]]);
		}
	}
}

/*
 *	randomly generate colors for squares in activeFaces list
 */
Level.prototype.generateFaceColors = function(){
	var self = this;
	var colors = [faceColors.red,faceColors.blue,faceColors.yellow,faceColors.green];
	colors = self.shuffleArray(colors);
	if(self.colors == null){
		console.log("color Ref is null in class Cube -> make sure it was set in the constructor");
	}
	if (self.colors>colors.length){
		console.log("ERROR: Amount of colors too big - define more colors in settings.js");
		console.log("setting color amount to: "+colors.length);
		self.colors=colors.length;
	}
	while (colors.length>self.colors){
		colors.pop();
	}

	/*
	 *  Update color frequency
	 *  Instead of always having the same amount of each color,
	 *  some variation is randomly added
	 *
	 *  The algorithm might need some finetuning still :)
	 *
	 */
	var original = colors.slice();
	var c = (self.rows*self.rows*6)/self.colors;
	var max = Math.max(Math.floor(c*0.1),1);
	var num = Math.floor(Math.random()*(max+1));
	for (var i = 0; i < num; i++) {
		var tmp = original.slice();
		var idx=Math.floor(Math.random()*tmp.length);
		tmp[idx]=tmp[(idx+1) %tmp.length];
		colors=colors.concat(tmp);
	}

	// create color array that is used in inserting colors to the cube
	colorArray=[];
	for (var i =0; i < 6*self.rows*self.rows ; i++) {
		colorArray.push(colors[i%colors.length]);
	}
	colorArray=self.shuffleArray(colorArray);

	// Add color to faces and set state
	var helpColorIndexArray = [];
	for (var i =0; i < self.activeFaces.length ; i++) {
		var color=colorArray.pop();
		self.activeFaces[i].push(color);
		self.activeFaces[i].push(CUBESTATE.HIDDEN);
		self.activeFaces[i][0].color.setHex(color);
		self.activeFaces[i][1].color.setHex(color);
		self.freeCubeColors[color]++;

		helpColorIndexArray.push(i);
	}

	// get indexes of faces to be shown as help faces
	helpColorIndexArray = self.shuffleArray(helpColorIndexArray).slice(0,self.helpColors);
	for (var i = 0; i < helpColorIndexArray.length; i++) {
		var idx = helpColorIndexArray[i];
		self.activeFaces[idx][3]=CUBESTATE.ALWAYS_VISIBLE;
		self.freeCubeColors[self.activeFaces[idx][2]]--;
		self.activeFaces[idx][0].color.setHex(settings.helpColor);
		self.activeFaces[idx][1].color.setHex(settings.helpColor);
		self.activeFaces[idx][2]=settings.helpColor;
	};

}

Level.prototype.setRows = function(rows){
	self.rows = rows;
}

/*
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 *
 * copied from:
 * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 *
 * More info:
 * http://bost.ocks.org/mike/shuffle/
 */
Level.prototype.shuffleArray = function(array){
/*	console.log("----------------------------------------------------------------------")
	console.log("FIXME: does not work properly, sometimes whole side has the same color")
	console.log("----------------------------------------------------------------------")

	removed old randomnes check as it was really shitty, gonna implement a better one soon.. :)
	*/

	var self=this;
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

/*
 * 	If face is clicked, toggle between correct color and black
 */
Level.prototype.selectFaces = function(vertex){
	var self = this;

	var chosen = true; //true if square selected, false if deselected
	var oldColor;
	var color = self.currentCubeColor;

	if (color==undefined){
		throw "trying to place an undefined color on cube";
	}

	for (var i=0; i<this.activeFaces.length; i++){
		if (this.activeFaces[i][0]==vertex.face || this.activeFaces[i][1]==vertex.face){
			if (this.activeFaces[i][3]==CUBESTATE.ALWAYS_VISIBLE){
				continue;
			}
			else if (this.activeFaces[i][3]==CUBESTATE.VISIBLE){
				color=settings.defaultColor;
				this.activeFaces[i][3]=CUBESTATE.HIDDEN;
				chosen=false;
			}
			else if (this.activeFaces[i][3]==CUBESTATE.HIDDEN){
				this.activeFaces[i][3]=CUBESTATE.VISIBLE;
			}
			color = new THREE.Color(color);
			oldColor = this.activeFaces[i][0].color.getHex();
			this.activeFaces[i][0].color=color;
			this.activeFaces[i][1].color=color;
			vertex.object.geometry.colorsNeedUpdate = true;
		}
	}

	if(chosen==true){
		self.freeCubeColors[self.currentCubeColor]--;
		self.placedCubeColors[self.currentCubeColor]++;

		if(self.freeCubeColors[self.currentCubeColor]<=0){
			self.getNextColor();
		}
	}
	else {
		self.freeCubeColors[oldColor]++;
		self.placedCubeColors[oldColor]--;
	}
}


Level.prototype.generateCube = function(){
	var self = this;
	if(self.rows == null){
		return (alert("CALL METHOD 'LOADING SETTINGS' TO INITIAL REQUIRED VALUES"));
	}

	/*
	 * The correct size for a hollow cube is:
	 * 		amount of boxes in a solid cube
	 * 			minus
	 * 		amount of boxes in a smaller solid cube that precicely fits inside of the bigger cube
	 *
	 * Math:
	 * if self.rows >= 3
	 * 		amount: self.rows^3 - (self.rows-2)^3
	 * else
	 * 		amount: self.rows^3
	 *
	 * BTW this is where unit testing would be handy instead of putting  this inside of code ;)
	 */


				//self.levelCubes.push(new Cube(settings.rows));
				//self.cube = self.levelCubes[self.levelCubes.length - 1];

	//INITPOS IS CALCULATED BECAUSE OF THE MESH ORIGIN WHICH IS NORMALY [0.5, 0.5] SO YOU NEED TO CALCULATED BASED ON THE FORMULAR BELLOW
	var initPos = -self.rows * settings.cubeSize *0.5 + settings.cubeSize*0.5;
	//SET INITPOS
	var position = { x: initPos, y: initPos, z: -initPos };
	var amount=0;

	for (var x=0; x<self.rows; x++){
		//ADD A NEW CUBE X-AXIS
		for(var y=0; y<self.rows; y++){
			//ADD A NEW CUBE Y-AXIS
			for(var z=0; z<self.rows; z++){
				if ((x==0 || x==self.rows-1) || (y==0 || y==self.rows-1) || (z==0 || z==self.rows-1)) {
					amount++;
					//ADD A NEW CUBE Z-AXIS
					self.addCube( self.setOffset(position, 0, y*settings.cubeSize, -z*settings.cubeSize), [x,y,z]);
				}
			}
		}
		//UPDATE THE POSITION OF X-AXIS BASED ON CUBE SIZE
		position = self.setOffset(position, settings.cubeSize, 0 , 0);
	}
	var minus = (self.rows>2)?Math.pow(self.rows-2,3):0;
	if(settings.debug){
		console.log("amount: "+amount+ " - should be: "+( Math.pow(self.rows,3) - minus));
	}
	self.generateFaceColors();
	self.updateColors();
}


Level.prototype.setOffset = function(curValue, x, y, z){
	if(x == null){ x = 0; }
	if(y == null ){ y = 0; }
	if(z == null){ z = 0; }

	var rValue = curValue;
	if(curValue == null){
		rValue = {x: x, y: y, z:z };
	}
	return {x: (rValue.x + x), y: (rValue.y + y), z: (rValue.z + z) }
}

Level.prototype.addCube = function(position, location){
	var self = this;
	if(position == null){
		position = { x: 0, y: 0, z: 0};
	}
	//SETUP GEOMETRY AND CUBE SIZE FOR TESTING CUBE SIZE OF 1 is OK
	var cube = new Cube();
	cube.position.set(position.x, position.y, position.z);
	self.addFacesFromBox(cube, location);
	//IF PARENT CUBE EXISTS AND DEBUG MODE IS ACTIVE ADD NEW CUBE TO PARENT CUBE
	if( !settings.debug && self.debug.cube != null){
		self.debug.cube.add(cube);
		console.log("box added to parent Cube for debugging")
		return;
	}
	self.scene.add(cube);
	self.cubes.push(cube)
}

Level.prototype.destroy = function(){
	var self=this;
	var num=0;
    for (var i=0;i<self.cubes.length;i++){
    	var e, j;
		for ( j = self.scene.children.length - 1; j >= 0 ; j -- ) {
		    e = self.scene.children[ j ];
	    	if (e instanceof Cube && e==self.cubes[i]){
	    		self.scene.remove(e);
	    		num++;
	    		break;
	    	}
	    }
    }
    if(settings.debug){
    	console.log("Cube-"+self.rows+":destroyed "+num+"/"+self.cubes.length);
	}
}

Level.prototype.getNextColor = function(){
	var self = this;

	var colors=[];

	for (var key in self.freeCubeColors) {
		if (self.freeCubeColors[key]>0){
			colors.push(parseInt(key));
		}
	}
	var index = colors.indexOf(self.currentCubeColor);
	if (index > -1) {
		index++;
		var color = colors[index%colors.length];
		self.currentCubeColor=color;
		return color;
	}
	if (colors.length==0){
		self.currentCubeColor=undefined;
		return settings.defaultColor;
	}

	self.currentCubeColor=colors[0];
	return colors[0];
}

Level.prototype.getCurrentColor = function(){
	var self=this;
	return self.currentCubeColor==undefined?settings.defaultColor:self.currentCubeColor;
}

Level.prototype.hideColors = function(){
	var self = this;

	for (var i=0; i<this.activeFaces.length; i++){
		if (this.activeFaces[i][3]!=CUBESTATE.ALWAYS_VISIBLE){
			this.activeFaces[i][0].color.setHex(settings.defaultColor);
			this.activeFaces[i][1].color.setHex(settings.defaultColor);
		}
	}

	self.updateColors();
}

/**
 * This function informs meshes that the colors need to be update
 * @return {void}
 */
Level.prototype.updateColors = function(){
	var self = this;

	self.scene.traverse(function (e) {
        if (e instanceof Cube) {
            e.geometry.colorsNeedUpdate = true;
        }
    });
}

/**
 * Checks how many squares have the correct color and vice versa how many dont
 * @return {[int,int]} 1st number describes amount of correct guesses
 *                     2nd number defines amount of incorrect guesses
 */
Level.prototype.getNumberOfCorrectAndWrongColors = function(){
	var self = this;

	var correct =0;
	var wrong =0;
	for (var i=0; i<this.activeFaces.length; i++){
		var square = this.activeFaces[i];
		var color = new THREE.Color(square[2]);
		if (square[3]==CUBESTATE.VISIBLE){
			if (square[0].color.getHex()==color.getHex()){
				correct++;
			} else {
				wrong++;
			}
		}
	}
	if(settings.debug){
		console.log("correct quesses: "+ correct + ", wrong guesses: "+wrong);
	}
	return [correct,wrong];
}

Level.prototype.getTotalNumberPlayableColors = function(){
	var total =  this.rows*this.rows*6-this.helpColors;
	return total
}
