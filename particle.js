function pldistance(p1, p2, x, y) {
  const num = abs((p2.y - p1.y) * x - (p2.x - p1.x) * y + p2.x * p1.y - p2.y * p1.x);
  const den = p5.Vector.dist(p1, p2);
  return num / den;
}

class Particle {
  constructor(brain) {
    this.fitness = 0;
    this.dead = false;
    this.finished = false;
    this.pos = createVector(start.x, start.y);
    this.vel = createVector();
    this.acc = createVector();
    this.maxspeed = 5;
    this.maxforce = 0.2;
    this.sight = SIGHT;
    this.view = [];
    this.rays = [];
    this.index = 0;
    this.counter = 0;
    this.closeDistFromOb = Infinity;

    for (let a = -65; a < 65; a += 1) {
      this.view.push(new Ray(this.pos, radians(a)));
    }
    for (let a = -65; a < 65; a += 10) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
    if (brain) {
      this.brain = brain.copy();
    } else {
      this.brain = new NeuralNetwork(this.rays.length, this.rays.length * 2, 2);
    }
  }

  dispose() {
    this.brain.dispose();
  }

  save(){
    this.brain.save();
  }


  mutate() {
    this.brain.mutate(MUTATION_RATE);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (!this.dead && !this.finished) {
      this.pos.add(this.vel);
      this.vel.add(this.acc);
      this.vel.limit(this.maxspeed);
      this.acc.set(0, 0);
      this.counter++;
      if (this.counter > LIFESPAN) {
        this.dead = true;
      }

      for (let i = 0; i < this.view.length; i++) {
        this.view[i].rotate(this.vel.heading());
      }

      for (let i = 0; i < this.rays.length; i++) {
        this.rays[i].rotate(this.vel.heading());
      }
    }
  }

  check(checkpoints) {
    if (!this.finished) {
      this.goal = checkpoints[this.index];
      const d = pldistance(this.goal.a, this.goal.b, this.pos.x, this.pos.y);
      if (d < 5) {
        this.index = (this.index + 1) % checkpoints.length;
        this.fitness++;
        this.counter = 0;
      }
    }
  }

  calculateFitness() {
    this.fitness = pow(2, this.fitness);  
  }

  look(walls,obstacles) {
    const inputs = [];
    this.closeDistFromOb = Infinity;
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      let record = this.sight; 
      let ob_point = ray.checkobstacle(obstacles);
      if(ob_point && record>p5.Vector.dist(this.pos,ob_point.pos)){
      	closest = ob_point.pos;
      	record = p5.Vector.dist(this.pos,ob_point.pos);
      	this.closeDistFromOb = record;
      }         
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);          
          if (d < record && d < this.sight) {
            record = d;
            closest = pt;
          }
        }
      }

      if (record < 10) {
        this.dead = true;
      }

      inputs[i] = map(record, 0, SIGHT, 1, 0);

      if (closest) {
        // colorMode(HSB);
        // stroke((i + frameCount * 2) % 360, 255, 255, 50);
        stroke(255);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
    const output = this.brain.predict(inputs);
    let angle = map(output[0], 0, 1, -PI, PI);
    let speed = map(output[1], 0, 1, 0, this.maxspeed);
    angle += this.vel.heading();
    const steering = p5.Vector.fromAngle(angle);
    steering.setMag(speed);
    steering.sub(this.vel);
    steering.limit(this.maxforce);
    this.applyForce(steering);
    // console.log(output);
  }

  bounds() {
    if (this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0) {
      this.dead = true;
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    const heading = this.vel.heading();
    rotate(heading);
    fill(255, 100);
    rectMode(CENTER);
    rect(0, 0, 20, 10);
    pop();   
  }

  renderView(walls,obstacles){
  	let scene = [];
  	let colors = [];
  	for (let i = 0; i < this.view.length; i++) {
      const ray = this.view[i];
      let closest = null;
      let c = 0;
      let record = Infinity; 
      let ob_point = ray.renderobstacle(obstacles);
      if(ob_point && record>p5.Vector.dist(this.pos,ob_point.pos)){
      	closest = ob_point.pos;
      	record = p5.Vector.dist(this.pos,ob_point.pos);
      	c=1;
      }         
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);          
          if (d < record) {
            record = d;
            closest = pt;
            c=0;
          }
        }
      }
      // if (closest) {      	
      //   stroke(255);
      //   line(this.pos.x, this.pos.y, closest.x, closest.y);
      // }
      scene[i] = record;
      colors[i] = c;
	}
	let data = {
		"scene":scene,
		"colors":colors
	}
  	return data;
  }

  highlight() {
    push();
    translate(this.pos.x, this.pos.y);
    const heading = this.vel.heading();
    rotate(heading);
    stroke(0, 255, 0);
    fill(0, 255, 0,100);
    rectMode(CENTER);
    rect(0, 0, 20, 10);
    pop();    
    if (this.goal) {
      this.goal.show();
    }
  }
}
