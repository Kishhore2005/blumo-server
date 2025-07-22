import { Router } from 'express';
import { apiAuth } from '../middleware/apiAuth';
import {
  checkSession,
  login,
  logout,
  userInfo,
  register,
  changePassword,
  checkUsername,
  checkEmail,
  updateProfile,
} from '../controllers/auth.controller';

const router = Router();

router.get('/session', apiAuth, checkSession);
router.post('/login', login);
router.post('/logout', apiAuth, logout);
router.post('/register', register);
router.post('/change-password', apiAuth, changePassword);
router.get('/userinfo', apiAuth, userInfo);
router.get('/check-username', checkUsername);
router.get('/check-email', checkEmail);
router.put('/profile', apiAuth, updateProfile);

export default router;