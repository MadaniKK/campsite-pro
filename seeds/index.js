const mongoose = require('mongoose');
const cities = require('./cities'); //array 
const { places, descriptors } = require('./seedHelpers'); //arrays
const Campground = require('../models/campground');
const { func } = require('joi');
const Review = require('../models/review')

mongoose.connect('mongodb://localhost:27017/only-camps', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => { console.log("database connected") });
const sample = array => array[Math.floor(Math.random() * array.length)]

// const seedDB = async () => {
//     await Campground.deleteMany({});
//     for (let i = 0; i < 50; i++) {
//         const price = Math.floor(Math.random() * 20) + 10;
//         camp = new Campground({
//             location: `${sample(cities).city}, ${sample(cities).state}`,
//             title: `${sample(descriptors)} ${sample(places)}`,
//             price: price,
//             image: "https://source.unsplash.com/collection/483251",
//             description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore, quia at voluptate itaque eveniet eaque quisquam explicabo? Laboriosam, beatae sed dolor doloribus fuga, odit earum voluptas corporis voluptate, et iure\
// Eveniet, sapiente.Iure praesentium sint suscipit error, nihil consequuntur dolorum? Voluptatum similique soluta, voluptas ab at explicabo beatae fuga, architecto dolore harum laboriosam earum eaque! Explicabo iusto aut commodi natus"

//         })
//         await camp.save()
//     }
// }

// seedDB().then(async () => {
//     camps = await Campground.find({})
//     console.log(camps)
//     db.close()
// })

const deleteAllReview = async () => {
    await Review.deleteMany({})

}

deleteAllReview().then(() => {
    db.close()
})