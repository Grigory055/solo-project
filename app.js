require('@babel/register');
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const path = require('path');

const session = require('express-session');
const FileStore = require('session-file-store')(session);

const indexRouter = require('./src/routes/index');
const regRouter = require('./src/routes/registration');
const logRouter = require('./src/routes/login');
const categoryRouter = require('./src/routes/category');
const contactRouter = require('./src/routes/map');
const homeRouter = require('./src/routes/home');

const getTime = require('./src/middlewares/common');
const { checkUser } = require('./src/middlewares/checkUser')
const dbConnectionCheck = require('./db/dbConnectCheck');

const app = express();
const { PORT } = process.env;

const sessionConfig = {
  name: 'cookieName', // не забудь указать то же имя и при удалении куки
  store: new FileStore(),
  secret: process.env.SESSION_SECRET ?? 'Mellon', // SESSION_SECRET в .env
  resave: false, // если true, пересохранит сессию, даже если она не менялась
  saveUninitialized: false, // если false, куки появятся только при установке req.session
  cookie: {
    maxAge: 24 * 1000 * 60 * 60, // время жизни в ms, 24(h)*1000(ms)*60(sec)*60(min) = 86400000
    httpOnly: true, // секьюрность, оставляем true
  },
};

app.use(session(sessionConfig));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(getTime);
dbConnectionCheck();

app.use('/', indexRouter);
app.use('/reg', regRouter);
app.use('/login', logRouter);
app.use('/catalog', checkUser, categoryRouter);
app.use('/contact', contactRouter);
app.use('/home', checkUser, homeRouter);

app.get('/*', (req, res) => {
  res.redirect('/404');
});

app.listen(PORT, () => {
  console.log(`server started PORT: ${PORT}`);
});
