require("dotenv").config();
const express = require("express")
const app = express()
const port = 3000
const mainRouter = require('./src/routes');

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use('/api', mainRouter);

app.listen(port, () => {
    console.log(`Server Online: http://localhost:${port}`)
})