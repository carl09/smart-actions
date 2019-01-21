import { Contexts, DialogflowConversation, List, Carousel } from 'actions-on-google';

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

export type configType = 'fan' | 'temperature' | 'mode';

export const configCarouselV2 = (): Carousel => {
  const carousel = new Carousel({
    items: {
      fan: {
        title: 'Fan Speed',
        description: 'The Fan Speed',
        optionInfo: {
          key: 'fan',
          synonyms: ['fan', 'fan speed'],
        },
        image: {
          url: 'https://smart-actions.firebaseapp.com/assets/carousel-fan.png',
          accessibilityText: 'Fan Icon',
        },
      },
      temperature: {
        title: 'Temperature',
        description: 'The Temperature',
        optionInfo: {
          key: 'temperature',
          synonyms: ['fan', 'fan speed'],
        },
        image: {
          url: 'https://smart-actions.firebaseapp.com/assets/carousel-temperature.png',
          accessibilityText: 'Temperature Icon',
        },
      },
      mode: {
        title: 'Mode',
        description: 'The Device Mode',
        optionInfo: {
          key: 'mode',
          synonyms: ['heating', 'cooling'],
        },

        image: {
          url: 'https://smart-actions.firebaseapp.com/assets/carousel-mode.png',
          accessibilityText: 'Mode Icon',
        },
      },
    },
  });
  return carousel;
};

export const configCarousel = (): List => {
  const carousel = new List({
    items: {
      fan: {
        title: 'Fan Speed',
        description: 'The Fan Speed',
        synonyms: ['fan', 'fan speed'],
        image: {
          url: 'https://smart-actions.firebaseapp.com/assets/fan.png',
          accessibilityText: 'Fan Icon',
        },
      },
      temperature: {
        title: 'Temperature',
        description: 'The Temperature',
        synonyms: ['temperature', 'heat'],
        image: {
          url: 'https://smart-actions.firebaseapp.com/assets/temperature.png',
          accessibilityText: 'Temperature Icon',
        },
      },
      mode: {
        title: 'Mode',
        description: 'The Device Mode',
        synonyms: ['heating', 'cooling'],
        image: {
          url: 'https://smart-actions.firebaseapp.com/assets/mode.png',
          accessibilityText: 'Mode Icon',
        },
      },
    },
  });
  return carousel;
};

export const askCanHelp = (conv: ColorConversation, init: boolean) => {
  if (init) {
    // conv.ask(...['How can i help?', 'What can i help you with?']);
    conv.ask('What can i help you with?');
  } else {
    conv.ask('Is there anything else I can help with?');
    // conv.ask(...[
    //     'Is there anything else I can help with?',
    //     'Is there anything else I can do?',
    //     'Would you like to make any other changes?',
    // ]);
  }

  if (conv.screen) {
    conv.ask(configCarouselV2());
  }
};
