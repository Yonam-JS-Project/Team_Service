require("dotenv").config();
const path = require('path');
const express = require("express")
const app = express()
const cors = require('cors');
const port = 3000
const mainRouter = require('./src/routes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');

app.use(cors());

const serverUrl = process.env.SERVER_HOST || 'http://localhost:3000';

console.log(process.env.SERVER_HOST);
swaggerDocument.servers = [
  { url: `${serverUrl}/api`, description: 'Local API Server' }
];

app.use('/img', express.static('uploads/img'));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use('/api', mainRouter);

app.listen(port, () => {
    console.log(`Server Online: http://${serverUrl}:${port}`)
})