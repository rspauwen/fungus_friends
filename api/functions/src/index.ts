import * as bodyParser from "body-parser";
import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as firebaseHelper from 'firebase-functions-helper';

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const app = express();
const server = express();

const cors = require('cors')({ origin: true });
const firestoreHelper = firebaseHelper.firestore;
const fungiCollection = 'fungi';

server.use(cors);

server.use('/api/v1', app);
// tslint:disable-next-line: deprecation
server.use(bodyParser.json());
// tslint:disable-next-line: deprecation
server.use(bodyParser.urlencoded({ extended: false }));


export const webApi = functions.https.onRequest(server);

// Add a new fungus
app.post('/fungi', async (req, res) => {
    try {
        const body = req.body['fungusBody'];

        const fungusData = {
            color: body['color'],
            latlng: new admin.firestore.GeoPoint(body['lat'], body['lng']),
            name: body['name'],
            spots: body['spots'],
            custom: true
        }

        const newFungusDoc = await firestoreHelper
            .createNewDocument(db, fungiCollection, fungusData);

        res.status(201).send(`Created a new fungus: ${newFungusDoc.id}`);
    } catch (error) {
        console.log(error, req.body);
        res.status(400).send(`Fungus needs a name, color, spots & latlng!`)
    }
});

// Get a specific fungus
app.get('/fungi/:fungusId', (req, res) => {
    firestoreHelper
        .getDocument(db, fungiCollection, req.params.fungusId)
        .then(doc => res.status(200).send(doc))
        .catch(error => res.status(400).send(`Cannot get fungus: ${error}`));
});

// Delete a specific fungus
app.delete('/fungi/:fungusId', async (req, res) => {
    admin.firestore().collection(fungiCollection).doc(req.params.fungusId).delete().then((f) => {
        res.status(204).send(`Fungus is deleted: ${f}`);
    }).catch(error => res.status(400).send(`Cannot delete fungus: ${error}`));
});

// Get all fungi
app.get('/fungi', (req, res) => {
    firestoreHelper
        .backup(db, fungiCollection)
        .then(data => res.status(200).send(data))
        .catch(error => res.status(400).send(`Cannot get fungi: ${error}`));
});