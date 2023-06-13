import MongoStore from 'connect-mongo';
import express from 'express';
import handlebars from 'express-handlebars';
import session from 'express-session';
import path from 'path';
import { authRouter } from './routes/auth.router.js';
import { petsRouter } from './routes/pets.router.js';
import { testSocketChatRouter } from './routes/test.socket.chat.router.js';
import { usersHtmlRouter } from './routes/users.html.router.js';
import { usersRouter } from './routes/users.router.js';
import { __dirname, connectMongo, connectSocket } from './utils.js';

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

app.use(
  session({
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://guillermofergnani:DBeXuiDCQMqLyMTa@51380.yhqtnxt.mongodb.net/ecommerce?retryWrites=true&w=majority', ttl: 7200 }),
    secret: 'un-re-secreto',
    resave: true,
    saveUninitialized: true,
  })
);

/* app.get('/show-session', (req, res) => {
  return res.send(JSON.stringify(req.session));
}); */

/* app.get('/login', (req, res) => {
  const { username, password } = req.query;
  if (username !== 'pepe' || password !== 'pepepass') {
    return res.send('login failed');
  }
  req.session.user = username;
  req.session.admin = true;
  res.send('login success!');
}); */

/* app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.json({ status: 'Logout ERROR', body: err });
    }
    res.send('Logout ok!');
  });
}); */

//CONFIG RUTAS
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/users', usersHtmlRouter);
app.use('/test-chat', testSocketChatRouter);
app.use('/auth', authRouter);
app.get('*', (req, res) => {
  return res.status(404).json({
    status: 'error',
    msg: 'no encontrado',
    data: {},
  });
});
