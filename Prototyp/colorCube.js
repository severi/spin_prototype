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