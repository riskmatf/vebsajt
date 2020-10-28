const mongoose = require("mongoose");
const User = require("../users/user")
const {cropResize} = require("../../util/imageResizer")

const blogPostSchema = new mongoose.Schema({
    title: {type: String, required: true, unique: true},
    author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users'},
    date: {type: Date, default: Date.now(), required: true},
    headerImageFullRes: {type: String, required: true},
    headerImageThumbnail: {type: String, required: true},
    description: {type: String, required: true},
    content: {type: String, required: true},

    urlId: {type: String, unique: true},
    tags: [String],
    comments: [{author: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}, date: Date, content: String}]
});

// Before validating, generate the url-id. Save automatically invokes validation, so this also ensures that this
// function is executed before saving the object to the database. In case the generated url-id is not unique,
// validation will fail, because the url-id is set before the actual validation.
blogPostSchema.pre('validate', function(next) {
    if (!this.urlId) {
        this.urlId = this.title.toLowerCase().replace(/\s/g, "-");
    }
    next();
});

blogPostSchema.methods.expanded = async function () {
    return await this.populate(['author', 'comments.author']).execPopulate();
}

blogPostSchema.statics.fromRequestBody = async function(body, author) {

    const requiredFields = ["title", "headerImage", "description", "content", "tags"];
    requiredFields.forEach((field) => {
        if (!body[field]) {
            throw new Error(`Missing required field '${field}'`);
        }
    });

    const headerImageFullRes = cropResize(body.headerImage, 1920, 22, 9);
    const headerImageThumbnail = cropResize(body.headerImage, 500, 22, 9);

    body.title = body.title.trim();

    const urlId = body.title.toLowerCase().replace(/\s/g, "-");


    const existing = await this.findOne({urlId}).exec();
    if (existing) {
        // Url id must be unique
        throw new Error("Post with a similar title already exists");
    }

    if (!Array.isArray(body.tags)) {
        // For unknown reasons, front-end sometimes sends array as a comma-delimited string
        body.tags = body.tags.split(",");
    }

    return new this({
        title: body.title,
        author: author,
        date: Date.now(),
        headerImageFullRes,
        headerImageThumbnail,
        description: body.description,
        content: body.content,
        urlId,
        tags: body.tags
    })

}

const blogPostModel = mongoose.model("blogPosts", blogPostSchema);

module.exports = blogPostModel;
