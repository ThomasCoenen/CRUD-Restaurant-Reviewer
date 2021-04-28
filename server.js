//In Server:
//heroku login
//git init
//git add .
//heroku git:remote -a database-mysql-test
//git commit -m "make it better"
//git push heroku master

import express from 'express';
import cors from 'cors';
import mysql from 'mysql';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config(); 
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const db = require("./db"); //looks for index.js automatically

// const morgan = require("morgan");  //middleware

const app = express();
app.use(cors());
app.use(express.json());   //allows to parse body in get requests

// create a connection variable with the required details
var db = mysql.createConnection({
  host: process.env.DBHOST, // ip address of server running mysql
  user: process.env.DBUSER, // user name to your mysql database
  password: process.env.DBPASSWORD, // corresponding password
  database: process.env.DBDATABASE // use the specified database
});
 
// make to connection to the database.
db.connect(function(err) {
  // if (err) throw err;
  // if(err){return console.log(error)}
  if (err) throw err;
  console.log("Connected!");
});


// Get all Restaurants
app.get("/api/get-restaurants", async (req, res) => {
  try {
    db.query("SELECT * FROM restaurants",function(err,response,fields){
			if(err) throw err;
      console.log(response);
      
      res.status(200).json({
        status: "success",
        results: response,
        data: {
          restaurants: response,
        },
      });
		});

    // const allRestaurants = await db.query("SELECT * FROM restaurants");
    // console.log("allRestaurants:",allRestaurants)

    // db.query("SELECT * FROM restaurants",[records],function(err,res,fields){
		// 	if(err) throw err;
		// 	console.log(res);
		// });

    //avg rating for individual restuarant:
    // const restaurantRatingsData = await db.query("select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id;");
    // console.log("restaurantRatingsData:",restaurantRatingsData)

    // res.status(200).json({
    //   status: "success",
    //   results: restaurantRatingsData.rows.length,
    //   data: {
    //     restaurants: restaurantRatingsData.rows,
    //   },
    // });

    // res.status(200).json({
    //   status: "success",
    //   results: allRestaurants.rows.length,
    //   data: {
    //     restaurants: allRestaurants.rows,
    //   },
    // });

  } catch (err) {console.log(err);}
});

// //Get single Restaurant
// app.get("/api/single-restaurant/:id", async (req, res) => {
//   console.log(req.params.id);
//   try {
//     const restaurant = await db.query(     //has avg of individual restaurant
//       "select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id where id = $1",
//       [req.params.id]
//     );
//     // const restaurant = await db.query('SELECT * FROM restaurants WHERE id = $1', [req.params.id])   
//     // console.log("restaurant:",restaurant.rows[0])
//     const reviews = await db.query( "select * from reviews where restaurant_id = $1", [req.params.id]);
//     console.log("reviews:",reviews);

//     res.status(200).json({
//       status: "success",
//       data: {
//         restaurant: restaurant.rows[0],
//         reviews: reviews.rows,
//       },
//     });
//   } catch (err) {console.log(err);}
// });

// // Create a Restaurant
// app.post("/api/create-restaurant", async (req, res) => {
//   console.log(req.body);
//   try {
//     const results = await db.query(
//       "INSERT INTO restaurants (name, location, price_range) values ($1, $2, $3) returning *",  //returning * returns newly enerted data
//       [req.body.name, req.body.location, req.body.price_range]
//     );
//     console.log("results:",results);
//     res.status(201).json({
//       status: "success",
//       data: {
//         restaurant: results.rows[0],
//       },
//     });
//   } catch (err) {console.log(err);}
// });

// // Update Restaurants
// app.put("/api/update-restaurant/:id", async (req, res) => {
//   try {
//     const results = await db.query(
//       "UPDATE restaurants SET name = $1, location = $2, price_range = $3 where id = $4 returning *",
//       [req.body.name, req.body.location, req.body.price_range, req.params.id]
//     );
//     console.log("results:",results);
//     res.status(200).json({
//       status: "succes",
//       data: {
//         retaurant: results.rows[0],
//       },
//     });
//   } catch (err) {console.log(err);}
// });

// // Delete Restaurant
// app.delete("/api/delete-restaurant/:id", async (req, res) => {
//   try {
//     const results = db.query("DELETE FROM restaurants where id = $1", [
//       req.params.id,
//     ]);
//     res.status(204).json({
//       status: "sucess",
//     });
//   } catch (err) {console.log(err);}
// });

// app.post("/api/addReview/:id", async (req, res) => {
//   try {
//     const newReview = await db.query(
//       "INSERT INTO reviews (restaurant_id, name, review, rating) values ($1, $2, $3, $4) returning *;",
//       [req.params.id, req.body.name, req.body.review, req.body.rating]
//     );
//     console.log("newReview:",newReview);
//     res.status(201).json({
//       status: "success",
//       data: {
//         review: newReview.rows[0],
//       },
//     });
//   } catch (err) {console.log(err);}
// });


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
});
