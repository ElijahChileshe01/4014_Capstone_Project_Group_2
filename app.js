const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayouts = require('express-layouts');
const router = express.Router();
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
// const router = express.Router();

const app = express();

// router.use(bodyParser())

//Passport config
require('./config/passport')(passport);

//connect to MongoDB 
mongoose.connect("mongodb+srv://Elijah:0000@cluster0.74ehc.mongodb.net/4014_Project", { useNewUrlParser: true, useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
const db = mongoose.connection;

db.on('error', (err)=>{
  console.log(err)
})

db.once('open', ()=>{
  console.log('Database has successfully connected');
})
// view engine setup to EJS
app.use(expressLayouts); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//Body-parser helps obtain data from form using req.body
app.use(express.urlencoded({ extended: false }));

// const urlencodedParser = bodyParser.urlencoded({extended: false})

app.use(logger('dev'));
app.use(express.json());         
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global variables for different colors of flash messages 
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error  = req.flash('error');
  next();
})

// --- Application Routers ---
const depositRouter = require('./routes/fileupload');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const syncRouter = require('./routes/synchronize')

//Application Routers
app.use('/fileupload', depositRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/sync', syncRouter);



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

//Set application to run on port 5500
app.listen(3500,()=>{
  console.log('Application is running on port 3500')
})

module.exports = app;
