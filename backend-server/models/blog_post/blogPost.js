const mongoose = require("mongoose");
const User = require("../users/user")

const blogPostSchema = new mongoose.Schema({
    title: {type: String, required: true, unique: true},
    author_id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users'},
    date: {type: Date, default: Date.now(), required: true},
    header_image: {type: String, required: true},
    desc: {type: String, required: true},
    content: {type: String, required: true},

    url_id: {type: String, unique: true},
    tags: [String],
    comments: [{author_id: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}, date: Date, content: String}]
});

// Before validating, generate the url-id. Save automatically invokes validation, so this also ensures that this
// function is executed before saving the object to the database. In case the generated url-id is not unique,
// validation will fail, because the url-id is set before the actual validation.
blogPostSchema.pre('validate', function(next) {
    if (!this.url_id) {
        this.url_id = this.title.toLowerCase().replace(/\s/g, "-");
    }
    next();
});

blogPostSchema.methods.expanded = async function () {
    return await this.populate([
        'author_id',
        {
            path: "comments",
            populate: {
                path: 'author_id'
            }
        }
    ]).execPopulate();
}

const blogPostModel = mongoose.model("blogPosts", blogPostSchema);

module.exports = blogPostModel;
