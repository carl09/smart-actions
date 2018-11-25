import { SmartHomeJwt } from 'actions-on-google';

export interface Environment {
  apikey: string;
  jwt: SmartHomeJwt;
}

export const environment: Environment = {
  apikey: '',
  jwt: undefined,
};
