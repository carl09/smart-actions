import { ClimateFanSpeed, ClimateMode, ClimateResponse, WeightsMatrix } from './models';

export const splitArray = (array: number[], chunk: number) => {
  const result = [];

  for (let i = 0; i < array.length; i += chunk) {
    const temparray = array.slice(i, i + chunk);
    result.push(temparray);
  }

  return result;
};

const mix = (...args: number[][]): number[] => {
  return args[0].map((_, i) => {
    const index = Math.floor(Math.random() * args.length);
    return args[index][i];
  });
};

export const mixUp = (...weights: WeightsMatrix[][]): WeightsMatrix[] => {
  const mapWeights = weights.map(a => a);

  return mapWeights[0].map((x, i) => {
    return {
      weight: mix(...mapWeights.map(a => a[i].weight)),
      bias: mix(...mapWeights.map(a => a[i].bias)),
      shape: x.shape,
    };
  });
};

export const withInTollerance = (value: number): boolean => {
  return value >= -0.5 && value <= 0.5;
};

export const scoreAdjustment = (
  requestTempDiff: number,
  isHeatingRequired: boolean,
  adjustment: number,
  mode: ClimateMode,
  verbose?: boolean,
): number => {
  // const adjustedTemp =
  //   mode === ClimateMode.Heating ? requestTempDiff - adjustment : requestTempDiff - adjustment;

  const adjustedTemp = requestTempDiff - adjustment;

  if (verbose) {
    console.log({
      requestTempDiff,
      isHeatingRequired,
      adjustment,
      adjustedTemp,
    });
  }

  if (
    withInTollerance(adjustedTemp) &&
    ((mode === ClimateMode.Heating && isHeatingRequired) ||
      (mode === ClimateMode.Cooling && !isHeatingRequired))
  ) {
    return 1;
  }

  if (adjustedTemp !== requestTempDiff) {
    if (mode === ClimateMode.Heating && isHeatingRequired) {
      if (adjustedTemp > 0 && adjustedTemp < requestTempDiff) {
        if (verbose) {
          console.log('Con 1');
        }
        return 1;
      }
      if (adjustedTemp > requestTempDiff && requestTempDiff < 0) {
        if (verbose) {
          console.log('Con 2');
        }
        return 1;
      }
      if (adjustedTemp < requestTempDiff) {
        return -0.25;
      }
    }

    if (mode === ClimateMode.Cooling && !isHeatingRequired) {
      if (adjustedTemp < 0 && adjustedTemp > requestTempDiff) {
        if (verbose) {
          console.log('Con 1');
        }
        return 1;
      }
      if (adjustedTemp < requestTempDiff && requestTempDiff > 0) {
        if (verbose) {
          console.log('Con 2');
        }
        return 1;
      }
      if (adjustedTemp > requestTempDiff) {
        return -0.25;
      }
    }
  }

  return 0;
};

export const scoreResponse = (
  requestTempDiff: number,
  isHeatingRequired: boolean,
  response: ClimateResponse,
  verbose?: boolean,
): { adjustment: number; points: number } => {
  let adjustment = 0;
  let points = 0;

  if (response.mode === ClimateMode.Heating) {
    switch (response.fanSpeed) {
      case ClimateFanSpeed.Off:
        adjustment = -0.25;
        break;
      case ClimateFanSpeed.Low:
        adjustment = 0.25;
        break;
      case ClimateFanSpeed.Medium:
        adjustment = 0.5;
        break;
      case ClimateFanSpeed.High:
        adjustment = 0.75;
        break;
    }
  } else if (response.mode === ClimateMode.Cooling) {
    switch (response.fanSpeed) {
      case ClimateFanSpeed.Off:
        adjustment = 0.25;
        break;
      case ClimateFanSpeed.Low:
        adjustment = -0.25;
        break;
      case ClimateFanSpeed.Medium:
        adjustment = -0.5;
        break;
      case ClimateFanSpeed.High:
        adjustment = -0.75;
        break;
    }
  } else {
    if (verbose) {
      console.log('UnKnown Mode', response.mode);
    }
  }

  if (
    (response.mode === ClimateMode.Heating && isHeatingRequired) ||
    (response.mode === ClimateMode.Cooling && !isHeatingRequired)
  ) {
    points = scoreAdjustment(
      requestTempDiff,
      isHeatingRequired,
      adjustment,
      response.mode,
      verbose,
    );
  }

  return {
    adjustment: adjustment * 1,
    points,
  };
};
