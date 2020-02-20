var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var config = require('./config.js');

// モデルの読み込み
var User = require('./models/user');
var Post = require('./models/post');
var Evaluation = require('./models/evaluation');
var Fixture = require('./models/fixture');
Fixture.sync();
User.sync().then(() => {
  Evaluation.belongsTo(User, { foreignKey: 'userId' });
  Post.belongsTo(User, { foreignKey: 'postedBy' });
  Post.sync().then(() => {
    Evaluation.belongsTo(Post, { foreignKey: 'postId' });
    Evaluation.sync();
  });
});

//GitHubでログインします
passport.use(new GitHubStrategy({
  clientID: config.github.GITHUB_CLIENT_ID,
  clientSecret: config.github.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://example.net:8000/auth/github/callback'
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      const userId = profile.provider + profile.id;  // サロゲートキー
      User.upsert({
        userId: userId,
        username: profile.username,
        thumbUrl: profile.photos[0].value
      }).then(() => {
        done(null, profile);
      });
    });
  }
));

//Twitterでログインします
passport.use(new TwitterStrategy({
  consumerKey: config.twitter.TWITTER_CONSUMER_KEY,
  consumerSecret: config.twitter.TWITTER_CONSUMER_SECRET,
  callbackURL: 'http://example.net:8000/auth/twitter/callback'
},
function(token, tokenSecret, profile, done) {
  process.nextTick(function () {
    const userId = profile.provider+profile.id  //サロゲートキー
    User.upsert({
      userId: userId,
      username: profile.username,
      thumbUrl: profile.photos[0].value
    }).then(() => {
      done(null, profile);
    });
    });
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

//ルーターオブジェクトの登録
var indexRouter = require('./routes/index');
var fixturesRouter = require('./routes/fixtures');
var manageRouter = require('./routes/manage');
var evaluationRouter = require('./routes/evaluations');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//session,passport の使用
app.use(session({ secret: '5b04d0ad49a2c506', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

//ルーターオブジェクトの利用
app.use('/', indexRouter);
app.use('/fixtures', fixturesRouter);
app.use('/fixtures', evaluationRouter);
app.use('/manage', manageRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);

// GitHub認証へのアクセス
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {
});
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('/');
});

// Twitter認証へのアクセス
app.get('/auth/twitter',
  passport.authenticate('twitter', { scope: ['user:email'] }),
  function (req, res){
});
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
