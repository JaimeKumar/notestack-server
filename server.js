require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://notestack-user:${process.env.MONGO_PW}@notestack-cluster.0dqnhow.mongodb.net/?retryWrites=true&w=majority`
const express = require('express')
const app = express();
const cors = require('cors')
app.use(cors())
app.use(express.json())

const newClient = async () => {
    const client = new MongoClient(uri)
    try {
        await client.connect()
        const db = client.db('notestack-db')
        const collection = db.collection('notestack-collection');
        return { client, collection };
    } catch (error) {
        console.log(error)
        return null;
    }
}

async function writeDB(newJSON) {
    try {
        const { client, collection } = await newClient()
        let id = newJSON._id;
        delete newJSON._id
        const updateOperation = {
            $set: newJSON
        };
        await collection.updateOne({_id: id}, updateOperation)
        client.close()
        return true
    } catch (err) {
        console.log('failed to write to db')
        return false
    }
}

async function readDB() {
    try {
        const { client, collection } = await newClient()
        const res = await collection.find({}).toArray()
        client.close()
        return res[0];
    } catch (err) {
        console.log('failed to read db')
        return null;
    }
}

app.post('/save', async (req, res) => {
    let success = await writeDB(req.body)
    res.json({success})
})

app.get('/load', async (req, res) => {
    let loaded = await readDB()
    res.json({stacks: loaded})
})

app.listen(process.env.PORT || 4000, () => {
    console.log("server up");
});