import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { RestaurantsContext } from "../context/RestaurantsContext";
import RestaurantFinder from "../apis/RestaurantFinder";
import StarRating from "../components/StarRating";
import Reviews from "../components/Reviews";
import AddReview from "../components/AddReview";

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const { selectedRestaurant, setSelectedRestaurant } = useContext(RestaurantsContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await RestaurantFinder.get(`/single-restaurant/${id}`);
        // console.log('restaurantReviews:',response.data.data.reviews);
        console.log('SelectedRestaurant:',response.data.data);
        setSelectedRestaurant(response.data.data);
        // setSelectedRestaurant(response.data.data.restaurant[0]);
      } 
      catch (err) {console.log(err);}
    };
    fetchData();
  }, [id,setSelectedRestaurant]);

  return (
    <div>
      {selectedRestaurant && (
        <>
          <h1 className="text-center display-1" style={{fontSize:"42px"}}>{selectedRestaurant?.restaurant[0]?.name}</h1>
          <div className="text-center">
            <StarRating rating={selectedRestaurant?.restaurant[0]?.average_rating} />
            {/* <StarRating rating={4.1} /> */}

            <span className="text-warning ml-1">
              {selectedRestaurant?.restaurant[0]?.num_reviews
                ? `(${selectedRestaurant?.restaurant[0]?.num_reviews})`
                : "(0)"}
            </span>
          </div>

          <div className="mt-3">
            <Reviews reviews={selectedRestaurant.reviews} />
          </div>

          <AddReview />
        </>
      )}
    </div>
  );
};

export default RestaurantDetailPage;
