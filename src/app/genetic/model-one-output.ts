import * as tf from '@tensorflow/tfjs';
import { mixUp, splitArray } from './array-utils';
import {
  ClimateFanSpeed,
  ClimateMode,
  ClimateResponse,
  ModelOutput,
  WeightsMatrix,
} from './models';

const enumToResp = (fanSpeed: ClimateFanSpeed, mode: ClimateMode): number => {
  if (mode === ClimateMode.Cooling) {
    return fanSpeed === ClimateFanSpeed.High
      ? 0
      : fanSpeed === ClimateFanSpeed.Medium
      ? 1
      : fanSpeed === ClimateFanSpeed.Low
      ? 2
      : 3;
  }

  return fanSpeed === ClimateFanSpeed.High
    ? 7
    : fanSpeed === ClimateFanSpeed.Medium
    ? 6
    : fanSpeed === ClimateFanSpeed.Low
    ? 5
    : 4;
};

const respToEnum = (rawValue: number): { fanSpeed: ClimateFanSpeed; mode: ClimateMode } => {
  let fanSpeed: ClimateFanSpeed;
  let mode: ClimateMode;

  switch (rawValue) {
    case 0:
      fanSpeed = ClimateFanSpeed.High;
      mode = ClimateMode.Cooling;
      break;
    case 1:
      fanSpeed = ClimateFanSpeed.Medium;
      mode = ClimateMode.Cooling;
      break;
    case 2:
      fanSpeed = ClimateFanSpeed.Low;
      mode = ClimateMode.Cooling;
      break;
    case 3:
      fanSpeed = ClimateFanSpeed.Off;
      mode = ClimateMode.Cooling;
      break;
    case 4:
      fanSpeed = ClimateFanSpeed.Off;
      mode = ClimateMode.Heating;
      break;
    case 5:
      fanSpeed = ClimateFanSpeed.Low;
      mode = ClimateMode.Heating;
      break;
    case 6:
      fanSpeed = ClimateFanSpeed.Medium;
      mode = ClimateMode.Heating;
      break;
    case 7:
      fanSpeed = ClimateFanSpeed.High;
      mode = ClimateMode.Heating;
      break;
    default:
      throw new Error('Raw Data Not Found');
  }

  return {
    fanSpeed,
    mode,
  };
};

export class ModelOneOutput implements ModelOutput {
  private model: tf.Sequential;

  constructor() {
    this.model = tf.sequential();
    this.model.add(
      tf.layers.dense({
        units: 8,
        inputShape: [2],
        activation: 'relu',
        useBias: true,
        // biasInitializer: "randomNormal"
      }),
    );
    this.model.add(
      tf.layers.dense({
        units: 8,
        activation: 'softmax',
        useBias: true,
        // biasInitializer: "randomNormal"
      }),
    );

    const modelOptimizer = tf.train.sgd(0.1);

    this.model.compile({
      loss: 'categoricalCrossentropy',
      optimizer: modelOptimizer,
      metrics: ['accuracy'],
    });
  }

  getWeights(): WeightsMatrix[] {
    const result: WeightsMatrix[] = [];

    for (const layer of this.model.layers) {
      result.push({
        weight: Array.from(layer.getWeights()[0].dataSync()),
        bias: Array.from(layer.getWeights()[1].dataSync()),
        shape: layer.getWeights()[0].shape,
      });
    }
    return result;
  }

  setWeights(weights1: WeightsMatrix[], weights2: WeightsMatrix[]) {
    const weights = mixUp(weights1, weights2);

    for (let index = 0; index < this.model.layers.length; index++) {
      const layer = this.model.layers[index];
      const weight = weights[index];

      const split = splitArray(weight.weight, weight.shape[1]);

      const x1 = tf.tensor2d([...split]);
      const x2 = tf.tensor1d(weight.bias); // layer.getWeights()[1];
      layer.setWeights([x1, x2]);

      x1.dispose();
      x2.dispose();
    }
  }

  guess(requestTempDiff: number, outsideTempDiff: number): ClimateResponse {
    let response: ClimateResponse;

    tf.tidy(() => {
      const xs = tf.tensor2d([[requestTempDiff, outsideTempDiff]]);

      const guessResult = (this.model.predict(xs) as tf.Tensor).argMax(-1);

      const rawValue = guessResult.dataSync()[0];

      const { fanSpeed, mode } = respToEnum(rawValue);

      response = {
        fanSpeed,
        mode,
      };
    });

    return response;
  }
}
