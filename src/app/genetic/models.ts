export enum ClimateMode {
  Cooling = 0,
  Heating = 1,
}

export enum ClimateFanSpeed {
  Off = 0,
  Low = 1,
  Medium = 2,
  High = 3,
}

export interface ClimateResponse {
  mode: ClimateMode;
  fanSpeed: ClimateFanSpeed;
}

export interface WeightsMatrix {
  weight: number[];
  bias: number[];
  shape: number[];
}

export interface MoveAndResult {
  input: number[];
  fanSpeed: ClimateFanSpeed;
  mode: ClimateMode;
}

export interface ModelOutput {
  getWeights(): WeightsMatrix[];
  setWeights(...weights: WeightsMatrix[][]);
  guess(requestTempDiff: number, outsideTempDiff: number): ClimateResponse;
  setMoves(moves: MoveAndResult[]): Promise<void>;
}
