const mongoose = require("mongoose");
const User = require("../users/user")

const blogPostSchema = new mongoose.Schema({
    title: {type: String, required: true, unique: true},
    author_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    date: {type: Date, default: Date.now(), required: true},
    header_image: {type: String, required: true},
    desc: {type: String, required: true},
    content: {type: String, required: true},

    url_id: {type: String, unique: true},
    tags: [String],
    comments: [{author_id: mongoose.Schema.Types.ObjectId, date: Date, content: String}]
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
    const author = await User.findById(this.author_id).exec();

    const thisJson = this.toJSON();

    if (author) {
        thisJson.author_image = author.profilePictureUrl;
        thisJson.author_first_name = author.firstName;
        thisJson.author_last_name = author.lastName;
    }

    thisJson.comments = await Promise.all(thisJson.comments.map(async comment => {
        const commentAuthor = await User.findById(comment.author_id);
        if (commentAuthor) {
            comment.author_image = commentAuthor.profilePictureUrl;
            comment.author_first_name = commentAuthor.firstName;
            comment.author_last_name = commentAuthor.lastName;
        }
        return comment;
    }));

    return thisJson;
}

const blogPostModel = mongoose.model("blogPosts", blogPostSchema);

module.exports = blogPostModel;
