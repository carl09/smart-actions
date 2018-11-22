import { Component, OnInit } from '@angular/core';
import { ModelTwoOutput } from '../genetic/model-two-output';
import { Population } from '../genetic/population';
import { Robot } from '../genetic/robot.model';
import { ChartItem, getRandomColor } from '../two-output/two-output.component';

@Component({
  selector: 'app-population',
  templateUrl: './population.component.html',
  styleUrls: ['./population.component.css'],
})
export class PopulationComponent implements OnInit {
  public labels: string[] = [];

  public items: ChartItem[][] = [];

  public isRunning = false;

  private population: Population<ModelTwoOutput>;
  private iterations = 20;

  constructor() {
    this.population = new Population(ModelTwoOutput, 24);

    this.labels = Array.from({ length: this.iterations }, (_, i) => i.toString());
  }

  ngOnInit(): void {
    this.population.initializePopulation(20);
  }

  runAgain() {
    // const run = this.population.calculateFitness(this.iterations);

    this.population.calculateFitness(this.iterations);

    const run = this.population.getFitness(4).map(x => x.getDiffs());

    const t: ChartItem[] = [];

    for (const r of run) {
      t.push({
        // name: `${r.name} Split: ${r.result().split} Score: ${r.score()} `,
        name: '',
        color: getRandomColor(),
        values: r,
      });
    }

    console.log(t);

    this.items.push(t);
  }
}
