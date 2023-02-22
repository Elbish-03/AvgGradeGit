const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const mongoose = require("mongoose");
const { loadavg } = require("os");
const MongoClient = require("mongodb").MongoClient;

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
const url =
  "mongodb+srv://admin-elvis:kali@cluster0.sbjotar.mongodb.net/GradesDB";
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const GradeSchema = new mongoose.Schema({
  name: String,
  Note: Number,
});

const Grade = mongoose.model("Grade", GradeSchema);

const dbName = "GradesDB";

app.post("/", async (req, res) => {
  const { subject, grade } = req.body;
  const client = await MongoClient.connect(url);
  const db = client.db(dbName);
  const collection = db.collection("grades");

  // Save data in the database
  const result = await new Promise((resolve, reject) => {
    collection.insertOne({ subject, grade }, function (err, result) {
      if (err) {
        console.log("Error inserting grade: ", err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

  res.send("Grade added successfully to MongoDB");
});

app.get("/", async (req, res) => {
  const { subject, grade } = req.body;

  const client = await MongoClient.connect(url);
  const db = client.db(dbName);
  const collection = db.collection("grades");

  // Get all grades from the database
  const grades = await collection.find().toArray();

  // Calculate the average grade for each subject (ChatGPT)
  const subjects = [...new Set(grades.map((g) => g.subject))];
  console.log(subjects);
  const averages = subjects.map((subject) => {
    const gradesForSubject = grades.filter((g) => g.subject === subject);
    const total = gradesForSubject.reduce((acc, g) => acc + g.grade, 0);
    const average = total / gradesForSubject.length;
    console.log(average);
    return { subject, avgGrade: average };
  });

  res.render("index", { result: grades, averages: averages });
});

app.post("/deleteGrades", async (req, res) => {
  const { subject, grade } = req.body;
  MongoClient.connect(url, function (err, client) {
    const db = client.db(dbName);
    const collection = db.collection("grades");

    try {
      // Call the deleteMany() method to delete all documents in the "grades" collection
      collection.deleteMany();

      // Send a success response to the client
      res.status(200).send("All grades deleted successfully");
    } catch (err) {
      // Send an error response to the client
      res.status(500).send("Error deleting grades");
    }
  });
});

app.post("/show-data", function (req, res) {
  MongoClient.connect(url, function (err, client) {
    if (err) throw err;
    var db = client.db(dbName);
    var collection = db.collection("grades");
    collection.find().toArray(function (err, data) {
      if (err) {
        console.log(err);
      } else {
        res.render("index", { result: data });
      }
      client.close();
    });
  });
});
app.post("/show-data", function (req, res) {
  MongoClient.connect(url, function (err, client) {
    if (err) throw err;
    var db = client.db(dbName);
    var collection = db.collection("grades");
    collection.find().toArray(function (err, data) {
      if (err) {
        console.log(err);
      } else {
        res.render("index", { result: data });
      }
      client.close();
    });
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
