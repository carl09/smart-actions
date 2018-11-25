import {
  smarthome,
  SmartHomeV1ExecutePayload,
  SmartHomeV1ReportStateRequest,
} from 'actions-on-google';
import * as functions from 'firebase-functions';
import * as shortid from 'shortid';
import { fakeauth, faketoken } from './auth';
import { globalAgentUserId } from './constant';
import {
  commandOnOff,
  commandSetTemperature,
  commandSetThermostatMode,
  queryDevice,
  syncDevice,
} from './device.model';
import { dialogflowApp } from './dialogflow.app';
import { environment } from './environment.prod';

export { faketoken, fakeauth };

const app = smarthome({
  debug: true,
  key: environment.apikey,
  jwt: environment.jwt,
});

app.onSync(body => {
  return {
    requestId: body.requestId,
    payload: {
      agentUserId: globalAgentUserId,
      devices: [syncDevice()],
    },
  };
});

app.onQuery(body => {
  const { requestId } = body;
  const payload = {
    devices: {},
  };
  const queryPromises = [];
  for (const input of body.inputs) {
    for (const device of input.payload.devices) {
      const deviceId = device.id;
      queryPromises.push(
        queryDevice(deviceId).then(data => {
          // Add response to device payload
          payload.devices[deviceId] = data;
        }),
      );
    }
  }
  // Wait for all promises to resolve
  return Promise.all(queryPromises).then(values => ({
    requestId,
    payload,
  }));
});

app.onExecute(body => {
  const { requestId } = body;
  const payload: SmartHomeV1ExecutePayload = {
    commands: [
      {
        ids: [],
        status: 'SUCCESS',
        states: {
          online: true,
        },
      },
    ],
  };
  for (const input of body.inputs) {
    for (const command of input.payload.commands) {
      for (const device of command.devices) {
        const deviceId = device.id;
        payload.commands[0].ids.push(deviceId);
        for (const execution of command.execution) {
          const execCommand = execution.command;
          const { params } = execution;
          switch (execCommand) {
            case 'action.devices.commands.OnOff':
              commandOnOff(deviceId, params.on);
              payload.commands[0].states.on = params.on;
              break;
            case 'action.devices.commands.ThermostatSetMode':
              commandSetThermostatMode(deviceId, params.thermostatMode);
              payload.commands[0].states.thermostatMode = params.thermostatMode;
              break;
            case 'action.devices.commands.ThermostatTemperatureSetpoint':
              commandSetTemperature(deviceId, params.thermostatTemperatureSetpoint);
              payload.commands[0].states.thermostatTemperatureSetpoint =
                params.thermostatTemperatureSetpoint;
              break;
            default:
              console.error('Unkndow Command', execCommand, params);
          }
        }
      }
    }
  }
  return {
    requestId,
    payload,
  };
});

exports.smarthome = functions.https.onRequest(app);

exports.requestsync = functions.https.onRequest((request, response) => {
  console.info(`Request SYNC for user ${globalAgentUserId}`);
  app
    .requestSync(globalAgentUserId)
    .then(res => {
      console.log('Request sync completed');
      response.json({ res });
    })
    .catch(err => {
      console.error(err);
    });
});

/**
 * Send a REPORT STATE call to the homegraph when data for any device id
 * has been changed.
 */
exports.reportstate = functions.database.ref('{deviceId}').onWrite((change, context) => {
  console.info('Firebase write event triggered this cloud function');

  if (!app.jwt) {
    console.warn('Service account key is not configured, jwt');
    console.warn('Report state is unavailable');
    return undefined;
  }
  const snapshotVal = change.after.val();

  console.warn('snapshotVal', snapshotVal);

  const postData: SmartHomeV1ReportStateRequest = {
    requestId: shortid.generate(),
    agentUserId: globalAgentUserId,
    payload: {
      devices: {
        states: {
          [context.params.deviceId]: {
            on: snapshotVal.OnOff.on,
            thermostatMode: snapshotVal.ThermostatMode.thermostatMode,
            thermostatTemperatureSetpoint: snapshotVal.ThermostatMode.temperature,
          },
        },
      },
    },
  };

  return app.reportState(postData).then(data => {
    console.log('Report state came back');
    console.info(data);
  });
});

export const dialogflowFirebaseFulfillment = functions.https.onRequest(dialogflowApp);
