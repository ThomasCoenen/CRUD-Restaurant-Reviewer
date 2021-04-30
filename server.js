//In Server:
//heroku login
//git init
//git add .
//heroku git:remote -a database-mysql-test
//git commit -m "make it better"
//git push heroku master

//git add *
//git commit -m "make it better"
//git push -f origin master

import express from 'express'
import cors from 'cors';
import mysql from 'mysql';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config(); 
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());   //allows to parse body in get requests

// var db = mysql.createConnection({
//   host: process.env.DBHOST, // ip address of server running mysql
//   user: process.env.DBUSER, // user name to your mysql database
//   password: process.env.DBPASSWORD, // corresponding password
//   database: process.env.DBDATABASE // use the specified database
// });
 
// db.connect(function(err) { // make to connection to the database.
//   if (err) throw err;
//   console.log("Connected!");
// });

var db_config = {
    host: process.env.DBHOST, 
    user: process.env.DBUSER, 
    password: process.env.DBPASSWORD,
    database: process.env.DBDATABASE 
};
  
var db;
  
function handleDisconnect() {
    db = mysql.createConnection(db_config);                                        
    db.connect(function(err) {             
      if(err) {                                    
        console.log('error connecting to db:', err);
        setTimeout(handleDisconnect, 2000); 
      }                  
      console.log("Connected to the DB!");                  
    });                                     
                                            
    db.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
        handleDisconnect();                         
      } else {                                      
        throw err;                                  
      }
    });
}
handleDisconnect();

// Get all Restaurants
app.get("/api/get-restaurants", async (req, res) => {
  try {
    db.query("SELECT * FROM restaurants",function(err,response,fields){
	  if(err) throw err;
      console.log(response);
      db.query(
        "select * from restaurants left join (select restaurant_id, COUNT(*) as num_reviews, AVG(rating) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id",
        function(err2,response2,fields2){
          if(err2) throw err2;
          console.log("allRestaurants w/ Rating:",response2);
          res.status(200).json({
            status: "success",
            data: {
              restaurants: response2,
            },
          });
      });
    });
  } catch (err) {console.log(err);}
});

//Get single Restaurant
app.get("/api/single-restaurant/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    db.query(
      "select * from restaurants left join (select restaurant_id, COUNT(*) as num_reviews, AVG(rating) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id where id = ?",
      [req.params.id],
      function(err1,response1,fields1) {
        if(err1) throw err1;
        console.log("response1:",response1);
        db.query(`select * from reviews where restaurant_id = ${req.params.id}`, function(err2,response2,fields2) {
          if(err2) throw err2;
          console.log('response2:',response2);
          res.status(200).json({
            status: "success",
            data: {
              restaurant: response1,
              reviews: response2,
            },
          });
        });
    });
  } catch (err) {console.log(err);}
});

// Create a Restaurant
app.post("/api/create-restaurant", async (req, res) => {
  console.log(req.body);
  try {
    db.query("INSERT INTO restaurants (name, location, price_range) values (?, ?, ?)",
      [req.body.name, req.body.location, req.body.price_range],
      function(err,response,fields){
        if(err) throw err;
        console.log('createRestaurantRes1:',response);
        db.query(`select * from restaurants WHERE id = ${response.insertId}`,
          function(err2,response2,fields2){
            console.log('createRestaurantRes2:',response2[0]);
            if(err2) throw err2;
            res.status(201).json({
              status: "success",
              data: {
                  restaurant: response2,
              },
            });
        });
	});
  } catch (err) {console.log(err);}
});

// Update Restaurants
app.put("/api/update-restaurant/:id", async (req, res) => {
  try {
    db.query("UPDATE restaurants SET name = ?, location = ?, price_range = ? where id = ?",
      [req.body.name, req.body.location, req.body.price_range, req.params.id],
      function(err,response,fields){
          if(err) throw err;
          console.log('createRestaurantRes:',response);
          res.status(200).json({
              status: "succes",
              data: {
                  restaurant: response,
              },
          });
	});
  } catch (err) {console.log(err);}
});

// Delete Restaurant
app.delete("/api/delete-restaurant/:id", async (req, res) => {
  try {
    db.query(`DELETE FROM restaurants where id = ${req.params.id}`,
      function(err,response,fields){
        if(err) throw err;
        console.log(response);
        res.status(200).json({
            status: "success",
        });
	});
  } catch (err) {console.log(err);}
});

app.post("/api/addReview/:id", async (req, res) => {
  try {
    db.query('INSERT INTO reviews (restaurant_id, name, review, rating) values (?, ?, ?, ?)',
      [req.params.id, req.body.name, req.body.review, req.body.rating],
      function(err,response,fields){
        if(err) throw err;
        console.log("newReview:",response);
        res.status(201).json({
          status: "success",
          data: {
              review: response,
          },
        });
	});
  } catch (err) {console.log(err);}
});

//serve build folder in heroku
// check if app is in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/client/build')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html')); //relative path
  })
} else {
  app.get('/', (req, res) => {
    res.send("API running")
  })
}

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`server is up and listening on port ${port}`);
})
