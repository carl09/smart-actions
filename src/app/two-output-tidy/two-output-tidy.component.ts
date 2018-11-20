import { Component, OnInit } from '@angular/core';
import { ModelTwoOutput } from '../genetic/model-two-output';
import { Robot } from '../genetic/robot.model';
import { Trainer } from '../genetic/trainer';
import { ChartItem } from '../two-output/two-output.component';

export interface TrainingIteration {
  times: number;
  labels: string[];
  robots: Array<Robot<ModelTwoOutput>>;
}

@Component({
  selector: 'app-two-output-tidy',
  templateUrl: './two-output-tidy.component.html',
  styleUrls: ['./two-output-tidy.component.scss'],
})
export class TwoOutputTidyComponent implements OnInit {
  public items: TrainingIteration[] = [];

  private trainer: Trainer<ModelTwoOutput>;

  constructor() {
    this.trainer = new Trainer(ModelTwoOutput, 24);
  }

  ngOnInit(): void {}

  runAgain() {
    this.trainer.results();
    this.run(20);
  }

  onSelect(robot: Robot<ModelTwoOutput>) {
    console.log(robot);

    localStorage.setItem('ModelTwoOutput_Weights', JSON.stringify(robot.getWeights()));
  }

  private run(times: number) {
    const labels: string[] = [];
    for (let index = 0; index < times; index++) {
      labels.push(`${index + 1}`);
    }

    const trainingIteration: TrainingIteration = {
      times,
      labels,
      robots: [],
    };

    this.items.push(trainingIteration);

    const other = this.trainer.run(20);

    const run = this.trainer.getBest();

    const t: ChartItem[] = [];

    // for (const r of run) {
    //   t.push({
    //     name: `${r.name} Split: ${r.result().split} Score: ${r.score()} `,
    //     color: getRandomColor(),
    //     values: r.getDiffs(),
    //   });
    // }

    trainingIteration.robots.push(...run);
  }
}

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
