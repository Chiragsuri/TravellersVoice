const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

//creating a valdate campground function which checks as schemas inputs
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//index page of campgrounds view directory
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

/* ORDER DOES MATTER NUB */

//Add new campground using campgrounds view directory
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

//POST REQ OF NEW CAMPGROUNDS
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

//Show page of campgrounds view directory
router.get('/:id', catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

//EDIT REQ OF CAMPGROUNDS
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

//PUT REQ of EDIT REQ of campground
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}));

//DELETE A CAMPGROUND
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}));

module.exports = router;