function Cube(rows){
	this.rows = rows;
	this.cubes = [];

	/*
	 * 	2 dimensional list including all outer faces
	 * 	structure:
	 * 		this.activeFaces[x]
	 * 							[0][1] 	= face pair forming a square
	 * 							[2]		= correct color of the square (for example faceColors.red)
	 * 							[3]		= boolean value telling whether square has been selected or not
	 * 										true: color of the square is the same as defined by index 2
	 * 										false:color of the square is black
	 */	
	this.activeFaces = [];
}

/*
 * 	Add all outer faces of the newly created box to activeFaces list
 */
Cube.prototype.addFacesFromBox = function(box, location){
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
Cube.prototype.generateFaceColors = function(){
	var self = this;
	var colors = [faceColors.red,faceColors.blue,faceColors.yellow,faceColors.green];
	colors = self.shuffleArray(colors);
	if (settings.colors>colors.length){
		console.log("ERROR: Amount of colors too big - define more colors in settings.js");
		console.log("setting color amount to: "+colors.length);
		settings.colors=colors.length;
	}
	while (colors.length>settings.colors){
		colors.pop();
	}
	colorArray=[];
	for (var i =0; i < 6*self.rows*self.rows ; i++) {
		colorArray.push(colors[i%colors.length]);
	}
	colorArray=self.shuffleArray(colorArray);

	for (var i =0; i < self.activeFaces.length ; i++) {
		var color=colorArray.pop();
		self.activeFaces[i].push(color);
		self.activeFaces[i].push(true);
		self.activeFaces[i][0].color.setHex(color);
		self.activeFaces[i][1].color.setHex(color);
	}
}

Cube.prototype.setRows = function(rows){
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
Cube.prototype.shuffleArray = function(array){
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
Cube.prototype.selectFaces = function(vertex){
	for (var i=0; i<this.activeFaces.length; i++){
		if (this.activeFaces[i][0]==vertex.face || this.activeFaces[i][1]==vertex.face){
			console.log(vertex.face);
			var color = 0x000000;
			if (this.activeFaces[i][3]==false){
				color=this.activeFaces[i][2];
				this.activeFaces[i][3]=true;
			}
			else {
				this.activeFaces[i][3]=false;
			}
			this.activeFaces[i][0].color.setHex(color);
			this.activeFaces[i][1].color.setHex(color);
			vertex.object.geometry.colorsNeedUpdate = true;
		}
	}
}
