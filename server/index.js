const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, } = require('mongodb');
const jwt = require('jsonwebtoken');


// Express App and Middleware Setup
const port = process.env.PORT || 5000;
const app = express();
const cookieParser = require('cookie-parser');

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://task-management-15020.web.app/",
    "https://task-management-15020.firebaseapp.com/",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Origin",
    "X-Requested-With",
    "Accept",
    "x-client-key",
    "x-client-token",
    "x-client-secret",
    "Authorization",
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


// MongoDB Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gvke0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// verifyToken
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded
    next()
  })
}

async function run() {
  try {
    const db = client.db('todo_storeHouse')
    const usersCollection = db.collection('users')
    const tasksCollection = db.collection('tasks')

    // Generate jwt token
    app.post('/jwt', async (req, res) => {
      const email = req.body
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d',
      })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    });

    // Logout/clear cookie from browser
    app.get('/logout', async (req, res) => {
      try {
        res
          .clearCookie('token', {
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          })
          .send({ success: true })
      } catch (err) {
        res.status(500).send(err)
      }
    });

    // save a user in DB
    app.post('/users/:email', async (req, res) => {
      const email = req.params.email
      const query = { email }
      const user = req.body

      const isExist = await usersCollection.findOne(query)
      if (isExist) {
        return res.send(isExist)
      }
      const result = await usersCollection.insertOne({
        ...user,
        timestamp: Date.now(),
      })
      res.send(result);
    });

    // Get all tasks for a user
    app.get('/tasks', async (req, res) => {
      try {
        const { userId } = req.query;
        const tasks = await tasksCollection
          .find({ userId })
          .sort({ timestamp: -1 })
          .toArray();

        res.send(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    });

    // save a new task
    app.post('/tasks', async (req, res) => {
      try {
        const formData = req.body;
        const result = await tasksCollection.insertOne(formData);
        res.send(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // Update task details
    app.put("/tasks/:id", async (req, res) => {
      const { id } = req.params;
      const { title, description, category } = req.body;
      try {
        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { title, description, category } }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Task not found" });
        }
        res.send({ message: "Task updated successfully" });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });


    // Delete a task
    app.delete("/tasks/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Task not found" });
        }
        res.send({ message: "Task deleted successfully" });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });


  
    app.put('/tasks/reorder', async (req, res) => {
      try {
        const { tasks } = req.body;

        // Use a session for atomic updates
        const session = client.startSession();

        try {
          await session.withTransaction(async () => {
            for (const task of tasks) {
              await db.collection('tasks').updateOne(
                { _id: new ObjectId(task.id), userId: req.user.uid },
                { $set: { category: task.category, position: task.position } },
                { session }
              );
            }
          });

          await session.endSession();
          res.json({ message: 'Tasks reordered successfully' });
        } catch (error) {
          await session.abortTransaction();
          throw error;
        }
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });




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




// Server Start Routes
app.get('/', (req, res) => {
  res.send("Task Management API is running...");
});

app.listen(port, () => {
  console.log(`Task Management App Server running on port ${port}`);
});