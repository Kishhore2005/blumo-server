import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT || 4000),
  KEYCLOAK_BASE_URL: process.env.KEYCLOAK_BASE_URL!,
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM!,
  KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID!,
  KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET!,
  FRONTEND_URL: process.env.FRONTEND_URL!,
  KEYCLOAK_ADMIN_USER: process.env.KEYCLOAK_ADMIN_USER!,
  KEYCLOAK_ADMIN_PASS: process.env.KEYCLOAK_ADMIN_PASS!,
};