import { Component, OnInit } from '@angular/core';
import { ModelTwoOutput } from '../genetic/model-two-output';
import { WeightsMatrix } from '../genetic/models';
import { Robot } from '../genetic/robot.model';

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss'],
})
export class SampleComponent implements OnInit {
  output: any;

  private robot2: Robot<ModelTwoOutput>;

  constructor() {}

  ngOnInit() {
    const weightsString = localStorage.getItem('ModelTwoOutput_Weights');
    if (weightsString) {
      this.robot2 = new Robot(ModelTwoOutput, 21, 18);

      const weights: WeightsMatrix[][] = [JSON.parse(weightsString)];

      this.robot2.setWeights(...weights);

      this.update(20);
    }
  }

  guess() {}

  requestChange(event: Event) {
    const value = (event.target as any).value;

    this.robot2.setRequestedTemp(value);
  }

  tempChange(event: Event) {
    const value = (event.target as any).value;
    console.log();

    this.update(value);
  }

  private update(value: number) {
    const useResult = this.robot2.use(value);

    this.output = {
      mode: useResult.mode,
      fanSpeed: useResult.fanSpeed,
      currentTemp: value,
      requestedTemp: this.robot2.getRequestedTemp(),
    };
  }
}
