import { dialogflow, Suggestions } from 'actions-on-google';
import { globalDeviceId } from './constant';
import {
  commandOnOff,
  commandSetFanSpeed,
  commandSetTemperature,
  queryFirebase,
} from './device.model';
import { askCanHelp, ColorConversation, configType } from './dialogflow.model';

export const dialogflowApp = dialogflow<ColorConversation>({ debug: true });

dialogflowApp.intent('Default Welcome Intent', conv => {
  return queryFirebase(globalDeviceId).then(data => {
    let message = `currently off, would you like to turn it on?`;
    if (data.on) {
      message = `set to ${data.thermostatMode}.`;
    }
    conv.ask(
      `Hi the current temputure is ${data.temperatureAmbient} degrees.  Your device is ${message}`,
    );

    if (!data.on) {
      conv.ask(new Suggestions('Yes', 'No'));
    } else {
      askCanHelp(conv, true);
    }
  });
});

dialogflowApp.intent('Default Welcome Intent - yes', conv => {
  conv.ask(`Ok Turning it on now.`);
  commandOnOff(globalDeviceId, true);
  askCanHelp(conv, false);
});

dialogflowApp.intent<{ configOptions: configType }>('change_config', (conv, { configOptions }) => {
  const config: configType = (conv.arguments.get('OPTION') as configType) || configOptions;
  // conv.ask(`about to change ${config}`);

  if (config === 'temperature') {
    conv.ask('What temperature would you like?');
    // conv.followup('apply-config-temperature');
  } else if (config === 'fan') {
    conv.ask('What speed should I set the fan to?');
    // conv.followup('apply-config-fan');
  } else if (config === 'mode') {
    conv.ask('What mode would you like?');
    conv.ask(new Suggestions('Heat', 'Cool'));
    // conv.followup('apply-config-mode');
    // conv.ask()
  } else {
    conv.close('no valid config found');
  }
});

dialogflowApp.intent<{ configFanSpeed: string }>(
  'change_config - fan',
  (conv, { configFanSpeed }) => {
    commandSetFanSpeed(globalDeviceId, configFanSpeed);
    conv.ask(`Setting the fan to ${configFanSpeed} now`);
    askCanHelp(conv, false);
  },
);

// dialogflowApp.intent<{ temperature: number }>('config_temperature', (conv, { temperature }) => {
//   commandSetTemperature(globalDeviceId, temperature);
//   askCanHelp(conv, false);
//   // conv.close('Done!');
// });

// dialogflowApp.intent<{ configMode: string }>('config_mode', (conv, { configMode }) => {
//   conv.close('sorry dont know how to use the mode settings yet!' + configMode);
//   askCanHelp(conv, false);

// });

// dialogflowApp.intent<{ configFanSpeed: string }>('config_fan', (conv, { configFanSpeed }) => {
//   conv.close('sorry dont know how to use the fan settings yet!' + configFanSpeed);
//   commandSetFanSpeed(globalDeviceId, configFanSpeed);
//   askCanHelp(conv, false);
//   // conv.close('Done!');
// });
