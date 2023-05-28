const express = require('express');
const passport = require('passport');
const router = express.Router()
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const { storeReturnTo } = require('../middleware');


router.get('/register', (req, res) => {
    // res.send("registerhaha")
    res.render('users/register');
})

router.post('/register', wrapAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User(req.body);
        console.log(user);
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Welcome to camp!');
            res.redirect('/campgrounds');
        })

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register')
    }


}))


router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);

})

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});

module.exports = router;