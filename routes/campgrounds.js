const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const Campground = require('../models/campground');
const { CampgroundSchema, } = require('../schemas.js');
const morgan = require('morgan');
const AppError = require('../utils/AppError');
const bcrypt = require('bcrypt');
const { isLoggedIn } = require('../middleware.js');


const hashPassword = async (pw) => {
    const salt = await bcrypt.genSalt(10);
    // const hash = await bcrypt.hash(pw, salt);
    const hash = await bcrypt.hash(pw, 12);
}

const login = async (pw, hashedPw) => {
    const result = await bcrypt.compare(pw, hashedPw)
}


// router.get('/', (req, res) => {
//     res.render('home')
// })
const validateCampground = (req, res, next) => {
    const { error } = CampgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg, 400);
    } else {
        next();
    }

}

router.use(morgan('dev'));

router.get('/', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})
// new has to be in front of /:id
router.get('/new', isLoggedIn, (req, res) => {
    console.log(req.isAuthenticated());
    res.render('campgrounds/new');
})
router.post('/', validateCampground, wrapAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);

    await campground.save();
    req.flash('success', "Campground successfully made!");
    res.redirect(`/campgrounds/${campground._id}`);
    // res.redirect(`/campgrounds`)
}))

router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    // console.log(campground);
    if (!campground) {
        req.flash('error', "Campground does not exist");
        return res.redirect('/campgrounds');

        // throw new AppError("Camp not found", 404);
    }
    res.render('campgrounds/show', { campground });
}))

router.get('/:id/edit', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', "Campground does not exist");
        return res.redirect('/campgrounds');

        // throw new AppError("Camp not found", 404);
    }
    res.render('campgrounds/edit', { campground });
})

router.put('/:id', validateCampground, async (req, res) => {
    const { id } = req.params;
    console.log(req.body)
    const camp = await Campground.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${id}`);
})



router.delete('/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds')
})

module.exports = router