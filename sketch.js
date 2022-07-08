
const TOTAL = 100;
const MUTATION_RATE = 0.2;
const LIFESPAN = 30;
const SIGHT = 80;

let toggle_value = false;
let obstacleNo = 20;

let generationCount = 0;
let bestP;

let walls = [];
let ray;

let cp_points = [];

let trained_model;

let agents = [];
let savedagents = [];

let start, end;

let speedSlider;

let inside = [];
let outside = [];
let checkpoints = [];


const maxFitness = 500;
let changeMap = false;

let trackheight = 800;
let trackWidth = 1000;

function buildTrack() {
  checkpoints = [];
  inside = [];
  outside = [];
  min_dist = Infinity;
  let noiseMax = 2;
  const total = 80;
  const pathWidth = 70;
  let startX = random(10);
  let startY = random(10);
  for (let i = 0; i < total; i++) {
    let a = map(i, 0, total, 0, TWO_PI);
    let xoff = map(cos(a), -1, 1, 0, noiseMax) + startX;
    let yoff = map(sin(a), -1, 1, 0, noiseMax) + startY;
    let xr = map(noise(xoff, yoff), 0, 1, 100, trackWidth * 0.5);
    let yr = map(noise(xoff, yoff), 0, 1, 100, trackheight * 0.5);
    let x1 = trackWidth / 2 + (xr - pathWidth) * cos(a);
    let y1 = trackheight / 2 + (yr - pathWidth) * sin(a);
    let x2 = trackWidth / 2 + (xr + pathWidth) * cos(a);
    let y2 = trackheight / 2 + (yr + pathWidth) * sin(a);
    checkpoints.push(new Boundary(x1, y1, x2, y2));
    inside.push(createVector(x1, y1));
    outside.push(createVector(x2, y2));
  }

  walls = [];
  for (let i = 0; i < checkpoints.length; i++) {
    let a1 = inside[i];
    let b1 = inside[(i + 1) % checkpoints.length];
    walls.push(new Boundary(a1.x, a1.y, b1.x, b1.y));
    let a2 = outside[i];
    let b2 = outside[(i + 1) % checkpoints.length];
    walls.push(new Boundary(a2.x, a2.y, b2.x, b2.y));
  }

  obstacles=[];
  cp_points=[];
  for (var i = 0; i <obstacleNo; i++) {
  	let index = int(random(5,checkpoints.length-1));
  	let p1 = inside[index];  	
  	let p2 = outside[index];
  	let mid = checkpoints[index].midpoint(); 
  	let x = random(p1.x,p2.x);
  	let m = (p2.y-p1.y)/(p2.x-p1.x);
  	let y = m*(x-p1.x)+p1.y;  	
  	let ob = new Obstacle(x,y); 	
  	// console.log(mid);
  	let cp_data = {  		
  		"p1":p1,
  		"p2":p2
  	}
  	cp_points.push(cp_data);
  	obstacles.push(ob);  	
  }  
  start = checkpoints[0].midpoint();
  end = checkpoints[checkpoints.length - 1].midpoint();
}

function setup() {
  createCanvas(1900, 800);
  tf.setBackend('cpu');
  buildTrack();
  for (let i = 0; i < TOTAL; i++) {
    agents[i] = new Particle();
  }

  speedSlider = createSlider(1, 10, 1);   
}


function toggle_btn(){
	toggle_value = ! toggle_value;
	if(toggle_value){
		document.getElementById("btn_toggle").innerHTML = "Static";
	}else{
		document.getElementById("btn_toggle").innerHTML = "Dynamic";
	}
}
async function load_model() {
	const uploadJSONInput = document.getElementById('upload-json');
	const uploadWeightsInput = document.getElementById('upload-weights');
	trained_model = await tf.loadLayersModel(tf.io.browserFiles([uploadJSONInput.files[0], uploadWeightsInput.files[0]]));
	console.log(trained_model);
}

function save_model() {
	bestP.save()
}

function change_obs_no() {
	if(Number.isNaN(int(document.getElementById('obs_no').value))){
		obstacleNo = 20;
		console.log("nan");
	}else{
		obstacleNo = int(document.getElementById('obs_no').value);
		console.log(obstacleNo);	
	}
}

function draw() {
  const cycles = speedSlider.value();
  background(0);

  bestP = agents[0];

  for (let n = 0; n < cycles; n++) {
    for (let agent of agents) {
      agent.look(walls,obstacles);
      agent.check(checkpoints);
      agent.bounds();
      agent.update();
      agent.show();

      if (agent.fitness > bestP.fitness) {
        bestP = agent;
      }
    }

    for (let i = agents.length - 1; i >= 0; i--) {
      const agent = agents[i];
      if (agent.dead || agent.finished) {
        savedagents.push(agents.splice(i, 1)[0]);
      }

      if (!changeMap && agent.fitness > maxFitness) {
        changeMap = true;
      }
    }

    if (agents.length !== 0 && changeMap) {
      for (let i = agents.length - 1; i >= 0; i--) {
        savedagents.push(agents.splice(i, 1)[0]);
      }

      buildTrack();
      nextGeneration();
      generationCount++;
      changeMap = false;
    }

    if (agents.length == 0) {
      buildTrack();
      nextGeneration();
      generationCount++;
    }
  }

  for (let cp of checkpoints) {
    // strokeWeight(2);
    // cp.show();  
  }

  for (let wall of walls) {
    wall.show();
  }

  for (let agent of agents) {
    agent.show();
  }

  for (var i = 0; i < obstacles.length; i++) {
  	if(toggle_value){
    	obstacles[i].show(cp_points[i]);
    }else{
    	obstacles[i].show(0);
    }
  }

  // for (let obstacle of obstacles) {
  //   if(toggle_value){
  //   	obstacle.show(min_dist);
  //   }else{
  //   	obstacle.show(0);
  //   }
  // }

  bestP.highlight();

  let data = bestP.renderView(walls,obstacles);
  let scene = data['scene'];
  let colors = data['colors'];
  const w = 900 / scene.length;
  push();
  translate(1000,0);
  for (var i = 0; i < scene.length; i++) {
  	noStroke();
  	let sq = scene[i]*scene[i];	
  	let swq = 400*400;
  	const b = map(sq,0,swq,200,0);
  	const h = map(sq,0,swq,800,0);
  	if(colors[i]==1){
  		fill(b,0,0);
  	}
  	if(colors[i]==0){
  		fill(b,b,b+30,b);	
  	}  	
  	rectMode(CENTER);
  	rect(i*w + w/2,400,w+1,h);
  }
  pop();

  fill(255);
  line(trackWidth,0,trackWidth,trackheight);
  textSize(24);
  noStroke();
  text('Generation: ' + generationCount, 10, 50);
  text('Speed: '+ map(bestP.vel.mag().toFixed(6),0,5,0,180).toFixed(4)+ ' Km/h',10,700);
  text('distance from obstacle: '+ bestP.closeDistFromOb.toFixed(3)+" m",10,750);
}