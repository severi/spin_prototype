function Cube(rows, scene, debug){
	var self=this;
	this.rows = rows;
	this.cubes = [];

	self.debug=debug;

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
	self.scene = scene;
	self.generateCube();
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
	var self=this;
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    if (!self.checkArrayRandomness(array)){
    	self.shuffleArray(array);
    }
    return array;
}

Cube.prototype.checkArrayRandomness = function(array){
	var self = this;
	var counter=0;
	var currentColor=undefined;
	for (var i=0; i<array.length;i++){
		if (array[i]==currentColor){
			counter++;
		}
		else {
			counter=0;
		}
		if (counter>=self.rows*self.rows){
			console.log("!!!!!!!!!!!!!!!1")
			return false;
		}
		currentColor=array[i];
	}
	return true;
}

/*
 * 	If face is clicked, toggle between correct color and black
 */
Cube.prototype.selectFaces = function(vertex){
	for (var i=0; i<this.activeFaces.length; i++){
		if (this.activeFaces[i][0]==vertex.face || this.activeFaces[i][1]==vertex.face){
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


Cube.prototype.generateCube = function(){
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
	console.log("amount: "+amount+ " - should be: "+( Math.pow(self.rows,3) - minus));
	self.generateFaceColors();
	self.scene.traverse(function (e) {
        if (e instanceof THREE.Mesh) {
            e.geometry.colorsNeedUpdate = true;
        }
    });
   	
}


Cube.prototype.setOffset = function(curValue, x, y, z){
	if(x == null){ x = 0; }
	if(y == null ){ y = 0; }
	if(z == null){ z = 0; }

	var rValue = curValue;
	if(curValue == null){
		rValue = {x: x, y: y, z:z };
	}	
	return {x: (rValue.x + x), y: (rValue.y + y), z: (rValue.z + z) }
}

Cube.prototype.addCube = function(position, location){
	var self = this;
	
	if(position == null){
		position = { x: 0, y: 0, z: 0};
	}
	//SETUP GEOMETRY AND CUBE SIZE FOR TESTING CUBE SIZE OF 1 is OK
	var geometry = new THREE.BoxGeometry( settings.cubeSize, settings.cubeSize, settings.cubeSize);
	var material = new THREE.MeshBasicMaterial( {vertexColors: THREE.FaceColors} );
	var box = new THREE.Mesh( geometry, material);
	box.position.set(position.x, position.y, position.z);
	self.addFacesFromBox(box, location);
	//IF PARENT CUBE EXISTS AND DEBUG MODE IS ACTIVE ADD NEW CUBE TO PARENT CUBE
	
	
	if( !settings.debug && self.debug.cube != null){
		self.debug.cube.add(box);
		console.log("box added to parent Cube for debugging")
		return;
	}
	self.scene.add(box);
	self.cubes.push(box)
}

Cube.prototype.destroy = function(){
	var self=this;
	var num=0;
    for (var i=0;i<self.cubes.length;i++){
    	var e, j;
		for ( j = self.scene.children.length - 1; j >= 0 ; j -- ) {
		    e = self.scene.children[ j ];
	    	if (e instanceof THREE.Mesh && e==self.cubes[i]){
	    		self.scene.remove(e);
	    		num++;
	    		break;
	    	}
	    }
    }
    console.log("Cube-"+self.rows+":destroyed "+num+"/"+self.cubes.length);
}