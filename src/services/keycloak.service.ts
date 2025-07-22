import axios from 'axios';
import { ENV } from '../utils/env';
import logger from '../utils/logger';

const base = `${ENV.KEYCLOAK_BASE_URL}/realms/${ENV.KEYCLOAK_REALM}/protocol/openid-connect`;

let adminToken: string | null = null;
let tokenExpires = 0;

async function getAdminToken() {
  if (adminToken && Date.now() < tokenExpires) {
    return adminToken;
  }

  try {
    const response = await axios.post(
      `${ENV.KEYCLOAK_BASE_URL}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: ENV.KEYCLOAK_ADMIN_USER,
        password: ENV.KEYCLOAK_ADMIN_PASS,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    adminToken = response.data.access_token;
    // Set expiry to 1 minute before actual expiry to be safe
    tokenExpires = Date.now() + (response.data.expires_in - 60) * 1000;
    return adminToken;
  } catch (error) {
    logger.error('Failed to get Keycloak admin token', error);
    throw new Error('Failed to get Keycloak admin token');
  }
}

export const keycloakService = {
  async logout(refreshToken: string) {
    const params = new URLSearchParams({
      client_id: ENV.KEYCLOAK_CLIENT_ID,
      client_secret: ENV.KEYCLOAK_CLIENT_SECRET,
      refresh_token: refreshToken,
    });

    await axios.post(`${base}/logout`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },

  async userExists(username: string, email?: string) {
    const adminToken = await getAdminToken();
    // Search for user by username (strict match)
    if (username) {
      const { data: users } = await axios.get(`${ENV.KEYCLOAK_BASE_URL}/admin/realms/${ENV.KEYCLOAK_REALM}/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        params: { username },
      });
      if (Array.isArray(users) && users.some((u: any) => u.username === username)) return true;
    }
    // Optionally check by email (strict match)
    if (email) {
      const { data: emailUsers } = await axios.get(`${ENV.KEYCLOAK_BASE_URL}/admin/realms/${ENV.KEYCLOAK_REALM}/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        params: { email },
      });
      if (Array.isArray(emailUsers) && emailUsers.some((u: any) => u.email === email)) return true;
    }
    return false;
  },

  async registerUser({ username, email, password }: { username: string, email: string, password: string }) {
    const adminToken = await getAdminToken();

    // Create user (without credentials)
    const userRes = await axios.post(`${ENV.KEYCLOAK_BASE_URL}/admin/realms/${ENV.KEYCLOAK_REALM}/users`, {
      username,
      email,
      enabled: true,
      emailVerified: true,
      requiredActions: [],
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (userRes.status !== 201) return false;

    // Get the user ID from the Location header
    const location = userRes.headers['location'] || userRes.headers['Location'];
    const userId = location ? location.split('/').pop() : null;
    if (!userId) return false;

    // Set password using reset-password endpoint
    await axios.put(`${ENV.KEYCLOAK_BASE_URL}/admin/realms/${ENV.KEYCLOAK_REALM}/users/${userId}/reset-password`, {
      type: 'password',
      value: password,
      temporary: false,
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    // Explicitly clear required actions
    await axios.put(`${ENV.KEYCLOAK_BASE_URL}/admin/realms/${ENV.KEYCLOAK_REALM}/users/${userId}`, {
      requiredActions: []
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    return true;
  },
  getAdminToken,
};