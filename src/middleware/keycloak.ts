import Keycloak from 'keycloak-connect';
import session from 'express-session';
import { keycloakConfig } from '../config/keycloack.config';

const memoryStore = new session.MemoryStore();

export const sessionMiddleware = session({
  secret: 'blumo-secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
});

// Keycloak middleware is no longer used for API authentication.