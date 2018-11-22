import { getAdjustment, scoreAdjustment } from './array-utils';
import {
  ClimateFanSpeed,
  ClimateMode,
  ClimateResponse,
  ModelOutput,
  MoveAndResult,
  WeightsMatrix,
} from './models';

export class Robot<T extends ModelOutput> {
  public name: string;

  private resultTemp: number;
  private robotScore = 0;
  private goodMoves: MoveAndResult[] = [];

  private lastDiff: number[] = [];

  private model: T;

  constructor(c: new () => T, private requestedTemp: number, public outsideTemp: number) {
    this.requestedTemp = requestedTemp;

    this.model = new c();
  }

  setRequestedTemp(requestedTemp: number) {
    this.requestedTemp = requestedTemp;
  }

  getRequestedTemp() {
    return this.requestedTemp;
  }

  getDiffs(): number[] {
    return this.lastDiff;
  }

  use(temp: number) {
    const temp1 = this.requestedTemp - temp;
    const temp2 = this.outsideTemp - this.requestedTemp;

    const response: ClimateResponse = this.model.guess(temp1, temp2);

    return {
      mode: ClimateMode[response.mode],
      fanSpeed: ClimateFanSpeed[response.fanSpeed],
    };
  }

  guess(temp: number, verbose?: boolean) {
    const requestTempDiff = this.requestedTemp - temp;
    const temp2 = this.outsideTemp - this.requestedTemp;

    // console.log('Is Heating Required', temp2 < 0 )

    // console.log('temps', {
    //   temp: temp,
    //   requestedTemp: this.requestedTemp,
    //   outsideTemp: this.outsideTemp,
    //   tempDiff: temp1,
    //   ambentDiff: temp2
    // })

    const isHeatingRequired = temp2 < 0;

    const response: ClimateResponse = this.model.guess(requestTempDiff, temp2);

    const adjustment = getAdjustment(requestTempDiff, isHeatingRequired, response, verbose);

    const points = scoreAdjustment(
      requestTempDiff,
      isHeatingRequired,
      adjustment,
      response.mode,
      verbose,
    );

    console.log('guess', {
      requestTempDiff,
      fanSpeed: ClimateFanSpeed[response.fanSpeed],
      mode: ClimateMode[response.mode],
      points,
      adjustment,
    });

    if (points > 0) {
      this.goodMoves.push({
        input: [requestTempDiff, temp2],
        fanSpeed: response.fanSpeed,
        mode: response.mode,
      });
    }

    this.robotScore += points;

    this.lastDiff.push(requestTempDiff);

    this.resultTemp = temp + adjustment;

    return this.resultTemp;
  }

  result() {
    let split = this.requestedTemp - this.resultTemp;

    if (split < 0) {
      split = split * -1;
    }

    return {
      requested: this.requestedTemp,
      actual: this.resultTemp,
      split,
    };
  }

  score() {
    return this.robotScore;
  }

  getMoves(): MoveAndResult[] {
    return this.goodMoves;
  }

  getWeights(): WeightsMatrix[] {
    return this.model.getWeights();
  }

  setWeights(...weights: WeightsMatrix[][]) {
    this.model.setWeights(...weights);
  }
}
