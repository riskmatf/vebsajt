const mongoose = require("mongoose");
const BlogPost = require("./blogPost");
const resizer = require("../../util/imageResizer")

module.exports.getBlogPosts = async (req, res, next) => {
    try {
        let blogPosts = await BlogPost.find().exec();
        // noinspection JSUnresolvedFunction
        blogPosts = await Promise.all(blogPosts.map((post) => post.expanded()));
        res.status(200).json(blogPosts);
    } catch (err) {
        next(err);
    }
}

module.exports.getBlogPostById = async (req, res, next) => {
    try {
        let blogPost;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            // It is a valid ObjectId, try to search by id
            blogPost = await BlogPost.findById(req.params.id).exec();
        }
        if (!blogPost) {
            // Try searching by urlId instead
            blogPost = await BlogPost.findOne({urlId: req.params.id}).exec();
        }
        if (blogPost) {
            blogPost = await blogPost.expanded();
            res.status(200).json(blogPost);
        } else {
            res.status(404).send();
        }
    } catch (err) {
        next(err);
    }

}

module.exports.createBlogPost = async (req, res, next) => {
    try {
        // noinspection JSUnresolvedVariable
        if (!req.authData) {
            res.status(401).json({
                message: "You need to be authorized to POST a blog post"
            });
            return;
        }

        let blogPost;
        try {
            blogPost = await BlogPost.fromRequestBody(req.body, req.authData.id);
            try {
                await blogPost.save();
                const expandedBlogPost = await blogPost.expanded();
                res.status(201).json(expandedBlogPost);
            } catch (err) {
                if (err.name === "MongoError" && err.code === 11000) {
                    res.status(400).json({
                        message: "Blog post with a similar title already exists"
                    });
                } else if (err.name === "ValidationError") {
                    res.status(400).json({
                        message: `Fields [${Object.keys(err.errors)}] are not correct`
                    });
                } else {
                    next(err);
                }
            }
        } catch (err) {
            res.status(400).json({
                message: err.message
            });
        }
    } catch (err) {
        next(err);
    }
}

// FIXME should PUT be replaced with PATCH?
module.exports.updateBlogPost = async (req, res, next) => {
    try {
        // noinspection JSUnresolvedVariable
        if (!req.authData.id) {
            res.status(401).json({
                message: "You need to be authorized to PUT a blog post"
            });
        } else if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({
                message: `Invalid id in path: '${req.params.id}'`
            });
            //If the body contains an id, it must match the id contained in the path parameter.
        } else if (req.body._id != null && req.params.id !== req.body._id) {
            res.status(400).json({
                message: `Path id (${req.params.id}) doesn't match object id (${req.body._id})`
            });
        } else {
            const blogPostFromPayload = new BlogPost(req.body);
            // TODO refactor this method
            const error = false;
            if (error) {
                res.status(400).json({
                    message: `Fields [${Object.keys(error.errors)}] are not correct`
                });
            } else {
                /* `blogPostFromPayload` cannot be simply saved to override the existing one, because it would still be
                    saved, even when such document didn't exist before. Instead, assumed existing blog post is being
                    updated by the id, and it is checked whether the document existed beforehand.
                */
                let blogPost = await BlogPost.findByIdAndUpdate(req.params.id, blogPostFromPayload, {
                    useFindAndModify: false,
                    new: true
                }).exec();
                if (blogPost) {
                    blogPost = await blogPost.expanded();
                    res.status(200).json(blogPost);
                } else {
                    res.status(404).send();
                }
            }
        }
    } catch (err) {
        next(err);
    }
}

module.exports.deleteBlogPost = async (req, res, next) => {
    try {
        // noinspection JSUnresolvedVariable
        if (!req.authData.id) {
            res.status(401).json({
                message: "You need to be authorized to DELETE a blog post"
            });
        } else if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).send();
        } else {
            let blogPost = await BlogPost.findByIdAndRemove(req.params.id).exec();
            if (blogPost) {
                blogPost = await blogPost.expanded();
                res.status(200).json(blogPost);
            } else {
                res.status(404).send();
            }
        }
    } catch (err) {
        next(err);
    }
}
