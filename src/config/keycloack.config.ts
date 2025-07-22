import { ENV } from './index';

export const keycloakConfig = {
  realm: ENV.KEYCLOAK_REALM,
  'auth-server-url': `${ENV.KEYCLOAK_BASE_URL}/`,
  'ssl-required': 'external',
  resource: ENV.KEYCLOAK_CLIENT_ID,
  credentials: {
    secret: ENV.KEYCLOAK_CLIENT_SECRET,
  },
  'confidential-port': 0,
};