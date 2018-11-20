import * as tf from '@tensorflow/tfjs';
import { mixUp, splitArray } from './array-utils';
import {
  ClimateFanSpeed,
  ClimateMode,
  ClimateResponse,
  ModelOutput,
  WeightsMatrix,
} from './models';

export class ModelTwoOutput implements ModelOutput {
  private model: tf.Model;

  private readonly fanLayerUnits = 4;
  private readonly modeLayerUnits = 2;

  constructor() {
    const input = tf.input({ shape: [2], name: 'input' });
    const denseLayer1 = tf.layers.dense({
      units: 8,
      activation: 'relu',
      useBias: true,
      name: 'Hidden_Layer1',
    });

    const softmaxLayer1 = tf.layers.dense({
      units: this.fanLayerUnits,
      activation: 'softmax',
      name: 'Fan_OutPut',
    });
    const softmaxLayer2 = tf.layers.dense({
      units: this.modeLayerUnits,
      activation: 'softmax',
      name: 'Mode_OutPut',
    });

    const fanOutput = softmaxLayer1.apply(denseLayer1.apply(input));
    const modeOutput = softmaxLayer2.apply(denseLayer1.apply(input));

    this.model = tf.model({
      inputs: input,
      outputs: [fanOutput, modeOutput] as tf.SymbolicTensor[],
    });
  }

  getWeights(): WeightsMatrix[] {
    const result: WeightsMatrix[] = [];

    for (const layer of this.model.layers) {
      if (layer.name !== 'input') {
        // console.log(layer.name, layer.getWeights());

        result.push({
          weight: Array.from(layer.getWeights()[0].dataSync()),
          bias: Array.from(layer.getWeights()[1].dataSync()),
          shape: layer.getWeights()[0].shape,
        });
      }
    }
    return result;
  }

  setWeights(...weights: WeightsMatrix[][]) {
    const mixedWeight = mixUp(...weights);

    for (let index = 1; index < this.model.layers.length; index++) {
      // if (layer.name !== "input") {
      const layer = this.model.layers[index];
      const weight = mixedWeight[index - 1];

      const split = splitArray(weight.weight, weight.shape[1]);

      const x1 = tf.tensor2d([...split]);
      const x2 = tf.tensor1d(weight.bias); // layer.getWeights()[1];
      layer.setWeights([x1, x2]);

      x1.dispose();
      x2.dispose();
      // }
    }
  }

  guess(requestTempDiff: number, outsideTempDiff: number): ClimateResponse {
    let response: ClimateResponse;

    tf.tidy(() => {
      const xs = tf.tensor2d([[requestTempDiff, outsideTempDiff]]);

      const predict = this.model.predict(xs);

      const fanResult = predict[0].argMax(-1);
      const modeResult = predict[1].argMax(-1);

      const fan: ClimateFanSpeed = fanResult.dataSync()[0];
      const mode: ClimateMode = modeResult.dataSync()[0];

      response = {
        fanSpeed: fan,
        mode,
      };
    });

    return response;
  }
}
