function Cube(){
	var self = this;
	self.geometry = new THREE.BoxGeometry( settings.cubeSize, settings.cubeSize, settings.cubeSize);
	self.material = new THREE.MeshBasicMaterial( {vertexColors: THREE.FaceColors} );
	THREE.Mesh.call(this,self.geometry, self.material);
}

Cube.prototype.constructor = Cube;
Cube.prototype = new THREE.Mesh();
