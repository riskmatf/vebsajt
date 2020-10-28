process.env.NODE_ENV = "test";

const chai = require("chai");
const BlogPost = require("../models/blog_post/blogPost");
const User = require("../models/users/user");

describe("Database tests", async function () {

    const testUser = await new User({
        email: "foo@example.com",
        profilePictureUrl: 'Profile Picture',
        firstName: "Test",
        lastName: "User"
    }).save();

    describe("BlogPosts", async function () {

        it("Should throw an error when the urlId is not unique", async function () {
            const blogPost1 = new BlogPost({
                title: "Non-unique title",
                author: testUser._id,
                headerImageFullRes: "Full res header image",
                headerImageThumbnail: "Thumbnail header image",
                description: "Description",
                content: "# Content"
            });

            const blogPost2 = new BlogPost({
                title: "Non-unique title",
                author: testUser._id,
                headerImageFullRes: "Full res header image",
                headerImageThumbnail: "Thumbnail header image",
                description: "Description",
                content: "# Content"
            });
            try {
                await blogPost1.save();
                await blogPost2.save();
            } catch (err) {
                chai.assert.equal(err.name, "MongoError");
                chai.assert.equal(err.code, 11000);
            }

            // TODO test teardown
        });

        it("should populate the author field", async function () {
            const blogPost = new BlogPost({
                title: "Non-unique title",
                author: testUser._id,
                headerImageFullRes: "Full res header image",
                headerImageThumbnail: "Thumbnail header image",
                description: "Description",
                content: "# Content"
            });

            const populatedBlogPost = await blogPost.expanded();

            // Check that some of the User fields are present in the object.
            chai.assert.isDefined(populatedBlogPost.author.firstName);
            chai.assert.isDefined(populatedBlogPost.author.lastName);

        });

        it("should populate the comment author data", async function () {
            const blogPost = new BlogPost({
                title: "Non-unique title",
                author: testUser._id,
                headerImageFullRes: "Full res header image",
                headerImageThumbnail: "Thumbnail header image",
                description: "Description",
                content: "# Content",
                comments: [
                    {
                        author: testUser._id,
                    }
                ]
            });

            const expandedBlogPost = await blogPost.expanded();

            chai.assert.isDefined(expandedBlogPost.comments[0].author.firstName);
            chai.assert.isDefined(expandedBlogPost.comments[0].author.lastName);
        });
    });
});
