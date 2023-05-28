const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { ReviewSchema } = require('../schemas.js');
const morgan = require('morgan');
const AppError = require('../utils/AppError');
const { isLoggedIn } = require('../middleware.js');


const validateReview = (req, res, next) => {
    const { error } = ReviewSchema.validate(req.body);
    console.log(req.body.review)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }

}

router.post('/', validateReview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { rating, body } = req.body;
    // res.send(req.body);
    const review = new Review(req.body.review);
    review.camp = id;


    const campground = await Campground.findById(id);
    // console.log(campground)
    campground.reviews.push(review);

    await campground.save();
    await review.save();
    req.flash('success', 'Successfully made a review');
    res.redirect(`/campgrounds/${id}`);

}))


router.delete('/:reviewId', isLoggedIn, async (req, res) => {
    const { id, reviewId } = req.params
    const camp = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    // await camp.save()
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`)
})

module.exports = router