const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const AppError = require('./utils/AppError')
const passport = require('passport')
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// const cookieParser = require('cookie-parser');
const session = require('express-session');
const sessionConfig = {
    secret: 'thisisnotagoodsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
const flash = require('connect-flash');
// require routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');


const { connected } = require('process');




mongoose.connect('mongodb://localhost:27017/only-camps', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useStrictQuery: false,
});
// mongoose.set('strictQuery', true);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongoose connection error:"));
db.once("open", () => { console.log("database connected!"); })
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(morgan('dev'));
// app.use(cookieParser('this is my secret'))
app.use(session(sessionConfig));
app.use(flash());
app.use(express.static('public'))
// has to bbe after the app.use session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// has to be before the routes
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes)


// const addDate = (req, res, next) => {
//     req.requestTime = Date.now();
//     console.log(req.method);
//     next();

// }
// app.use(addDate);

// app.use('/dogs', (req, res, next) => {
//     console.log("i love dogs");
//     next();
// })



const verifyPassword = (req, res, next) => {
    const { password } = req.query;
    if (password === 'chickennugget') {
        return next();
    }
    throw new AppError("password needed", 400);
    // res.send('sorry you need a password')
}



app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'riletyyy@gmail.com', username: 'riley' });
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);

})

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/viewcount', (req, res) => {
    if (req.session.count) {
        req.session.count += 1

    } else {
        req.session.count = 1
    }
    res.send(`You have viewed this page ${req.session.count} time(s)`)
})
// app.get('/register', (req, res) => {
//     const { username = 'Anonymous' } = req.query;
//     req.session.username = username
//     res.redirect('/greet')
// })


app.get('/greet', (req, res) => {
    // console.log(req.cookies)
    const { username } = req.session;
    res.send(`Welcome back, ${username}`)
})

app.get('/setname', (req, res) => {
    res.cookie('name', 'stevie chicks');
    res.cookie('animal', 'shrimp');

    res.send('you send a cookie!')
})

app.get('/getsignedcookie', (req, res) => {
    res.cookie('fruit', 'grape', { signed: true })
    res.send("oksigned ur cookie")
})
app.get('/verifyfruit', (req, res) => {
    res.cookie('fruit', 'grape', { signed: true })
    res.send("oksigned ur cookie")
})

app.get('/secret', verifyPassword, (req, res) => {
    res.send("My secret is I love shooting threes!")
})


app.get('/admin', (req, res) => {
    throw new AppError('You are not an Admin', 403);
})


app.use((req, res) => {
    res.status(404).send('Page Not Found');

})

// app.use(errorHandler)
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something Went Wrong' } = err;
    if (!err.message) err.message = 'Something Went Wrong'
    res.status(statusCode).render('error', { err })

})

app.listen(3000, () => {
    console.log("app is listening on port 3000");
})