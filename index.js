require("dotenv").config();
const express = require("express")
const app = express()
const port = 3000
const router = express.Router();
const tripRoutes = require('./src/routes/tripRoutes');

app.use(express.json());

app.use('/api', router);
router.use('/trips', tripRoutes);

app.listen(port, () => {
    console.log(`Server Online: http://localhost:${port}`)
})