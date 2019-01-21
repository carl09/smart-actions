import { SmartHomeV1SyncDevices } from 'actions-on-google';
import * as admin from 'firebase-admin';
import { globalDeviceId } from './constant';

admin.initializeApp();

const firebaseRef = admin.database().ref('/');

export interface DeviceStatus {
  online: boolean;
  on: boolean;
  thermostatMode: string;
  thermostatTemperatureSetpoint: number;
  thermostatTemperatureAmbient?: number;
  thermostatHumidityAmbient?: number;
}

export const syncDevice = (): SmartHomeV1SyncDevices => {
  const device = {
    id: globalDeviceId,
    type: 'action.devices.types.THERMOSTAT',
    traits: [],
    name: {
      defaultNames: ['Cool Master'],
      name: 'Cool Master',
      nicknames: ['Cool Master'],
    },
    willReportState: true,
    deviceInfo: {
      manufacturer: 'Acme Co',
      model: 'acme-washer',
      hwVersion: '1.0',
      swVersion: '1.0.1',
    },
    attributes: {},
  };

  device.traits.push('action.devices.traits.OnOff');
  // No Attributes

  device.traits.push('action.devices.traits.TemperatureSetting');
  // device.attributes['availableThermostatModes'] = 'off,heat,cool,dry,fan-only,on';
  // device.attributes['availableThermostatModes'] = 'heat,cool,dry,fan-only';
  device.attributes['availableThermostatModes'] = 'off,heat,cool,on';
  device.attributes['thermostatTemperatureUnit'] = 'C';

  console.info('device sync', device);

  return device;
};

export const queryFirebase = deviceId =>
  firebaseRef
    .child(deviceId)
    .once('value')
    .then(snapshot => {
      const snapshotVal = snapshot.val();
      return {
        on: snapshotVal.OnOff.on || false,
        thermostatMode: snapshotVal.ThermostatMode.thermostatMode,
        thermostatTemperatureSetpoint: snapshotVal.ThermostatMode.temperature,
        temperatureAmbient: snapshotVal.Enviroment.temperature,
        humidityAmbient: snapshotVal.Enviroment.humidity,
      };
    });

export const queryDevice = (deviceId): Promise<DeviceStatus> =>
  queryFirebase(deviceId).then(data => ({
    online: true,
    on: data.on,
    thermostatMode: data.thermostatMode,
    thermostatTemperatureSetpoint: data.thermostatTemperatureSetpoint,
    thermostatTemperatureAmbient: data.temperatureAmbient,
    thermostatHumidityAmbient: data.humidityAmbient,
  }));

export const commandOnOff = (deviceId: string, toggle: boolean) => {
  firebaseRef
    .child(deviceId)
    .child('OnOff')
    .update({
      on: toggle,
    });
};

export const commandSetThermostatMode = (deviceId: string, thermostatMode: string) => {
  firebaseRef
    .child(deviceId)
    .child('ThermostatMode')
    .update({
      thermostatMode,
    });
};

export const commandSetTemperature = (deviceId: string, temperature: number) => {
  firebaseRef
    .child(deviceId)
    .child('ThermostatMode')
    .update({
      temperature,
    });
};

export const commandSetFanSpeed = (deviceId: string, fanSpeed: string) => {
  firebaseRef
    .child(deviceId)
    .child('ThermostatMode')
    .update({
      fanSpeed,
    });
};
