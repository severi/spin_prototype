function Cube(position){
	var self = this;
	self.geometry = new THREE.BoxGeometry( settings.cubeSize, settings.cubeSize, settings.cubeSize);
	self.material = new THREE.MeshBasicMaterial( {vertexColors: THREE.FaceColors, wireframe:false} );
	THREE.Mesh.call(this,self.geometry, self.material);
	if(position != null){
		self.endPos = position;
		self.position.set(position.x, position.y, position.z);
	}
	//GET THE SIZE FROM SETTINGS -> CENTER IS IN THE MIDDLE THATS WHY WE NEED THE HALF WIDTH + SOME TOLERANCE TO MAKE THE LINE VISIBLE
	var halfSize = settings.cubeSize * 0.5 + 0.005;
	//SETUP THE CUBE
	self.outlineGeometry = new THREE.Geometry();
	self.outlineGeometry.vertices.push(new THREE.Vector3(halfSize,  halfSize, 	halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(-halfSize, halfSize, 	halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(-halfSize, -halfSize, 	halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(halfSize, -halfSize, 	halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(halfSize,  halfSize, 	halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(halfSize, halfSize, 	-halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(halfSize, -halfSize, 	-halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(halfSize, -halfSize, 	halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(halfSize,  halfSize, 	halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(-halfSize,  halfSize, 	halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(-halfSize, halfSize, 	halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(-halfSize, -halfSize, 	halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(-halfSize, -halfSize, 	-halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(halfSize, -halfSize, 	-halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(-halfSize, -halfSize, 	-halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(-halfSize, halfSize, 	-halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(halfSize, 	halfSize, 	-halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(-halfSize, halfSize, 	-halfSize));
	self.outlineGeometry.vertices.push(new THREE.Vector3(-halfSize, halfSize, 	halfSize));
	//SETUP THE USED MATERIAL FOR THE OUTLINE GEOMETRY
	self.outlineMaterial = new THREE.LineBasicMaterial({
	    color: 0xecf0f1,
	});
	//GENERATE AND ADD THE OUTLINE MESH TO THE CUBE MESH ITSELF
	self.outlineMesh = new THREE.Line(self.outlineGeometry, self.outlineMaterial);
    self.add(self.outlineMesh);
}

Cube.prototype.constructor = Cube;
Cube.prototype = new THREE.Mesh();

Cube.prototype.moveIn = function(){
	var self = this;
}
