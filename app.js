var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    allCampground = require("./models/campground"),
    Comment = require("./models/comment"),
    flash = require("connect-flash"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User = require("./models/user");
//     seedDB = require("./seed");
// seedDB();

mongoose.connect(process.env.DATABASEURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(require("express-session")({
    secret: "Secrets shall not be disclosed",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(flash());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs");

const port = 6265;

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/campgrounds", function (req, res) {
    allCampground.find({}, function (err, allCampgrounds) {
        if (err) console.log(err);
        else res.render("index", { allCampgrounds: allCampgrounds });
    });
});

app.post("/campgrounds", isLoggedIn, function (req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newob = { name: name, price: price, image: image, description: desc, author: author };
    allCampground.create(newob, function (err, allCampgrounds) {
        if (err) console.log(err);
        else res.redirect("/campgrounds");
    });
});

app.get("/campgrounds/new", isLoggedIn, function (req, res) {
    res.render("new");
});

app.get("/campgrounds/:id", isLoggedIn, function (req, res) {
    allCampground
        .findById(req.params.id)
        .populate("comments")
        .exec(function (err, showCamp) {
            if (err) console.log(err);
            else {
                res.render("show", { allCampgrounds: showCamp });
            }
        });
});

app.get("/campgrounds/:id/comments/new", function (req, res) {
    allCampground.findById(req.params.id, function (err, comment) {
        if (err) console.log(err);
        else res.render("../models/ncom", { allCampgrounds: comment });
    });
});

app.post("/campgrounds/:id/comments", isLoggedIn, (req, res) => {
    allCampground.findById(req.params.id, (err, camp) => {
        if (err) console.log(err);
        else
            Comment.create(req.body.comment, (err, comment) => {
                if (err) console.log(err);
                else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    camp.comments.push(comment);
                    camp.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + camp._id);
                }
            });
    });
});

app.get("/campgrounds/:id/comments/:comment_id/edit", isCommentAuthor, (req, res) => {
    Comment.findById(req.params.comment_id, (err, fcamp) => {
        if (err) res.redirect("back");
        else res.render("comments_edit", { campground_id: req.params.id, comment: fcamp });
    });
});

app.put("/campgrounds/:id/comments/:comment_id", isCommentAuthor, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, ucom) => {
        if (err) res.redirect("back");
        else {
            req.flash("success", "Comment edited successfully");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

app.delete("/campgrounds/:id/comments/:comment_id", isCommentAuthor, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if (err) res.redirect("back");
        else {
            req.flash("success", "Successfully removed the comment");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

app.get("/campgrounds/:id/edit", isAuthor, (req, res) => {
    allCampground.findById(req.params.id, (err, fcamp) => {
        req.flash("success", "Campground edited successfully");
        res.render("edit", { allCampground: fcamp });
    });
});

app.put("/campgrounds/:id", isAuthor, (req, res) => {
    allCampground.findByIdAndUpdate(req.params.id, req.body.camp, (err, ucamp) => {
        if (err) {
            req.flash("error", "You are not authorised to do that");
            res.redirect("/campgrounds");
        }
        else {
            req.flash("success", "Campground updated!!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

app.delete("/campgrounds/:id", isAuthor, (req, res) => {
    allCampground.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            req.flash("Sorry there was an error");
            res.redirect("/campgrounds");
        }
        else {
            req.flash("success", "Campground deleted");
            res.redirect("/campgrounds");
        }
    });
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Welcome " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }),
);

app.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/login");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please login first");
    res.redirect("/login");
}

function isAuthor(req, res, next) {
    if (req.isAuthenticated()) {
        allCampground.findById(req.params.id, (err, fcamp) => {
            if (err) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            }
            else {
                if (fcamp.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in");
        res.redirect("back");
    }
}

function isCommentAuthor(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, fcamp) => {
            if (err) res.redirect("back");
            else {
                if (fcamp.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in");
        res.redirect("back");
    }
}

app.listen(process.env.PORT);
