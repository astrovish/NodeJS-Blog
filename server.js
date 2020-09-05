const express = require("express");
const dotenv = require("dotenv");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Blog = require("./models/blog");

// creating an express application
const app = express();

// path to config file
dotenv.config({path: "./config/config.env"});

// connecting with database
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true,
    useFindAndModify: false
})
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
app.use(methodOverride("_method"));

// home page
app.get("/", (req, res) => {
    res.render("index", {
        pageTitle: "Home Page"
    })
});

// show create blog page
app.get("/blogs/create", (req, res) => {
    res.render("create", {
        pageTitle: "Create New Blog",
        actionParams: "",
        blog: {title: "", body: ""}
    })
})

// submit newly created blog
app.post("/blogs", (req, res, next) => {
    // req.blog = new Blog()
    // next()

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
// }, saveBlogAndRedirect());
});

// show all blogs
app.get("/blogs", (req, res) => {
    Blog.find().sort({_id: 1})
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

// show particular blog
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

// edit a blog
app.get("/blogs/edit/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        res.render("edit", {
            pageTitle: `'${blog.title}': is ready for update.`,
            blog
        });
    } catch(e) {
        res.status(404).redirect("/404", {errMsg: e.message});
    }
})

// update the blog
app.put("/blogs/:id", async (req, res, next) => {
/*  
    try {
        req.blog = await Blog.findById(req.params.id);
        next();
    } catch(e) {
        res.redirect("/404", {errMsg: e.message});
    }
}, saveBlogAndRedirect())
*/
    try {
        let blog = {
            title: req.body['blog-title'],
            body: req.body['blog-body'],
            userId: 23
        }
        await Blog.findByIdAndUpdate(req.params.id, blog, {new: true})
        res.redirect("/blogs");
    } catch (e) {
        res.send(e)
    }
});

// delete a blog
app.delete("/blogs/:id", async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect("/blogs");
    /*.then(result => {
        res.redirect("/blogs");
    })
    .catch(err => {
        console.log(`Err: ${err}`)
    })*/
});

// display 404 page: if no route is matched
app.use((req, res) => {
    res.status(404).render("404", {
        pageTitle: "OOPS!!! Page Not Found.",
        errMsg: ''
    })
})

function saveBlogAndRedirect() {
    return async (req, res) => {
        let blog = req.blog;

        blog.title = req.body.title;
        blog.body = req.body.body;
        blog.userId = 23;

        try {
            blog = await blog.save();
            res.redirect('/blogs');
        } catch(e) {
            res.send(e.message)
            // res.redirect('/404')
        }
    }
}