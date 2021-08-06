/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////
'use strict';   

const express = require('express');
const { database }= require('../config');

const MongoClient = require('mongodb').MongoClient;
const router = express.Router();

var mongoClient = new MongoClient(database.url, { useNewUrlParser: true, useUnifiedTopology: true });

/////////////////////////////////////////////////////////////////////
// get the price book info from database
/////////////////////////////////////////////////////////////////////
router.get('/pricebook/items', async (req, res, next) => {
    mongoClient.connect((err) => {
        if (err) {
            console.error(err);
            return (res.status(500).json({
                diagnostic: "failed to connect server"
            }));
        }
        const collection = mongoClient.db("PriceBook").collection("DinningRoom");
        // perform actions on the collection object
        collection.find({}).toArray(function (err, docs) {
            if (err) {
                console.error(err);
                mongoClient.close();
                return (res.status(500).json({
                    diagnostic: "failed to find the items in collection"
                }));
            }
            res.status(200).json(docs.filter(item => { return (item != null) }));
            return;
            // TBD   mongoClient.close();
        });
    });
});

module.exports = router;
