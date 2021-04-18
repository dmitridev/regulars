const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const objectId = require("mongodb").ObjectId;

const express = require('express');
const app = express();
const port = 8080;

const mongoOptions = {
    useUnifiedTopology: true
};

app.use(bodyParser.json());
app.get("/api/notes/list", (req, res) => {
    let folder = req.query.folder;
    const client = new MongoClient("mongodb://localhost:27017", mongoOptions);
    client.connect(async (err) => {
        const db = client.db('regulars');
        let collection = null;
        if(folder){
            collection = await db.collection('notes').find({folderId: folder}).toArray();
        }else{
            collection = await db.collection('notes').find({}).toArray();
        }
        res.send(collection);
    })
});

app.put('/api/notes/:id', (req, res) => {
    const body = req.body
    const id = req.params.id;
    const client = new MongoClient("mongodb://localhost:27017", mongoOptions);
    client.connect(async (err) => {
        const db = client.db('regulars');
        delete body._id
        await db.collection('notes').updateOne(
            { _id: new objectId(id) },
            { $set: body }
        )
        res.sendStatus(200);
    })
})

app.get("/api/notes/:id", (req, res) => {
    const id = req.params.id;

    const client = new MongoClient("mongodb://localhost:27017", mongoOptions);
    client.connect(async (err) => {
        const db = client.db('regulars');
        const object = await db.collection('notes').findOne({ _id: new objectId(id) })
        res.send(object);
    })
})

app.post("/api/notes/", (req, res) => {
    const client = new MongoClient("mongodb://localhost:27017", mongoOptions);
    client.connect(async (err) => {
        const db = client.db('regulars');
        const collection = db.collection('notes');
        const result = await collection.insertOne(req.body);
        res.send(result);
    })
})

app.delete('/api/notes/:id', (req, res) => {
    const id = req.params.id;
    const client = new MongoClient("mongodb://localhost:27017", mongoOptions);
    client.connect((err) => {
        const db = client.db('regulars');
        const collection = db.collection('notes');
        collection.deleteOne({ _id: new objectId(id) })
        res.sendStatus(200);
    });
})

app.get('/api/notes/count', (req, res) => {
    const client = new MongoClient("mongodb://localhost:27017", mongoOptions);
    client.connect(async (err) => {
        const db = client.db('regulars');
        const collection = db.collection('notes');
        const result = await collection.count();
        res.send(result);
    });
})

app.get('/api/folders/', (req, res) => {
    const client = new MongoClient("mongodb://localhost:27017", mongoOptions);
    client.connect(async (err) => {
        const db = client.db('regulars');
        const result = await db.collection('folders').find({}).toArray();
        res.send(result.map(item => ({ id: item._id, folder: item.name })));
    })
})
app.post('/api/folders/:name', (req, res) => {
    const name = req.params.name;
    const client = new MongoClient("mongodb://localhost:27017", mongoOptions);
    client.connect(async (err) => {
        const db = client.db('regulars');
        const result = await db.collection('folders').insertOne({ name: name })
        res.send(result);
    })
});

app.delete('/api/folders/:name', (req, res) => {
    const name = req.params.name;
    const client = new MongoClient("mongodb://localhost:27017", mongoOptions);
    client.connect(async (err) => {
        const db = client.db('regulars');
        const result = await db.collection('folders').deleteOne({ name: name });
        res.sendStatus(200);
    });
})

app.listen(port, () => {
    console.log(`server started on port ${port}`);
});
