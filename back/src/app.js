import express from 'express';
import handlebars from 'express-handlebars';
import session from 'express-session';
import path from 'path';
import { petsRouter } from './routes/pets.router.js';
import { testSocketChatRouter } from './routes/test.socket.chat.router.js';
import { usersHtmlRouter } from './routes/users.html.router.js';
import { usersRouter } from './routes/users.router.js';
import { __dirname, connectMongo, connectSocket, isAdmin } from './utils.js';

const app = express();
const port = 3000;

const httpServer = app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});

connectMongo();
connectSocket(httpServer);

//CONFIG EXPRESS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'un-re-secreto', resave: true, saveUninitialized: true }));

app.get('/login', (req, res) => {
  //console.log(req.session.user, req.session.admin);
  const { username, password } = req.query;
  if (username !== 'pepe' || password !== 'pepepass') {
    return res.send('login failed');
  }
  req.session.user = username;
  req.session.admin = true;
  res.send('login success!');
});

app.get('/logout', (req, res) => {
  // console.log(req?.session?.user, req?.session?.admin);
  req.session.destroy((err) => {
    if (err) {
      return res.json({ status: 'Logout ERROR', body: err });
    }
    res.send('Logout ok!');
  });
  // console.log(req?.session?.user, req?.session?.admin);
});

/* app.get('/session', (req, res) => {
  if (req.session.cont) {
    console.log(req.session, req.sessionID);
    req.session.cont++;
    req.session.name = 'guille';
    res.send('nos visitaste ' + req.session.cont);
  } else {
    req.session.cont = 1;
    res.send('nos visitaste ' + 1);
  }
}); */

/* app.use(cookieParser('secret-code-72'));

app.use('/api/set-cookies', (req, res) => {
  res.cookie('name', 'guille', { maxAge: 10000000, signed: true, httpOnly: true });
  res.cookie('isAdmin', 'true', { maxAge: 10000000, signed: true });
  res.cookie('email', 'guille@gmail.com', { maxAge: 10000000, signed: true });
  return res.status(200).json({
    status: 'error',
    msg: 'te meti las cookies!!!!',
    data: {},
  });
});

app.use('/api/get-cookies', (req, res) => {
  console.log('normales', req.cookies);
  console.log('firmadas', req.signedCookies);
  return res.status(200).json({
    status: 'ok',
    msg: 'vea la consola para ver las cookies',
    data: {},
  });
});

app.use('/api/del-cookies', (req, res) => {
  res.clearCookie('isAdmin');
  return res.status(200).json({
    status: 'ok',
    msg: 'vea la consola para ver las cookies',
    data: {},
  });
}); */

//CONFIG RUTAS
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/users', isAdmin, usersHtmlRouter);
app.use('/test-chat', testSocketChatRouter);
app.get('*', (req, res) => {
  return res.status(404).json({
    status: 'error',
    msg: 'no encontrado',
    data: {},
  });
});
