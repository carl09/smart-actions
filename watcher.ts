import axios from 'axios';
import * as admin from 'firebase-admin';
import { globalDeviceId } from './functions/src/constant';
import { environment } from './src/environments/environment.prod';

import * as cron from 'node-cron';

admin.initializeApp(environment.firebase);

cron.schedule('*/5 * * * *', () => {
  axios
    .get(
      `https://home.sensibo.com/api/v2/pods/${environment.sensiboDeviceId}/measurements?apiKey=${
        environment.sensiboApiKey
      }`,
    )
    .then(x => {
      const result = x.data.result[0];

      admin
        .database()
        .ref('/')
        .child(globalDeviceId)
        .child('Enviroment')
        .set({
          humidity: result.humidity,
          temperature: result.temperature,
        });

      console.log(result);
    })
    .catch(err => {
      console.error('measurements', err.data);
    });
});

const getAcState = axios
  .get(
    `https://home.sensibo.com/api/v2/pods/${environment.sensiboDeviceId}/?fields=acState&apiKey=${
      environment.sensiboApiKey
    }`,
  )
  .then(x => {
    const result = x.data.result.acState;

    console.log('getAcState', x.data);

    admin
      .database()
      .ref('/')
      .child(globalDeviceId)
      .child('ThermostatMode')
      .set({
        thermostatMode: result.mode,
        temperature: result.targetTemperature,
        swing: result.swing,
        fanSpeed: result.fanLevel,
      });
  })
  .catch(err => {
    console.error('acState', err.data);
  });

Promise.all([getAcState]).then(() => {
  admin
    .database()
    .ref('/')
    .child(globalDeviceId)
    .child('ThermostatMode')
    .on('value', postSnapshot => {
      const val: {
        thermostatMode: string;
        temperature: number;
        swing: string;
        fanSpeed: string;
      } = postSnapshot.val();
      console.log(val);
      axios
        .post(
          `https://home.sensibo.com/api/v2/pods/${environment.sensiboDeviceId}/acStates?apiKey=${
            environment.sensiboApiKey
          }`,
          {
            acState: {
              mode: val.thermostatMode,
              targetTemperature: val.temperature,
              swing: val.swing,
              fanLevel: val.fanSpeed,
            },
          },
        )
        .then(response => {
          console.log('ok acStates');
        })
        .catch(error => {
          console.log('Error:', error.response.data, {
            acState: {
              mode: val.thermostatMode,
              targetTemperature: val.temperature,
              swing: val.swing,
              fanLevel: val.fanSpeed,
            },
          });
        });
    });

  admin
    .database()
    .ref('/')
    .child(globalDeviceId)
    .child('OnOff')
    .on('value', postSnapshot => {
      const val = postSnapshot.val();
      console.log(val);
      axios
        .post(
          `https://home.sensibo.com/api/v2/pods/${environment.sensiboDeviceId}/acStates?apiKey=${
            environment.sensiboApiKey
          }`,
          {
            acState: {
              on: val.on,
            },
          },
        )
        .then(response => {
          console.log('ok OnOff');
        })
        .catch(error => {
          console.log('Error:', error.data);
        });
    });
});
