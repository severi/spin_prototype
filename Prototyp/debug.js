function Debug(app){
	var self = this;
	self.app = app;
	if(settings.debug == false){
		return;
	}
	self.debugAxis();
	self.debugCube();
}

Debug.prototype.debugAxis = function(){
	
	if(settings.debug == false){
		console.log("Debug deactivated");
		return;
	}

	var self = this;
	var axes = new THREE.AxisHelper( 20 );
	self.app.scene.add(axes);
}

Debug.prototype.debugCube = function(){

	if(settings.debug == false){
		console.log("Debug deactivated");
		return;
	}

	var self = this;
	var parentDimension = settings.cubeSize * settings.rows;
	var geometry = new THREE.BoxGeometry( parentDimension, parentDimension, parentDimension);
	var material = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x000000 } );
	self.cube = new THREE.Mesh( geometry, material);
	self.cube.position.set(0, 0, 0);
	self.app.scene.add(self.cube);

}