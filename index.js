const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 4000;
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const e = require('cors');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dgvjh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const database = client.db("nirvoyPayDB");
        const userCollection = database.collection("users");

        // jwt related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        })

        // middle were
        const verifyToken = (req,res,next)=>{
            if(!req.headers.authorization){
                return res.status(401).send({message: 'forbidden access'})
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode)=>{
                if(err){
                    return res.status(401).send({message: 'forbidden access'})
                }
                req.decode = decode;
                next()
            })
           
        }

      // users api

      app.get('/users', async (req, res) => {
        const result = await userCollection.find().toArray();
        res.send(result);
    })
    
    app.get('/user/:email', async (req, res) => {
        const email = req.params.email; 
        const query = { email: email };
        const result = await userCollection.findOne(query);
        res.send(result);
    })
    
    app.post('/users', async (req, res) => {
        const user = req.body;
        const query = { email: user.email }
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
            return res.send({ message: 'user already exists', insertedId: null })
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
    })

    
        //  verify related api

        app.get('/admin/verify/:email', async(req,res)=>{
            const email = req.params.email; 
            const query = {email: email}
            const result = await userCollection.findOne(query)
            let admin = false;
            if(result?.role === "admin") {
                admin = true;
            }
            res.send(admin)
        })

        app.get('/agent/verify/:email', async(req,res)=>{
            const email = req.params.email; 
            const query = {email: email}
            const result = await userCollection.findOne(query)
            let hr = false;
            if(result?.role === "hr") {
                hr = true;
            }
            res.send(hr)
        })
        
        app.get('/user/verify/:email', async(req,res)=>{
            const email = req.params.email; 
            const query = {email: email}
            const result = await userCollection.findOne(query)
            let user = false;
            if(result?.role === "user") {
                user = true;
            }
            res.send(user)
        })

        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("NirvoyPay is running")
})
app.listen(port, () => {
    console.log("NirvoyPay waiting at ", port)
})