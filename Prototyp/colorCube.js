function ColorCube(geometry, material){

	//CALLING THE SUPER/BASE CONSTRUCTOR WITH PARAMETERS
	THREE.Mesh.call(this, geometry, material);
}

//INHERITANCE FROM THREE.Mesh
ColorCube.prototype = new THREE.Mesh;
//SET THE NEW CONSTRUCTOR
ColorCube.prototype.constructor = ColorCube;

//ADD REQUIRED METHODS HERE
//** ColorCube INHERITS ALL AVAILABLE METHODS FROM THREE.Mesh FOR DETAILS SEE LINK BELLOW
//http://threejs.org/docs/#Reference/Objects/Mesh


/*
 *	Function changes color of selected face pair that form a square
 */
ColorCube.prototype.colorFaces = function(vertex,color){
	var face1=vertex.face;
	var geometry  = this.geometry;
	var normalValues= face1.normal;

	for (var j =0; j < geometry.faces.length ; j++) {
		var face2= geometry.faces[j];
		var fNormals= face2.normal;

		if (face1 == face2){
			continue;
		}

		if(normalValues.x == fNormals.x && normalValues.y == fNormals.y && normalValues.z == fNormals.z){
			face1.color.setHex(color);
			face2.color.setHex(color);
			geometry.colorsNeedUpdate = true;
			console.log("ColorCube.prototype.colorFaces(): Color of selected square successfully changed to: "+color);
			return true;
		}
	}

	console.log("ColorCube.prototype.colorFaces() Error: Could not find matching face for: ");
	console.log(face1);
	return false;
}
