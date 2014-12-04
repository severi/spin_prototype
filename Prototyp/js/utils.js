function invertDirection (direction) {
	if (direction==ROTATION.LEFT){
		return ROTATION.RIGTH;
	}else if (direction==ROTATION.RIGHT){
		return ROTATION.LEFT;
	}else if (direction==ROTATION.UP){
		return ROTATION.DOWN;
	}else if (direction==ROTATION.DOWN){
		return ROTATION.UP;
	}
	return null;
}