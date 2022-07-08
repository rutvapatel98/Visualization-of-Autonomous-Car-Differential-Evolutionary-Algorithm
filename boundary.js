class Boundary {
  constructor(x1, y1, x2, y2) {  	
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  midpoint() {
    return createVector((this.a.x + this.b.x) * 0.5, (this.a.y + this.b.y) * 0.5);

  }  
  show() {
    stroke(255);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}


class Obstacle{
	constructor(x,y){
		this.pos = createVector(x,y);
	}

	dist_from_obs(pt){

  	return sqrt(sq(this.pos.x-pt.x)+sq(this.pos.y-pt.y))

  	}

	show(cp_points){	
		noStroke();
		fill(255,0,0);
		if (typeof cp_points == 'object') {			
			let x = this.pos.x;
			x = x + random(-2,2);
		  	let m = (cp_points.p2.y-cp_points.p1.y)/(cp_points.p2.x-cp_points.p1.x);
		  	let y = m*(x-cp_points.p1.x)+cp_points.p1.y;
		  	if (random(1)<.2) {	
		  		let min_x = (cp_points.p2.x>cp_points.p1.x) ? cp_points.p1.x:cp_points.p2.x;	
		  		let max_x = (cp_points.p2.x<cp_points.p1.x) ? cp_points.p1.x:cp_points.p2.x;	
		  		let min_y = (cp_points.p2.y>cp_points.p1.y) ? cp_points.p1.y:cp_points.p2.y;	
		  		let max_y = (cp_points.p2.y<cp_points.p1.y) ? cp_points.p1.y:cp_points.p2.y;	
		  		if( x>min_x && x<max_x){
		  			this.pos.x =  x;
		  		}
		  		if (y>min_y && y<max_y) {
		  			this.pos.y =  y;	
		  		}		  		
		  	}
		}	
		ellipse(this.pos.x,this.pos.y,10,10);				
	}
}