import express from 'express';
import { UserModel } from '../DAO/models/users.model.js';

export const sessionRouter = express.Router();
sessionRouter.post('/register', async (req, res) => {
  const { firstName, lastName, email, pass } = req.body;
  if (!firstName || !lastName || !email || !pass) {
    return res.status(400).render('error', { error: 'completa todos los campos' });
  }

  const user = await UserModel.findOne({ email: email });
  if (user) {
    return res.status(400).render('error', { error: 'email ocupado' });
  }

  const userToCreate = { firstName, lastName, email, pass, isAdmin: false };
  try {
    const userCreated = await UserModel.create(userToCreate);
    req.session.email = email;
    req.session.isAdmin = false;
    return res.redirect('/profile');
  } catch (e) {
    console.log(e);
    return res.status(500).render('error', { error: 'error inesperado' });
  }
});

sessionRouter.get('/login', async (req, res) => {
  return res.render('login', {});
});

sessionRouter.get('/register', async (req, res) => {
  return res.render('register', {});
});

sessionRouter.post('/login', async (req, res) => {
  const { email, pass } = req.body;
  console.log(req.body);
  if (!email || !pass) {
    return res.status(400).render('error', { error: 'complete email and pass' });
  }

  const user = await UserModel.findOne({ email: email });

  if (user && user.pass == pass) {
    req.session.email = email;
    if (user.isAdmin) {
      req.session.isAdmin = true;
    } else {
      req.session.isAdmin = false;
    }
    return res.redirect('/profile');
  } else {
    return res.status(400).render('error', { error: 'usuario o email incorrecto' });
  }
});

sessionRouter.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render('error', { error: 'error inesperado no se pudo eliminar session' });
    }
    return res.redirect('/session/login');
  });
});
