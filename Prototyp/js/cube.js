function Cube(position){
	var self = this;
	self.geometry = new THREE.BoxGeometry( settings.cubeSize, settings.cubeSize, settings.cubeSize);
	self.material = new THREE.MeshBasicMaterial( {vertexColors: THREE.FaceColors} );
	THREE.Mesh.call(this,self.geometry, self.material);
	self.initPos = position;
	self.position.set(position.x, position.y, position.z);
}

Cube.prototype.constructor = Cube;
Cube.prototype = new THREE.Mesh();
