import { Component, OnInit } from '@angular/core';
import { ModelTwoOutput } from '../genetic/model-two-output';
import { Trainer } from '../genetic/trainer';

export interface ChartItem {
  name: string;
  color: string;
  values: number[];
}

const getRandomColor = () => {
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
  public labels: string[] = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
  ];

  private trainer: Trainer<ModelTwoOutput>;

  constructor() {
    this.trainer = new Trainer(ModelTwoOutput, 24);
  }

  ngOnInit(): void {
    this.trainer.preLoad().then(() => {
      this.run();
    });
  }

  runAgain() {
    this.trainer.results().then(() => {
      this.run();
    });
  }

  private run() {
    const other = this.trainer.run(20);

    const run = this.trainer.getBest();

    const t: ChartItem[] = [];

    for (const r of run) {
      t.push({
        name: `${r.name} Split: ${r.result().split} Score: ${r.score()} `,
        color: getRandomColor(),
        values: r.getDiffs(),
      });
    }

    for (const r of other) {
      t.push({
        name: ``,
        color: '#ccc',
        values: r,
      });
    }

    this.items.push(t);
  }
}
