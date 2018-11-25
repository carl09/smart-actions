import {
  Carousel,
  Contexts,
  dialogflow,
  DialogflowConversation,
  List,
  Suggestions,
} from 'actions-on-google';
import { globalDeviceId } from './constant';
import { commandOnOff, commandSetTemperature, queryFirebase } from './device.model';

export interface ColorConversation<
  TData = IColor,
  TUserStorage = IColorUser,
  TContexts extends Contexts = Contexts
> extends DialogflowConversation<TData, TUserStorage, TContexts> {}

export interface IColor {
  userName: string;
}

export interface IColorUser {
  userName: string;
}

const configCarousel = (): List => {
  const carousel = new List({
    items: {
      fan: {
        title: 'Fan Speed',
        description: 'The Fan Speed',
        synonyms: ['fan', 'fan speed'],
      },
      temperature: {
        title: 'Temperature',
        description: 'The Temperature',
        synonyms: ['temperature', 'heat'],
      },
      mode: {
        title: 'Mode',
        description: 'The Device Mode',
        synonyms: ['heating', 'cooling'],
      },
    },
  });
  return carousel;
};

export const dialogflowApp = dialogflow<ColorConversation>({ debug: true });

dialogflowApp.intent('Default Welcome Intent', conv => {
  return queryFirebase(globalDeviceId).then(data => {
    let message = `off, would you like to turn it on?`;
    if (data.on) {
      message = `set to ${data.thermostatMode}. How can i help?`;
    }
    conv.ask(
      `Hi the current temputure is ${data.temperatureAmbient} and your device is ${message}`,
    );

    if (!data.on) {
      conv.ask(new Suggestions('Yes', 'No'));
    } else {
      if (conv.screen) {
        const opt = conv.ask(configCarousel());

        console.warn('opt', opt);

        return opt;
      }
    }
    return undefined;
  });
});

dialogflowApp.intent('Default Welcome Intent - yes', conv => {
  conv.ask(`Ok Turning it on now.`);
  commandOnOff(globalDeviceId, true);
});

dialogflowApp.intent<{ configOptions: string }>('change_config', (conv, { configOptions }) => {
  const config = conv.arguments.get('OPTION') || configOptions;
  conv.ask(`about to change ${config}`);

  // if (config === 'temperature'){
  conv.followup('apply-config-temperature');
  //   } else {
  //     conv.close('Thanks');
  //   }

  //
});

dialogflowApp.intent<{ temperature: number }>('config_temperature', (conv, { temperature }) => {
  commandSetTemperature(globalDeviceId, temperature);
  conv.close('Thanks');
});
