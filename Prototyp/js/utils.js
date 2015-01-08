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

function isVerticalRotation(rotation){
	return rotation==ROTATION.UP || rotation==ROTATION.DOWN;
}

function isHorizontalRotation(rotation){
	return rotation==ROTATION.LEFT || rotation==ROTATION.RIGHT;
}

function convertKeyCodeToDirection(code){
	if (code==65){ //a
		return ROTATION.LEFT;
	}
	else if (code==68){ //d
		return ROTATION.RIGHT;
	}
	else if (code==83){ //s
		return ROTATION.DOWN;
	}
	else if (code==87){ //w
		return ROTATION.UP;
	} else {
		return undefined;
	}
}