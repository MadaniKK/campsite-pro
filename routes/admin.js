const express = require('express');
const router = express.Router();


router.use((req, res, next) => {
    if (req.query.isAdmin) {
        next();
    }
    res.send("Sry ur not an admin!")
})

router.get('/topsecret', (req, res) => {
    res.send("This is TOP SECCRET!");
})

router.get('/deleteeveything', (req, res) => {
    res.send("Delete it all");
})
module.exports = router