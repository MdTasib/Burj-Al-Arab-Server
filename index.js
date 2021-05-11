const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// mongodb database
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://burjAlArab:mohammadohidulalamtasib@cluster0.do24a.mongodb.net/burjAlArab?retryWrites=true&w=majority";

const app = express();
app.use(cors());
app.use(bodyParser.json());


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("burjAlArab").collection("bookings");

    // post
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        collection.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
});

app.get('/', (req, res) => {
    res.send('Hello World');
})

const port = 5000;
app.listen(port);