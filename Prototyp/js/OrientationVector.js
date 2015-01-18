function OrientationVector(x,y,z){
	var self = this;
	self.posVector = new THREE.Vector3(x,y,z);
	THREE.Vector3.call(this,x,y,z);
}

OrientationVector.prototype = new THREE.Vector3();
OrientationVector.prototype.constructor = OrientationVector;

