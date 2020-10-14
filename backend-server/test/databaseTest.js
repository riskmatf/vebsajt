process.env.NODE_ENV = "test";

const chai = require("chai");
const server = require("../main");
const BlogPost = require("../models/blog_post/blogPost");
const User = require("../models/users/user");

describe("Database tests", async function () {

    const testUser = await new User({
        email: "foo@example.com",
        firstName: "Test",
        lastName: "User"
    }).save();

    describe("BlogPosts", async function () {

        it("Should throw an error when the url-id is not unique", async function () {
            const blogPost1 = new BlogPost({
                title: "Non-unique title",
                author_id: testUser._id,
                header_image: "Header image",
                desc: "Description",
                content: "# Content"
            });

            const blogPost2 = new BlogPost({
                title: "Non-unique title",
                author_id: testUser._id,
                header_image: "Header image",
                desc: "Description",
                content: "# Content"
            });
            try {
                await blogPost1.save();
                await blogPost2.save();
            } catch (err) {
                chai.assert.equal(err.name, "MongoError");
                chai.assert.equal(err.code, 11000);
            }
        });
    });
});
