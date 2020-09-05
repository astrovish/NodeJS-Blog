const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Blog = require("./models/blog");

// creating an express application
const app = express();

// path to config file
dotenv.config({path: "./config/config.env"});

// connecting with database
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
.then(result => {
    console.log("Application successfully connected with database.");

    // application listening on assigned port
    const PORT = process.env.PORT || 3400;
    app.listen(PORT, () => {
        console.log(`Server is up and running on port: ${PORT}`);
    });
})
.catch(err => {
    console.log(`Following err occured while connecting with database: ${err}`)
});

// setting up the view engine
app.set("view engine", "ejs");

// folder to consider for views
app.set("views", process.env.VIEW_FOLDER);

// use /public directory for static files
app.use(express.static(__dirname + "/public"));

// parse request of content-Type - application/x-www-form-urlencoded
app.use(express.urlencoded({extended: false}));

// setting routes
app.get("/", (req, res) => {
    res.render("index", {
        pageTitle: "Home Page"
    })
});

// page to create new blog
app.get("/blogs/create", (req, res) => {
    res.render("create", {
        pageTitle: "Create New Blog"
    })
})

// submitting new blog here
app.post("/blogs", (req, res) => {
    const blog = new Blog({
        title: req.body['blog-title'],
        body: req.body['blog-body'],
        userId: 34,
    })

    blog.save()
    .then(result => {
        res.redirect("/blogs");
    })
    .catch(err => {
        res.status(500).send({message: `Following error occured while creating new blog: ${err}`});
    });
});

// blog routes
app.get("/blogs", (req, res) => {
    Blog.find()
    .then(result => {
        res.render("blogs", {
            pageTitle: "All Blogs",
            blogs: result
        });
    })
    .catch(err => {
        console.log(err);
    });
});

app.get("/blogs/:slug", (req, res) => {
    Blog.findOne({
        slug: req.params.slug
    })
    .then(result => {
        res.render("blog", {
            pageTitle: result.title,
            blog: result
        });
    })
    .catch(err => {
        console.log(err);
    });
});

app.delete("/blogs/:id", (req, res) => {
    Blog.findByIdAndDelete(req.params.id);
    res.redirect("/blogs");
});