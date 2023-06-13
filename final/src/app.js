import express from 'express';
import handlebars from 'express-handlebars';
import session from 'express-session';
import FileStore from 'session-file-store';
const FileStoreSession = FileStore(session);
import path from 'path';
import { petsRouter } from './routes/pets.router.js';
import { testSocketChatRouter } from './routes/test.socket.chat.router.js';
import { usersHtmlRouter } from './routes/users.html.router.js';
import { usersRouter } from './routes/users.router.js';
import { __dirname, connectMongo, connectSocket, isAdmin, isLogedIn } from './utils.js';
import MongoStore from 'connect-mongo';
import { UserModel } from './DAO/models/users.model.js';
import { sessionRouter } from './routes/session.router.js';

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
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://guillermofergnani:DBeXuiDCQMqLyMTa@51380.yhqtnxt.mongodb.net/ecommerce?retryWrites=true&w=majority', ttl: 1000 }),
    secret: 'un-re-secreto',
    resave: true,
    saveUninitialized: true,
  })
);

app.get('/profile', isLogedIn, (req, res) => {
  const user = { email: req.session.email, isAdmin: req.session.isAdmin };
  return res.status(403).render('profile', { user: user });

  //return res.send('session: ' + JSON.stringify(req.session));
});

app.get('/secret', isAdmin, (req, res) => {
  return res.send('lugar re secreto');
});

//CONFIG RUTAS
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/users', usersHtmlRouter);
app.use('/test-chat', testSocketChatRouter);
app.use('/session', sessionRouter);
app.get('*', (_, res) => {
  return res.status(404).json({
    status: 'error',
    msg: 'no encontrado',
    data: {},
  });
});
