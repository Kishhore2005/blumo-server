export {};

declare module 'express-serve-static-core' {
  interface Request {
    kauth?: {
      grant?: {
        access_token: { token: string };
        refresh_token: { token: string };
        id_token: { token: string };
        token: string;
      };
    };
  }
}