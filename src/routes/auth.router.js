import express from 'express';
import { UserModel } from '../DAO/models/users.model.js';
// import { UserService } from '../services/users.service.js';
import { isAdmin, isUser } from '../middlewares/auth.js';

export const authRouter = express.Router();

authRouter.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render('error', { error: 'no se pudo cerrar su session' });
    }
    return res.redirect('/auth/login');
  });
});

authRouter.get('/perfil', isUser, (req, res) => {
  const user = { email: req.session.email, isAdmin: req.session.isAdmin };
  return res.render('perfil', { user: user });
});

authRouter.get('/administracion', isUser, isAdmin, (req, res) => {
  return res.send('datos super secretos clasificados sobre los nuevos ingresos a boca juniors');
});

authRouter.get('/login', (req, res) => {
  return res.render('login', {});
});

authRouter.post('/login', async (req, res) => {
  const { email, pass } = req.body;
  if (!email || !pass) {
    return res.status(400).render('error', { error: 'ponga su email y pass' });
  }
  const usarioEncontrado = await UserModel.findOne({ email: email });
  if (usarioEncontrado && usarioEncontrado.pass == pass) {
    req.session.email = usarioEncontrado.email;
    req.session.isAdmin = usarioEncontrado.isAdmin;

    return res.redirect('/auth/perfil');
  } else {
    return res.status(401).render('error', { error: 'email o pass estan mal' });
  }
});

authRouter.get('/register', (req, res) => {
  return res.render('register', {});
});

authRouter.post('/register', async (req, res) => {
  const { email, pass, firstName, lastName } = req.body;
  if (!email || !pass || !firstName || !lastName) {
    return res.status(400).render('error', { error: 'ponga bien toooodoo cheee!!' });
  }
  try {
    await UserModel.create({ email: email, pass: pass, firstName: firstName, lastName: lastName, isAdmin: false });
    req.session.email = email;
    req.session.isAdmin = false;

    return res.redirect('/auth/perfil');
  } catch (e) {
    console.log(e);
    return res.status(400).render('error', { error: 'no se pudo crear el usuario. Intente con otro mail.' });
  }
});
