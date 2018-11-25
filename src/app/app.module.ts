import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';
import { SeriesComponent } from './chart/series.component';
import { DeviceComponent } from './device/device.component';
import { PopulationComponent } from './population/population.component';
import { SampleComponent } from './sample/sample.component';
import { TwoOutputTidyComponent } from './two-output-tidy/two-output-tidy.component';
import { TwoOutputComponent } from './two-output/two-output.component';

const routes: Routes = [
  { path: 'two-output', component: TwoOutputComponent },
  { path: 'tidy', component: TwoOutputTidyComponent },
  { path: 'sample', component: SampleComponent },
  { path: 'population', component: PopulationComponent },
  { path: 'device', component: DeviceComponent },
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
    PopulationComponent,
    DeviceComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    AngularFireModule.initializeApp(environment.firebase, 'smart-actions'),
    AngularFireDatabaseModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
