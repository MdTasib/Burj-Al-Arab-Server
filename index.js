const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// firebase admin
const admin = require('firebase-admin');
// environment variables require
require('dotenv').config();

// mongodb database
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.do24a.mongodb.net/burjAlArab?retryWrites=true&w=majority`;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Firebase Admin SDK
const serviceAccount = require("./confiqs/burj-al-arab-9bc3e-firebase-adminsdk-trkao-53f1bf1bad.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

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
    });

    // get
    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;

        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            // idToken comes from the client app
            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail == queryEmail) {
                        collection.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.status(200).send(documents);
                            })
                    } else {
                        res.status(401).send('Unauthorized Access');
                    }
                })
                .catch((error) => {
                    res.status(401).send('Unauthorized Access');
                });
        } else {
            res.status(401).send('Unauthorized Access');
        }
    })
});

app.get('/', (req, res) => {
    res.send('Hello World');
})

const port = 5000;
app.listen(process.env.PORT || port);