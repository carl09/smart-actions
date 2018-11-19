import { scoreResponse, withInTollerance } from './array-utils';
import { ClimateFanSpeed, ClimateMode, ClimateResponse } from './models';

interface Room {
  note?: string;
  requestedTemp: number;
  actualTemp: number;
  outsideTemp: number;
  mode: ClimateMode;
  fanSpeed: ClimateFanSpeed;
  score: number;
  adjustedTemp: number;
}

const setAirCon = (env: Room): { score: number; temp: number } => {
  const temp1 = env.requestedTemp - env.actualTemp;
  const temp2 = env.outsideTemp - env.requestedTemp;

  const resp: ClimateResponse = {
    mode: env.mode,
    fanSpeed: env.fanSpeed,
  };

  const score = scoreResponse(temp1, temp2 < 0, resp, true);

  return {
    score: score.points,
    temp: env.actualTemp + score.adjustment,
  };
};

describe('Array-Utils', () => {
  describe('withInTollerance', () => {
    it('Value True', () => {
      expect(withInTollerance(0.5)).toBeTruthy('.5');
      expect(withInTollerance(-0.5)).toBeTruthy('-.5');
      expect(withInTollerance(0)).toBeTruthy('0');
    });

    it('Value False', () => {
      expect(withInTollerance(0.51)).toBeFalsy('.51');
      expect(withInTollerance(-0.51)).toBeFalsy('-51');
    });
  });

  describe('by example', () => {
    const rooms: Room[] = [
      {
        requestedTemp: 22,
        actualTemp: 20,
        outsideTemp: 18,

        mode: ClimateMode.Heating,
        fanSpeed: ClimateFanSpeed.High,
        score: 1,
        adjustedTemp: 20.75,
      },
      {
        requestedTemp: 22,
        actualTemp: 20,
        outsideTemp: 18,

        mode: ClimateMode.Heating,
        fanSpeed: ClimateFanSpeed.Medium,
        score: 1,
        adjustedTemp: 20.5,
      },
      {
        requestedTemp: 22,
        actualTemp: 20,
        outsideTemp: 18,
        mode: ClimateMode.Heating,
        fanSpeed: ClimateFanSpeed.Low,
        score: 1,
        adjustedTemp: 20.25,
      },
      {
        note: 'Not Yet Up to temp and fan too slow',
        requestedTemp: 22,
        actualTemp: 20,
        outsideTemp: 18,
        mode: ClimateMode.Heating,
        fanSpeed: ClimateFanSpeed.Off,
        score: 0,
        adjustedTemp: 19.75,
      },
      {
        note: 'Over Heating Room',
        requestedTemp: 22,
        actualTemp: 23,
        outsideTemp: 18,

        mode: ClimateMode.Heating,
        fanSpeed: ClimateFanSpeed.High,
        score: -0.25,
        adjustedTemp: 23.75,
      },

      {
        note: 'Allowing Room to cool back down',
        requestedTemp: 22,
        actualTemp: 24,
        outsideTemp: 18,

        mode: ClimateMode.Heating,
        fanSpeed: ClimateFanSpeed.Off,
        score: 1,
        adjustedTemp: 23.75,
      },

      // Cooling

      {
        requestedTemp: 21,
        actualTemp: 23,
        outsideTemp: 26,

        mode: ClimateMode.Cooling,
        fanSpeed: ClimateFanSpeed.High,
        score: 1,
        adjustedTemp: 22.25,
      },
      {
        requestedTemp: 21,
        actualTemp: 23,
        outsideTemp: 26,

        mode: ClimateMode.Cooling,
        fanSpeed: ClimateFanSpeed.Medium,
        score: 1,
        adjustedTemp: 22.5,
      },
      {
        requestedTemp: 21,
        actualTemp: 23,
        outsideTemp: 26,

        mode: ClimateMode.Cooling,
        fanSpeed: ClimateFanSpeed.Low,
        score: 1,
        adjustedTemp: 22.75,
      },
      {
        note: 'Not Yet Up to temp and fan too slow',
        requestedTemp: 21,
        actualTemp: 23,
        outsideTemp: 26,
        mode: ClimateMode.Cooling,
        fanSpeed: ClimateFanSpeed.Off,
        score: 0,
        adjustedTemp: 23.25,
      },
      {
        note: 'Over Cooling Room',
        requestedTemp: 21,
        actualTemp: 19,
        outsideTemp: 26,

        mode: ClimateMode.Cooling,
        fanSpeed: ClimateFanSpeed.High,
        score: -0.25,
        adjustedTemp: 18.25,
      },

      {
        note: 'Allowing Room to warm back up',
        requestedTemp: 21,
        actualTemp: 19,
        outsideTemp: 26,

        mode: ClimateMode.Cooling,
        fanSpeed: ClimateFanSpeed.Off,
        score: 1,
        adjustedTemp: 19.25,
      },
    ];

    rooms.forEach(room => {
      it(`${room.note}: ${ClimateMode[room.mode]}-${ClimateFanSpeed[room.fanSpeed]}`, () => {
        const result = setAirCon(room);
        expect(result.score).toBe(room.score);
        expect(result.temp).toBe(room.adjustedTemp);
      });
    });
  });
});
