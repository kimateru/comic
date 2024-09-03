const express = require('express');
const db = require('./utils/config');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Hello from the API!' });
})
app.get('/products', async (req, res) => {
    try {
        const [results] = await db.promise().query('SELECT * FROM products')
        res.status(200).json(results);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });

    }

})


app.listen(port, () => {
    console.log("Server runing");
})