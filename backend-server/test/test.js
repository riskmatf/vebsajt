process.env.NODE_ENV = "test";

const fs = require("fs");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../main");
// noinspection JSUnusedLocalSymbols
const should = chai.should();
chai.use(chaiHttp);
const crypto = require("crypto");
const User = require("../models/users/user");
const BlogPost = require("../models/blog_post/blogPost");

describe("BlogPosts", async function () {

    const sampleDataUrlImage =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4" +
        "//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

    // User to test methods which require authentication
    const user = await new User({
        email: "test@test.com",
        firstName: "Test",
        lastName: "Tester",
        profilePictureURL: "Invalid URL"
    }).save();
    const token = user.generateJwt();

    // To overcome the unique constraint
    const generateBlogPost = function () {

        const randomString = crypto.randomBytes(5).toString("hex");
        const exampleBlogPost = {
            title: `Mocha test ${randomString}`,
            headerImage: sampleDataUrlImage,
            description: "blog post description",
            content: "Content",
            tags: [
                "Tag1",
                "Tag2"
            ],
        }

        return exampleBlogPost;
    }

    const generateFullBlogPost = function() {
        const randomString = crypto.randomBytes(5).toString("hex");
        const title = `Mocha test ${randomString}`;
        const urlId = title.toLowerCase().replace(/\s/g, "-");
        const fullBlogPost = {
            title,
            author: user._id,
            date: Date.now(),
            headerImageFullRes: sampleDataUrlImage,
            headerImageThumbnail: sampleDataUrlImage,
            description: "blog post description",
            content: "Content",
            urlId,
            tags: [
                "Tag1",
                "Tag2"
            ],
            comments: [],
        };
        return fullBlogPost;
    }

    describe("GET /api/blogPosts", function () {
        it("should return status 200", function (done) {
            chai.request(server)
                .get("/api/blogPosts/")
                .send({})
                .end((err, res) => {
                    // noinspection JSUnresolvedFunction
                    res.should.have.status(200);
                    done();
                })
        });

        it('should paginate when supplied the parameters', async function () {

            const limit = 2;
            const start = 1;

            await new BlogPost(generateFullBlogPost()).save();
            await new BlogPost(generateFullBlogPost()).save();
            await new BlogPost(generateFullBlogPost()).save();

            const paginatedDbResult = await BlogPost.find().skip(start).limit(2).lean().exec();
            const paginatedDbIds = paginatedDbResult.map(doc => doc._id.toString());

            const response = await chai.request(server)
                .get('/api/blogPosts/')
                .query({limit, start})
                .send();
            chai.assert.equal(response.statusCode, 200);
            chai.assert.isTrue(Array.isArray(response.body));
            const paginatedIds = response.body.map(post => post._id);
            chai.assert.deepEqual(paginatedIds, paginatedDbIds);
        });
    });

    describe("POST /api/blogPosts", function () {
        it("should return status 201", (done) => {
            chai.request(server)
                .post("/api/blogPosts")
                .set("Authorization", `Bearer ${token}`)
                .send(generateBlogPost())
                .end((err, res) => {
                    if (res.status !== 201) {
                        console.log("Error response from server:", res.body.message);
                    }
                    // noinspection JSUnresolvedFunction
                    res.should.have.status(201);
                    res.body.should.not.be.empty;
                    done();
                })
        });

        it('should fail when missing a required field', function (done) {
            // Title is missing from the payload
            chai.request(server)
                .post("/api/blogPosts")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    "date": "2020-07-21T11:17:54.743Z",
                    "tags": [
                        "Tag1",
                        "Tag2"
                    ],
                    "headerImage": sampleDataUrlImage,
                    "url_id": "URL",
                    "content": "Content"
                })
                .end((err, res) => {
                    // noinspection JSUnresolvedFunction
                    res.should.have.status(400);
                    res.body.should.have.property("message");
                    done();
                })
        });
    });

    describe("GET /api/blogPosts/:id", function () {
        it("should retrieve created blog post", async function () {
            const blogPost = new BlogPost(generateFullBlogPost());
            await blogPost.save();

            chai.request(server)
                .get(`/api/blogPosts/${blogPost._id}`)
                .send()
                .end((err, res) => {
                    // noinspection JSUnresolvedFunction
                    res.should.have.status(200);
                    res.should.have.property("body");
                    res.body.should.have.property("_id");
                    res.body._id.toString().should.be.equal(blogPost._id.toString());
                });

        });

        it("should be able to get the blog post by url-id", async function () {
            const blogPost = new BlogPost(generateFullBlogPost());
            await blogPost.save();

            chai.request(server)
                .get(`/api/blogPosts/${blogPost.urlId}`)
                .send()
                .end((err, res) => {
                    // noinspection JSUnresolvedFunction
                    res.should.have.status(200);
                    res.body.urlId.should.be.equal(blogPost.urlId);
                })
        });

        xit("should expand the blog post with synthetic fields", async function () {
            const blogPost = new BlogPost(generateFullBlogPost());
            await blogPost.save();

            chai.request(server)
                .get(`/api/blogPosts/${blogPost._id}`)
        });
    });

    // TODO decide whether PATCH is more appropriate for this API, and whether PUT should be removed
    xdescribe("PUT /api/blogPosts", function () {
        it('should edit existing blog post', async function () {
            const response = await chai.request(server)
                .post("/api/blogPosts")
                .set("Authorization", `Bearer ${token}`)
                .send(generateBlogPost());

            // noinspection JSUnresolvedFunction
            response.should.have.status(201);
            response.should.have.property("body");

            const responseBody = response.body;
            responseBody.title = "Updated title";

            const putResponse = await chai.request(server)
                .put(`/api/blogPosts/${responseBody._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send(responseBody)

            // noinspection JSUnresolvedFunction
            putResponse.should.have.status(200);
            putResponse.should.have.property("body");
            putResponse.body.title.should.be.equal("Updated title");

        });

        it('should fail when required fields are missing', async function () {
            const postReponse = await chai.request(server)
                .post("/api/blogPosts")
                .set("Authorization", `Bearer ${token}`)
                .send(generateBlogPost());

            // noinspection JSUnresolvedFunction
            postReponse.should.have.status(201);

            const id = postReponse.body._id;

            const blogPost = postReponse.body;

            // Delete a required field
            delete blogPost.title;

            const putResponse = await chai.request(server)
                .put(`/api/blogPosts/${id}`)
                .set("Authorization", `Bearer ${token}`)
                .send(blogPost);

            // noinspection JSUnresolvedFunction
            putResponse.should.have.status(400);
            putResponse.body.should.have.property("message");
        });

        it("should fail when a field value isn't valid", async function () {
            const postReponse = await chai.request(server)
                .post("/api/blogPosts")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    "date": "2020-07-21T11:17:54.743Z",
                    "tags": [
                        "Tag1",
                        "Tag2"
                    ],
                    "author_id": "5f291a30e7a3e4461aa45bc3",
                    "title": "Postman test2",
                    "headerImage": sampleDataUrlImage,
                    "url_id": "URL",
                    "content": "Content"
                });

            const blogPost = postReponse.body;

            blogPost.date = "asdasdasd";

            const putResponse = await chai.request(server)
                .put(`/api/blogPosts/${blogPost._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send(blogPost);

            // noinspection JSUnresolvedFunction
            putResponse.should.have.status(400);
            putResponse.body.should.have.property("message");
        });
    });

    describe("DELETE /api/blogPosts", function () {
        it('should delete existing blog post', async function () {

            const postResponse = await chai.request(server)
                .post("/api/blogPosts")
                .set("Authorization", `Bearer ${token}`)
                .send(generateBlogPost());

            // noinspection JSUnresolvedFunction
            postResponse.should.have.status(201);
            postResponse.should.have.property("body");
            postResponse.body.should.have.property("_id");
            const id = postResponse.body._id;

            await chai.request(server)
                .delete(`/api/blogPosts/${id}`)
                .set("Authorization", `Bearer ${token}`)
                .send()

            chai.request(server)
                .get(`/api/blogPosts/${id}`)
                .send()
                .end((err, res) => {
                    // noinspection JSUnresolvedFunction
                    res.should.have.status(404);
                })

        });
    });
});

describe("Users", function () {

    describe("GET /api/users/:id", async function () {
        it("should retrieve an user with the specified id", async function() {

            const user = await new User({
                email: "test@test.org",
                firstName: "Test",
                lastName: "Test"
            }).save();

            const response = await chai.request(server)
                .get(`/api/users/${user._id}`)

            // noinspection JSUnresolvedFunction
            response.should.have.status(200);
            response.should.have.property("body");
        })
    })

    describe("Register with a profile picture", function () {
        it("Should store a picture", async function () {
            const registerResponse = await chai.request(server)
                .post("/api/users/register")
                .field("email", "test@foo.com")
                .field("firstName", "TestFirstName")
                .field("lastName", "TestLastName")
                .field("password", "asdasdasd")
                .attach("profilePicture", fs.readFileSync("test/testImage.png"), "profilePicture.png")

            // noinspection JSUnresolvedFunction
            registerResponse.should.have.status(200);

            const token = registerResponse.body.token;

            const encryptedPayload = token.split(".")[1];
            const payload = JSON.parse(Buffer.from(encryptedPayload, 'base64').toString())
            const id = payload.id;

            const createdUser = await User.findById(id).exec();

            createdUser.should.not.be.undefined;
            createdUser.should.have.property("profilePictureUrl");

        })
    })
})
