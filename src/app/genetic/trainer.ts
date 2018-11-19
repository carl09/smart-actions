import { ModelOutput, MoveAndResult, WeightsMatrix } from './models';
import { Robot } from './robot.model';

export class Trainer<T extends ModelOutput> {
  private positiveRoberts: Array<Robot<T>>;
  private negitiveRoberts: Array<Robot<T>>;

  private population = 10;

  constructor(private modelCtor: new () => T, public requiredTemp: number) {
    this.positiveRoberts = [];
  }

  async preLoad() {
    this.positiveRoberts = await this.createRoberts(this.requiredTemp - 6);
    this.negitiveRoberts = await this.createRoberts(this.requiredTemp + 6);
  }

  async createRoberts(outsideTemp: number, moves?: MoveAndResult[], ...weights: WeightsMatrix[][]) {
    const roberts: Array<Robot<T>> = [];

    for (let index = 0; index < this.population; index++) {
      const r = new Robot(this.modelCtor, this.requiredTemp, outsideTemp);

      if (weights && weights.length !== 0) {
        r.setWeights(...weights);
        await r.setMoves(moves);
      }

      roberts.push(r);
    }

    return roberts;
  }

  run(iterations: number): number[][] {
    const results: number[][] = [];
    for (const robert of this.positiveRoberts) {
      let t = this.requiredTemp - (2 + Math.floor(Math.random() * 3)); // currentTemp;
      // const run: number[] = [];
      for (let index = 0; index < iterations; index++) {
        t = robert.guess(t);
      }
      results.push(robert.getDiffs());
    }

    for (const robert of this.negitiveRoberts) {
      let t = this.requiredTemp + (2 + Math.floor(Math.random() * 3)); // currentTemp;
      for (let index = 0; index < iterations; index++) {
        t = robert.guess(t);
      }
      results.push(robert.getDiffs());
    }

    return results;
  }

  getBest(verbose?: boolean): Array<Robot<T>> {
    const p = this.positiveRoberts.sort((a, b) => {
      return b.score() - a.score();
    });

    const n = this.negitiveRoberts.sort((a, b) => {
      return b.score() - a.score();
    });

    const p2 = this.positiveRoberts
      // .filter(x => x.score() === p[0].score())
      .sort((a, b) => {
        return a.result().split - b.result().split;
      });

    const n3 = this.negitiveRoberts
      .filter(x => x.score() === n[0].score())
      .sort((a, b) => {
        return a.result().split - b.result().split;
      });

    const p3 = this.positiveRoberts
      .filter(x => x.score() === p[0].score())
      .sort((a, b) => {
        return a.result().split - b.result().split;
      });

    const n2 = this.negitiveRoberts
      // .filter(x => x.score() === n[0].score())
      .sort((a, b) => {
        return a.result().split - b.result().split;
      });

    p2[0].name = 'best pos split';
    n2[0].name = 'best neg split';

    p3[0].name = 'best pos score';
    n3[0].name = 'best neg score';

    if (verbose) {
      console.warn('----------------- best pic');
      console.log('Best Pos:', p2[0].score(), p2[0].result());
      console.log('Best Neg:', n2[0].score(), n2[0].result());
    }

    return [p2[0], n2[0], p3[0], n3[0]];
  }

  async results(verbose?: boolean) {
    if (verbose) {
      console.warn('----------------- Results');
    }

    const moves = [];

    for (const robert of this.positiveRoberts) {
      moves.push(...robert.getMoves());
      console.warn('pos score', robert.score(), robert.result());
    }

    console.warn('-----------------');

    for (const robert of this.negitiveRoberts) {
      moves.push(...robert.getMoves());
      console.warn('neg score', robert.score(), robert.result());
    }

    const best = this.getBest(verbose);

    this.positiveRoberts = await this.createRoberts(
      this.requiredTemp - 6,
      moves,
      ...best.map(x => x.getWeights()),
    );

    this.negitiveRoberts = await this.createRoberts(
      this.requiredTemp + 6,
      moves,
      ...best.map(x => x.getWeights()),
    );
  }

  async iterate(count: number, verbose?: boolean) {
    for (let index = 0; index < count; index++) {
      this.run(10);
      await this.results(verbose);
    }
  }
}
