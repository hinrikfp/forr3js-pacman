let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let gameMSPT = 16.6;

let bgColor = "rgb(0,0,35)";

let inputDirection = "right";

function degToRad(deg) {
	return deg * Math.PI / 180
}

let pacman = {
	location: { x: 100, y: 100 },
	facing: [0, 1],
	speed: 100,
	mouths: {
		right: [20, 340],
		left: [200, 160],
		up: [290, 250],
		down: [110, 70],
	},
	draw() {
		ctx.beginPath();
		// ctx.moveTo(...this.location);
		ctx.fillStyle = "yellow";
		ctx.arc(
			this.location.x,
			this.location.y,
			20,
			degToRad(this.mouths[inputDirection][0] + (Math.sin(Date.now() * 0.01) * 15.0)),
			degToRad(this.mouths[inputDirection][1] - (Math.sin(Date.now() * 0.01) * 15.0)),
		);
		ctx.lineTo(this.location.x, this.location.y);
		ctx.fill();
		ctx.stroke();
	},
	update(delta) {
		switch (inputDirection) {
			case "right":
				this.location.x += this.speed * delta;
				break;
			case "left":
				this.location.x -= this.speed * delta;
				break;
			case "up":
				this.location.y -= this.speed * delta;
				break;
			case "down":
				this.location.y += this.speed * delta;
				break;
		}
	},
}

class Ghost {
	constructor(location, color) {
		this.location = location,
		this.color = color,
	}

	draw() {
		ctx.beginPath();
		ctx.fillStyle = color;
	}
}

let gameObjects = [
	pacman,
]

function drawSquare(x, y, size, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, size, size)
}

function drawBg(color) {
	ctx.fillStyle = color;
	ctx.fillRect(0,0,canvas.width, canvas.height);
}

function gameInput(event) {
	if (event.defaultPrevented) { return; }

	switch (event.key) {
		case "ArrowRight":
			inputDirection = "right";
			break;
		case "ArrowLeft":
			inputDirection = "left";
			break;
		case "ArrowUp":
			inputDirection = "up";
			break;
		case "ArrowDown":
			inputDirection = "down";
			break;
	}
}

function drawGame() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBg(bgColor);
	gameObjects.forEach((obj) => obj.draw())
}

function gameUpdate(delta) {
	gameObjects.forEach((obj) => obj.update(delta))

	drawGame()
}

function start() {
	document.addEventListener("keydown", gameInput);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx.scale(1, 1);
}

start();
let interval = setInterval(gameUpdate, gameMSPT, gameMSPT / 1000);

