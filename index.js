const express = require('express');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;

const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config()

app.use(cors());
app.use(express.json());


//database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0pztf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {


      await client.connect();
      const database = client.db("shoppingDB");
      const orderCollection = database.collection("order");
      const productsCollection = database.collection("products");
      const usersCollection = database.collection("users");
      const reviewCollection = database.collection("review");
      


      //load all product
      app.get('/services', async (req, res) => {
        
        const cursor = productsCollection.find({});
        const product = await cursor.toArray();

        console.log('data load successfully');
        res.json(product);
      })

      //load limited product
      app.get('/services/limit', async (req, res) => {
        
        const cursor = productsCollection.find({}).limit(6);
        const product = await cursor.toArray();

        res.json(product);
      })

      //get single data by key
      app.get('/services/:id', async (req, res) => {
          const id = req.params.id;
          
          const query = { _id: ObjectId(id) };
          
          const result = await productsCollection.findOne(query);

          console.log('data base find', result);
          res.json(result);
      })

      // add product
      app.post('/addProduct', async (req, res) => {
          const data = req.body;
          const result = await productsCollection.insertOne(data);

          res.json(result);
      })

      //add review
      app.post('/addReview', async(req, res) => {
        const data = req.body;
        const result = await reviewCollection.insertOne(data);

        res.json(result);
      })

      //get all review
      app.get('/getAllReview', async (req, res) => {
        
        const cursor = reviewCollection.find({});
        const review = await cursor.toArray();

        res.json(review);
      })


      //update status
      app.post('/updateStatus', async (req, res) => {
        const id = req.body.id;
        const status = req.body.status;

        const filter = { _id: ObjectId(id) }
        const options = { upsert: true };
        const updateStatus =  {
            $set: {
              "status": status === 'pending' ? 'approved ' : 'pending'
            },
          };

        const result = await orderCollection.updateOne(filter, updateStatus, options);

        console.log('database hitted', result);
        res.json(result);
      })

      //set user data
      app.post('/users', async(req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
        
      })

      //save google login user
      app.put('/users', async(req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };

        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
      })

      //add admin
      app.put('/users/admin', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: {role: 'admin'} };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      })

      //check a user as admin or not
      app.get('/user/:email', async(req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const result = await usersCollection.findOne(query);
        let isAdmin = false;
        
        if(result?.role === "admin"){
          isAdmin = true;
        }

        res.json({ admin: isAdmin });

      })



      //get my order by gmail
      app.post('/services/myOrder', async (req, res) => {
          const email = req.body.email;

          const query = {"email": email};

          const result = await orderCollection.find(query).toArray();

          res.json(result);
      })

      //delete order item by _id
      app.get("/order/deleteOrder/:id", async (req, res) => {
          const id = req.params.id;
          console.log(id);
          const query = {_id: ObjectId(id)}

          const result = await orderCollection.deleteOne(query);

          console.log('delete successfully', result);
          res.json(result);
      })

      //get all order
      app.get('/allOrder', async (req, res) => {
          const result = orderCollection.find({});
          const allOrders = await result.toArray();
          console.log('server is ready');
          res.json(allOrders);
      })
      

      //insert order
      app.post('/services/order', async (req, res) => {
          const data = req.body;
          const result = await orderCollection.insertOne(data);
          res.json(result);
      })

    } finally {
    //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hello world');
})

app.listen(port, (req, res) => {
    console.log('listening to port: ', port);
})