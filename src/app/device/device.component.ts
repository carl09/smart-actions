import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css'],
})
export class DeviceComponent implements OnInit {
  public deviceForm: FormGroup;

  constructor(private db: AngularFireDatabase) {
    this.deviceForm = new FormGroup({
      on: new FormControl(''),
      mode: new FormControl(''),
      temperature: new FormControl(''),
      ambientTemperature: new FormControl(''),
      ambientHumidity: new FormControl(''),
    });
  }

  ngOnInit() {
    this.deviceForm.valueChanges.subscribe(x => {
      console.log('valueChanges', x);

      const pkg = {
        OnOff: {
          on: x.on,
        },
        ThermostatMode: {
          thermostatMode: x.mode,
          temperature: x.temperature,
        },
        Enviroment: {
          temperature: 18,
          humidity: 60,
        },
      };

      this.db.database
        .ref('/')
        .child('ac-unit')
        .set(pkg);
    });
  }

  onSubmit() {
    // this.deviceForm.dispatch(
    //   new TodoAddAction({ name: this.deviceForm.value.name }),
    // );
    // this.deviceForm.reset();
  }
}
