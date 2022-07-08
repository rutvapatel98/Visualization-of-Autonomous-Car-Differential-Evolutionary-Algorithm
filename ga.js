function nextGeneration() {
  console.log('next generation');
  calculateFitness(end);
  for (let i = 0; i < TOTAL; i++) {
    agents[i] = pickOne();
  }
  for (let i = 0; i < TOTAL; i++) {
    savedagents[i].dispose();
  }
  savedagents = [];
}

function pickOne() {
  let index = 0;
  let r = random(1);
  while (r > 0) {
    r = r - savedagents[index].fitness;
    index++;
  }
  index--;
  let particle = savedagents[index]; 
  let child = new Particle(particle.brain);
  child.mutate();
  return child;
}

function calculateFitness(target) {
  for (let particle of savedagents) {
    particle.calculateFitness();
  }
  let sum = 0;
  for (let particle of savedagents) {
    sum += particle.fitness;
  }
  for (let particle of savedagents) {
    particle.fitness = particle.fitness / sum;
  }
}
