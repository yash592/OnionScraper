var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/OnionScraper", {
  useMongoClient: true
});

// =====================================================================

// Scraping route for Onion polititcs

// =====================================================================


app.get("/scrape", function(req, res) {
  
  axios.get("https://politics.theonion.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("h1.headline").each(function(i, element) {
      var result = {};

      result.title = $(this).children().text();
      result.link = $(this).children().attr("href");

      console.log(result);

      db.Headline
        .create(result)
        .then(function(dbArticle) {
          
        })
        .catch(function(err) {
          res.json(err);
        });
    });

    res.send("Scrape Complete");

  });

}); // /scrape ends here

// =====================================================================

// headline route for Onion polititcs

// =====================================================================

app.get("/headlines", function(req, res) {

  db.Headline.find({})
  .then(function(dbHeadline) {
    res.json(dbHeadline)
  })
  .catch(function(err) {
    res.json(err);
  });
}); // /headlines ends here

//=====================================================================

// route to get headlines by id

// =====================================================================

app.get("/headlines/:id", function(req, res) {

  db.Headline.findOne({ _id: req.params.id })
  .populate("note")
  .then(function(dbHeadline) {

    res.json(dbHeadline);

  })
  .catch(function(err) {

    res.json(err);

  });

}); // headlines/id ends here

//=====================================================================

// route to post notes to headlines

// =====================================================================

app.post("/headlines/:id", function(req, res) {

  db.Note.create(req.body)
          .then(function(dbNote) {

            return db.Headline.findOneAndUpdate({ _id: req.params.id }, {note: dbNote._id}, { new: true });
          })
          .then(function(dbArticle) {

            res.json(dbArticle);

          })
          .catch(function(err) {

            res.json(err);

          });
});



// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
