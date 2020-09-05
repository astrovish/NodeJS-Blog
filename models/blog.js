const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const blogSchema = new mongoose.Schema({
    title: {
        desc: "Blog title",
        type: String,
        trim: true,
        required: true,
    },
    body: {
        desc: "Blog description",
        trim: true,
        type: String,
        required: true,
    },
    userId: {
        desc: "User Id who created the blog",
        type: Number,
        required: true
    },
    slug: {
        desc: "SEO friendly url",
        trim: true,
        type: String,
        required: true,
        unique: true
    }
});

blogSchema.pre("validate", function(next) {
    if( this.title ) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true
        });
    }

    next();
})

module.exports = mongoose.model("Blog", blogSchema);