import { ModelOutput } from './models';
import { Robot } from './robot.model';

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export class Population<T extends ModelOutput> {
  private robots: Array<Robot<T>> = [];

  constructor(private modelCtor: new () => T, public requiredTemp: number) {}

  initializePopulation(count: number) {
    for (let index = 0; index < count; index++) {
      const outsideTemp = randomInt(this.requiredTemp - 4, this.requiredTemp + 4);

      const isCooler = this.requiredTemp - outsideTemp > 0;

      console.log(`Robot ${index}`, this.requiredTemp, outsideTemp, isCooler);

      const r = new Robot(this.modelCtor, this.requiredTemp, outsideTemp);

      this.robots.push(r);
    }
  }

  calculateFitness(iterations: number) {
    const results: number[][] = [];
    for (const robot of this.robots) {
      let t = robot.outsideTemp; // - (2 + Math.floor(Math.random() * 3)); // currentTemp;
      for (let index = 0; index < iterations; index++) {
        t = robot.guess(t);
      }
      results.push(robot.getDiffs());
    }

    console.log('calculateFitness.results', results);

    return results;
  }

  rePopulate() {
    // selection(){
    //   const [best, nextNest] = this.getFitness(2);
    // }
    // crossover(){
    // }
    // mutation(){
    // }
  }

  getFitness(n: number) {
    const p = this.robots.sort((a, b) => {
      return b.score() - a.score();
    });

    return Array.from({ length: n }).map((_, i) => p[i]);
  }
}
