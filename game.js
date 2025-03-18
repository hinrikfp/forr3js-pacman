let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let gameMSPT = 16.6;

let bgColor = "rgb(0,0,35)";

let inputDirection = "right";

function degToRad(deg) {
	return deg * Math.PI / 180
}

class Vec2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	addVec(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	}

	subVec(v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	}

	mul(n) {
		this.x *= n;
		this.y *= n;
		return this;
	}

	normalize() {
		let mag = Math.sqrt(this.x * this.x + this.y * this.y);
		this.x = this.x / mag;
		this.y = this.y / mag;
		return this;
	}

	normalized() {
		let mag = Math.sqrt(this.x * this.x + this.y * this.y);
		return new Vec2(this.x / mag, this.y / mag);
	}
}

class Pacman {
	constructor(location, speed, radius) {
		this.location = location;
		this.speed = speed;
		this.radius = radius;
		this.mouths = {
			right: [20, 340],
			left: [200, 160],
			up: [290, 250],
			down: [110, 70],
		};
	}

	draw() {
		ctx.beginPath();
		// ctx.moveTo(...this.location);
		ctx.fillStyle = "yellow";
		ctx.arc(
			this.location.x,
			this.location.y,
			this.radius,
			degToRad(this.mouths[inputDirection][0] + (Math.sin(Date.now() * 0.01) * 15.0)),
			degToRad(this.mouths[inputDirection][1] - (Math.sin(Date.now() * 0.01) * 15.0)),
		);
		ctx.lineTo(this.location.x, this.location.y);
		ctx.fill();
		ctx.stroke();
	}

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
	}
}

class Ghost {
	constructor(location, color, radius) {
		this.location = location;
		this.color = color;
		this.radius = radius;
	}

	draw() {
		ctx.beginPath();
		// ctx.moveTo(...this.location);
		ctx.fillStyle = this.color;
		ctx.arc(
			this.location.x,
			this.location.y,
			this.radius,
			degToRad(180),
			degToRad(360),
		);
		ctx.lineTo(this.location.x + this.radius, this.location.y + this.radius);
		ctx.lineTo(this.location.x - this.radius, this.location.y + this.radius);
		ctx.fill();
		ctx.stroke();
	}

	update(delta) {
		this.location.x += 10 * delta;
	}
}

class Point {
	constructor(location, worth, color, radius) {
		this.location = location;
		this.worth = worth;
		this.radius = radius;
		this.color = color;
	}

	draw() {
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(this.location.x, this.location.y, this.radius, 0, 360);
		ctx.fill();
		ctx.stroke();
	}

	update(delta) { }
}

let pacman = new Pacman(new Vec2(100, 100), 100, 15);

let gameObjects = [
	pacman,
	new Ghost(new Vec2(200, 200), "red", 15),
	new Ghost(new Vec2(250, 200), "blue", 15),
	new Point(new Vec2(100, 100), 10, "#ebcb4b", 5),
]

function drawSquare(x, y, size, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, size, size)
}

function drawBg(color) {
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
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

