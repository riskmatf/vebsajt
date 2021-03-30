const app = require('./index')

let server;
if (process.env.NODE_ENV === "test") {
    // Random free port is automatically assigned
    server = app.listen();
} else {
    server = app.listen(80);
}

module.exports = server;
