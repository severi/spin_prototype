var settings = {
	fps : 60,
	rows : 1,
	cubeSize : 1,
	debug: false,
	showGrid : true,
	alwaysWin: true,
	colors: 1,
	maxColors: 4,
	maxRows: 4,
	initPlayTime: 60,
	initPreTime: 30,
	initScore: 0,
	stage: 1,
	defaultColor : 0xffffff,
	requiredPercentage: 60,
	scorePerFace : 1,
	introRows : 3,
	introColors : 4,
	helpColor : 0xD9DDE1,
	rotationSpeed : 0.25,
	outlineColor: 0xecf0f1,
	introRotationSpeed : 0.01,
	cameraZOffeset : 8,
	staticMovement : false,
	linewidth: 2
};

var faceColors = {
		red: 0xf64747,
		yellow: 0xf9bf3b,
		green: 0x03c9a9,
		blue: 0x19b5fe,
};

var tBackToMenu = "back to menu";
var tContinue = "next level";
var tStatistic = "statistic";
var tGameOver = "game over";

var CUBESTATE = {
  HIDDEN : {value: 0, name: "HIDDEN"},
  VISIBLE: {value: 1, name: "VISIBLE"},
  ALWAYS_VISIBLE : {value: 2, name: "Always visible"}
};

var ROTATION = {
	LEFT : 0,
	RIGHT: 1,
	UP : 2,
	DOWN : 3
}

var DIRECTION = {
	VERTICAL : 2,
	HORIZONTAL: 1,
	UNDEFINED: 0
}

