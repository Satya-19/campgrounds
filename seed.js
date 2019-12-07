var mongoose = require("mongoose"),
    allCampgrounds = require("./models/campground"),
    Comment = require("./models/comment");

var data = [
    {
        name: "camp1",
        image: "https://live.staticflickr.com/6136/5941471827_40e9c39b00_b.jpg",
        description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    {
        name: "camp2",
        image: "https://live.staticflickr.com/6030/5942076708_80654b062d_b.jpg",
        description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    }
];

function seedDB() {
    allCampgrounds.remove({}, function (err) {
        if (err) console.log(err);
        else console.log("All campgrounds removed");
        // data.forEach(function (seed) {
        //     allCampgrounds.create(seed, function (err, allCampgrounds) {
        //         if (err) console.log(err);
        //         else console.log("New camp created");
        //     });
        // });
    });
}

module.exports = seedDB;
