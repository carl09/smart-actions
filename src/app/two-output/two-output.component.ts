import { Component, OnInit } from '@angular/core';
import { ModelTwoOutput } from '../genetic/model-two-output';
import { Trainer } from '../genetic/trainer';

export interface ChartItem {
  name: string;
  color: string;
  values: number[];
}

export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

@Component({
  selector: 'app-two-output',
  templateUrl: './two-output.component.html',
  styleUrls: ['./two-output.component.scss'],
})
export class TwoOutputComponent implements OnInit {
  public items: ChartItem[][] = [];

  public isRunning = false;

  public labels: string[] = [];

  private trainer: Trainer<ModelTwoOutput>;

  private times = 20;

  constructor() {
    this.trainer = new Trainer(ModelTwoOutput, 24);

    for (let index = 0; index < this.times; index++) {
      this.labels.push(`${index * 10}`);
    }
  }

  ngOnInit(): void {}

  runAgain() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.trainer.results();
      this.run();
    }
  }

  private run() {
    console.log('run');
    const other = this.trainer.run(this.times);

    const run = this.trainer.getBest();

    const t: ChartItem[] = [];

    const colors = {
      1: 'red',
      2: 'blue',
      3: 'green',
      4: 'pink',
    };

    t.push(
      ...run.map((r, i) => {
        return {
          name: `${r.name} Split: ${r.result().split} Score: ${r.score()} `,
          color: colors[i],
          values: r.getDiffs(),
        };
      }),
    );

    // for (const r of run) {
    //   t.push({
    //     name: `${r.name} Split: ${r.result().split} Score: ${r.score()} `,
    //     color: getRandomColor(),
    //     values: r.getDiffs(),
    //   });
    // }

    for (const r of other) {
      t.push({
        name: ``,
        color: '#ccc',
        values: r,
      });
    }

    this.items.push(t);
    this.isRunning = false;
  }
}
