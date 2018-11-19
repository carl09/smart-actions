import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';
import { SeriesComponent } from './chart/series.component';
import { SampleComponent } from './sample/sample.component';
import { TwoOutputTidyComponent } from './two-output-tidy/two-output-tidy.component';
import { TwoOutputComponent } from './two-output/two-output.component';

const routes: Routes = [
  { path: 'two-output', component: TwoOutputComponent },
  { path: 'tidy', component: TwoOutputTidyComponent },
  { path: 'sample', component: SampleComponent },
  { path: '', redirectTo: '/two-output', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    SeriesComponent,
    TwoOutputComponent,
    TwoOutputTidyComponent,
    SampleComponent,
  ],
  imports: [BrowserModule, RouterModule.forRoot(routes)],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
