let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let gameMSPT = 16.6;

let bgColor = "rgb(0,0,35)";

let inputDirection = "right";
const DIRECTIONS = [
	"right",
	"left",
	"up",
	"down",
]

let ongoingTouches = new Map();

let wallEditOn = true;
let lastAddedWall;

function degToRad(deg) {
	return deg * Math.PI / 180
}

function weightedRandom(values, weights) {
	let weightSum = 0;
	weights.forEach((w) => weightSum += w);

}

class Vec2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	addVec(v) {
		return new Vec2(this.x + v.x, this.y + v.y);
	}

	subVec(v) {
		return new Vec2(this.x - v.x, this.y - v.y);
	}

	mul(n) {
		return new Vec2(this.x * n, this.y * n);
	}

	magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	normalize() {
		this.x = this.x / this.magnitude();
		this.y = this.y / this.magnitude();
		return this;
	}

	normalized() {
		let mag = Math.sqrt(this.x * this.x + this.y * this.y);
		return new Vec2(this.x / mag, this.y / mag);
	}
}

class Pacman {
	tag = "Pacman";
	shouldCollide = true;
	constructor(position, speed, radius) {
		this.position = position;
		this.speed = speed;
		this.radius = radius;
		this.points = 0;
		this.direction = "right";

		this.mouths = {
			right: [20, 340],
			left: [200, 160],
			up: [290, 250],
			down: [110, 70],
		};
	}

	draw() {
		ctx.beginPath();
		// ctx.moveTo(...this.position);
		ctx.fillStyle = "yellow";
		ctx.arc(
			this.position.x,
			this.position.y,
			this.radius,
			degToRad(this.mouths[inputDirection][0] + (Math.sin(Date.now() * 0.01) * 15.0)),
			degToRad(this.mouths[inputDirection][1] - (Math.sin(Date.now() * 0.01) * 15.0)),
		);
		ctx.lineTo(this.position.x, this.position.y);
		ctx.fill();
		ctx.stroke();
	}

	update(delta) {
		this.direction = inputDirection;
		switch (this.direction) {
			case "right":
				this.position.x += this.speed * delta;
				break;
			case "left":
				this.position.x -= this.speed * delta;
				break;
			case "up":
				this.position.y -= this.speed * delta;
				break;
			case "down":
				this.position.y += this.speed * delta;
				break;
		}
	}

	collision(c) {
		// console.log(`collision with ${c.tag}`)
		if (c.tag === "Point") {
			this.points += c.worth;
			c.delete();
			// console.log(`points: ${this.points}`);
		}
		if (c.tag === "Wall") {
			// console.log("Wall");
		}
	}
}

class CollisionChecker {
	tag = "CollisionChecker";
	shouldCollide = true;
	constructor(position, radius) {
		this.position = position;
		this.radius = radius;
	}

	draw() { }
	update(delta) { }
	collision(c) { }

	isColliding() {
		return collisionsForObject(this, game.gameObjects, (c1, c2) => { }, (c1, c2) => { });
	}
}

class Ghost {
	tag = "Ghost";
	shouldCollide = true;
	constructor(position, color, radius, speed) {
		this.position = position;
		this.color = color;
		this.radius = radius;
		this.speed = speed;
		this.direction = "left";
		this.directionCheckers = {
			up: new CollisionChecker(position.addVec(new Vec2(0, -this.radius * 2))),
			down: new CollisionChecker(position.addVec(new Vec2(0, this.radius * 2))),
			right: new CollisionChecker(position.addVec(new Vec2(this.radius * 2, 0))),
			left: new CollisionChecker(position.addVec(new Vec2(-this.radius * 2, 0))),
		}
	}

	draw() {
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(
			this.position.x,
			this.position.y,
			this.radius,
			degToRad(180),
			degToRad(360),
		);
		ctx.lineTo(this.position.x + this.radius, this.position.y + this.radius);
		ctx.lineTo(this.position.x - this.radius, this.position.y + this.radius);
		ctx.fill();
		ctx.stroke();
	}

	update(delta) {
		switch (this.direction) {
			case "right":
				this.position.x += this.speed * delta;
				break;
			case "left":
				this.position.x -= this.speed * delta;
				break;
			case "up":
				this.position.y -= this.speed * delta;
				break;
			case "down":
				this.position.y += this.speed * delta;
				break;
		}
	}

	collision(c) {
		// console.log(`collision with ${c.tag}`)
		if (c.tag === "Wall") {
			let new_direction = DIRECTIONS[Math.floor(Math.random() * 4)];
			this.direction = new_direction;
		}
	}
}

class Point {
	tag = "Point";
	shouldCollide = true;
	constructor(position, worth, color, radius) {
		this.position = position;
		this.worth = worth;
		this.radius = radius;
		this.color = color;
	}

	draw() {
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 360);
		ctx.fill();
		ctx.stroke();
	}

	update(delta) { }

	collision(c) {
		// console.log(`collision with ${c.tag}`)
		if (c.tag == "Wall") {
			this.delete();
		}
	}

	delete() {
		game.gameObjects.splice(game.gameObjects.indexOf(this), 1);
	}
}

class Wall {
	tag = "Wall"
	shouldCollide = true;
	constructor(position, width, height, color) {
		this.position = position;
		this.width = width;
		this.height = height;
		this.color = color;
	}

	draw() {
		ctx.fillStyle = this.color;
		let x = this.position.x - this.width / 2;
		let y = this.position.y - this.height / 2;
		ctx.fillRect(x, y, this.width, this.height);
	}

	update(delta) { }

	collision(c) { }
}

class Grid {
	tag = "Grid";
	shouldCollide = false;
	constructor(position, width, height, spacing) {
		this.position = position;
		this.width = width;
		this.height = height;
		this.spacing = spacing;
	}

	draw() {
		ctx.fillStyle = "blue";
		for (let x = 0; x <= this.width; x += this.spacing) {
			ctx.fillRect(this.position.x + x, this.position.y, 1, this.height);
		}
		for (let y = 0; y <= this.height; y += this.spacing) {
			ctx.fillRect(this.position.x, this.position.y + y, this.width, 1);
		}
	}

	update(delta) { }
	collision(c) { }
}

let grid = new Grid(new Vec2(10, 10), 540, 540, 30);

class Game {
	constructor() {
		this.pacman = new Pacman(new Vec2(100, 100), 100, 15);
		this.ghosts = [
			new Ghost(new Vec2(200, 200), "red", 15, 60),
			new Ghost(new Vec2(250, 200), "pink", 15, 80),
			new Ghost(new Vec2(300, 200), "cyan", 15, 65),
			new Ghost(new Vec2(350, 200), "orange", 15, 70),
		];
		this.points = []
		for (let x = 0; x < 17; x++) {
			for (let y = 0; y < 17; y++) {
				this.points.push(new Point(new Vec2(40 + x * 30, 40 + y * 30), 10, "#ebcb4b", 5))
			}
		}
		this.walls = [
			new Wall(new Vec2(10, 280), 20, 560, "green"),
			new Wall(new Vec2(280, 550), 560, 20, "green"),
			new Wall(new Vec2(280, 10), 560, 20, "green"),
			new Wall(new Vec2(550, 280), 20, 560, "green"),
		];

		this.gameObjects = [];
		this.gameObjects.push(this.pacman);
		this.gameObjects.push(grid);
		this.ghosts.forEach((g) => { this.gameObjects.unshift(g) });
		this.points.forEach((p) => { this.gameObjects.unshift(p) });
		this.walls.forEach((w) => { this.gameObjects.unshift(w) });
	}

	draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawBg(bgColor);
		game.gameObjects.forEach((obj) => obj.draw())
	}

	collide() {
		checkCollisions(
			this.gameObjects,
			(c1, c2) => {
				c1.collision(c2);
				c2.collision(c1);
			},
			(c1, c2) => {
				switch (c1.direction) {
					case "left":
						c1.position.x = c2.position.x + (c2.width / 2) + c1.radius;
						break;
					case "right":
						c1.position.x = c2.position.x - (c2.width / 2) - c1.radius;
						break;
					case "up":
						c1.position.y = c2.position.y + (c2.height / 2) + c1.radius;
						break;
					case "down":
						c1.position.y = c2.position.y - (c2.height / 2) - c1.radius;
						break;
				}
				c1.collision(c2);
				c2.collision(c1);
			}
		);
	}

	update(delta) {
		game.gameObjects.forEach((obj) => obj.update(delta));

		this.collide();

		this.draw();
	}
}

let game = new Game();

function checkCollisions(collisionObjects, onCircleCollision, onRectCollision) {
	for (let i = 0; i < collisionObjects.length; i++) {
		c1 = collisionObjects[i];
		if (c1.shouldCollide === false) {
			continue;
		}
		for (let j = i + 1; j < collisionObjects.length; j++) {
			c2 = collisionObjects[j];
			if (c2.shouldCollide === false) {
				continue;
			}
			checkForCollision(c1, c2, onCircleCollision, onRectCollision);
		}
	}
}

function checkForCollision(c1, c2, onCircleCollision, onRectCollision) {
	let collides = false;
	if (isCircle(c1) && isCircle(c2)) {
		let totalRadius = c1.radius + c2.radius;
		let distance = c1.position.subVec(c2.position).magnitude();
		if (distance <= totalRadius) {
			onCircleCollision(c1, c2);
			collides = true;
		}
	} else if (isCircle(c1) && isRect(c2)) {
		if (checkCircleRectCollision(c1, c2)) {
			onRectCollision(c1, c2);
			collides = true;
		}
	} else if (isRect(c1) && isCircle(c2)) {
		if (checkCircleRectCollision(c2, c1)) {
			onRectCollision(c2, c1);
			collides = true;
		}
	}
	return collides;
}

function checkCircleRectCollision(c, r) {
	return (
		c.position.x > (r.position.x - (r.width / 2) - c.radius) &&
		c.position.x < (r.position.x + (r.width / 2) + c.radius) &&
		c.position.y > (r.position.y - (r.height / 2) - c.radius) &&
		c.position.y < (r.position.y + (r.height / 2) + c.radius)
	)
}

function collisionsForObject(c1, collisionObjects, onCircleCollision, onRectCollision) {
	let collides = false;
	if (c1.shouldCollide === false) {
		return false;
	}
	if (c1.hasOwnProperty("radius")) {
		for (let c2 of collisionObjects) {
			if (c2 === c1) {
				continue;
			}
			if (c2.shouldCollide === false) { continue; }
			if (c2.hasOwnProperty("radius")) {
				let totalRadius = c1.radius + c2.radius;
				let distance = c1.position.subVec(c2.position).magnitude();
				if (distance <= totalRadius) {
					onCircleCollision(c1, c2);
					collides = true;
				}
			} else if (c2.hasOwnProperty("width") && c2.hasOwnProperty("height")) {
				if (
					c1.position.x > (c2.position.x - (c2.width / 2) - c1.radius) &&
					c1.position.x < (c2.position.x + (c2.width / 2) + c1.radius) &&
					c1.position.y > (c2.position.y - (c2.height / 2) - c1.radius) &&
					c1.position.y < (c2.position.y + (c2.height / 2) + c1.radius)
				) {
					onRectCollision(c1, c2);
					collides = true;
				}
			} else {
				continue;
			}
		}
	}
	return collides;
}

function isRect(o) {
	return o.hasOwnProperty("width") && o.hasOwnProperty("height")
}

function isCircle(o) {
	return o.hasOwnProperty("radius")
}

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
		case "z":
			console.log("undo");
			game.gameObjects.splice(game.gameObjects.indexOf(lastAddedWall), 1);
			break;
	}
}

function handlePointerStart(event) {
	ongoingTouches.set(event.pointerId, new Vec2(event.pageX, event.pageY));
}

function handlePointerEnd(event) {
	let touch = {
		start: ongoingTouches.get(event.pointerId),
		end: new Vec2(event.pageX, event.pageY),
	};

	if (wallEditOn) {
		let wallStart = new Vec2(
			Math.round(touch.start.x / grid.spacing) * grid.spacing,
			Math.round(touch.start.y / grid.spacing) * grid.spacing
		).addVec(grid.position);
		let wallEnd = new Vec2(
			Math.round(touch.end.x / grid.spacing) * grid.spacing,
			Math.round(touch.end.y / grid.spacing) * grid.spacing
		).addVec(grid.position);

		let wallPos = new Vec2((wallStart.x + wallEnd.x) / 2, (wallStart.y + wallEnd.y) / 2);
		let wallWidth = Math.abs(wallStart.subVec(wallEnd).x) + 20;
		let wallHeight = Math.abs(wallStart.subVec(wallEnd).y) + 20;
		let newWall = new Wall(wallPos, wallWidth, wallHeight, "green");
		console.log(newWall);
		game.gameObjects.unshift(newWall);
		lastAddedWall = newWall;
	}

	ongoingTouches.delete(event.pointerId);
}


function gameUpdate(delta) {
	game.update(delta);
}

function start() {
	document.addEventListener("keydown", gameInput);
	document.addEventListener("pointerdown", handlePointerStart);
	document.addEventListener("pointerup", handlePointerEnd);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight - 5;
	ctx.scale(1, 1);
	console.log(game.gameObjects);
}

start();
let interval = setInterval(gameUpdate, gameMSPT, gameMSPT / 1000);

