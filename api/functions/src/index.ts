import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
import * as firebaseHelper from 'firebase-functions-helper';
import * as express from 'express';
import * as bodyParser from "body-parser";

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const app = express();
const server = express();

const cors = require('cors')({ origin: true });

const fungiCollection = 'fungi';

server.use(cors);

server.use('/api/v1', app);
// tslint:disable-next-line: deprecation
server.use(bodyParser.json());
// tslint:disable-next-line: deprecation
server.use(bodyParser.urlencoded({ extended: false }));


export const webApi = functions.https.onRequest(server);

// Get a specific fungus
app.get('/fungi/:fungusId', (req, res) => {
    firebaseHelper.firestore
        .getDocument(db, fungiCollection, req.params.fungusId)
        .then(doc => res.status(200).send(doc))
        .catch(error => res.status(400).send(`Cannot get fungus: ${error}`));
})

// Get all fungi
app.get('/fungi', (req, res) => {
    firebaseHelper.firestore
        .backup(db, fungiCollection)
        .then(data => res.status(200).send(data))
        .catch(error => res.status(400).send(`Cannot get fungi: ${error}`));
})

// // Delete a fungus 
// app.delete('/fungi/:funugsId', async (req, res) => {
//     const deletedFungus = await firebaseHelper.firestore
//         .deleteDocument(db, contactsCollection, req.params.fungusId);
//     res.status(204).send(`Fungus is deleted: ${deletedFungus}`);
// })