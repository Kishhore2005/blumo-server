import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { keycloakService } from '../services/keycloak.service';
import axios from 'axios';
import { z } from 'zod';
import { ENV } from '../utils/env';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const checkSession = (req: Request, res: Response) => {
  res.json({ authenticated: true });
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if ((!username && !email) || !password) {
    return res.status(400).json({ message: 'Username or email and password required.' });
  }

  // Use username if provided, otherwise use email
  const loginId = username || email;

  try {
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: ENV.KEYCLOAK_CLIENT_ID,
      client_secret: ENV.KEYCLOAK_CLIENT_SECRET,
      username: loginId,
      password,
    });

    const { data } = await axios.post(
      `${ENV.KEYCLOAK_BASE_URL}/realms/${ENV.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    res.json(data);
  } catch (err: any) {
    res.status(401).json({ message: 'Invalid username/email or password.' });
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ message: 'Refresh token not provided.' });
  }
  await keycloakService.logout(refresh_token);
  res.json({ message: 'Logged out' });
});

export const userInfo = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json(user);
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    passwordSchema.parse(password);
  } catch (error: any) {
    const message =
      error && error.errors && Array.isArray(error.errors) && error.errors[0]
        ? error.errors[0].message
        : 'Invalid password';
    return res.status(400).json({ message });
  }

  // Check if user exists in Keycloak
  const exists = await keycloakService.userExists(username, email);
  if (exists) {
    // User already exists, return 409 Conflict
    return res.status(409).json({ message: 'User already registered. Please log in.' });
  }
  // Create user in Keycloak
  const created = await keycloakService.registerUser({ username, email, password });
  if (created) {
    return res.status(201).json({ message: 'Registration successful. Please log in.' });
  } else {
    return res.status(500).json({ message: 'Registration failed.' });
  }
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const user = (req as any).user;
  if (!user || !user.preferred_username) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old and new password required.' });
  }

  // 1. Verify old password by ROPC login
  try {
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: ENV.KEYCLOAK_CLIENT_ID,
      client_secret: ENV.KEYCLOAK_CLIENT_SECRET,
      username: user.preferred_username,
      password: oldPassword,
    });
    await axios.post(
      `${ENV.KEYCLOAK_BASE_URL}/realms/${ENV.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
  } catch (err: any) {
    return res.status(401).json({ message: 'Old password is incorrect.' });
  }

  // 2. Set new password via Keycloak Admin API
  try {
    const adminToken = await keycloakService.getAdminToken();
    // Find userId by username
    const { data: users } = await axios.get(
      `${ENV.KEYCLOAK_BASE_URL}/admin/realms/${ENV.KEYCLOAK_REALM}/users`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        params: { username: user.preferred_username },
      }
    );
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const userId = users[0].id;
    // Set new password
    await axios.put(
      `${ENV.KEYCLOAK_BASE_URL}/admin/realms/${ENV.KEYCLOAK_REALM}/users/${userId}/reset-password`,
      {
        type: 'password',
        value: newPassword,
        temporary: false,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    return res.json({ message: 'Password changed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to change password.' });
  }
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { name, email } = req.body;
  if (!user || !user.sub) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (!name && !email) {
    return res.status(400).json({ message: 'Nothing to update.' });
  }
  try {
    const adminToken = await keycloakService.getAdminToken();
    // Update user in Keycloak
    await axios.put(
      `${ENV.KEYCLOAK_BASE_URL}/admin/realms/${ENV.KEYCLOAK_REALM}/users/${user.sub}`,
      {
        ...(name && { firstName: name }),
        ...(email && { email }),
        ...(email && { emailVerified: true }),
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    res.json({ message: 'Profile updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

export const checkUsername = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.query;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Username is required.' });
  }
  const exists = await keycloakService.userExists(username);
  res.json({ exists });
});

export const checkEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required.' });
  }
  const exists = await keycloakService.userExists('', email);
  res.json({ exists });
});