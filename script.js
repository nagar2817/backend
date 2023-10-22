// -- Create the Movies Table
// CREATE TABLE Movies (
//     movie_id serial PRIMARY KEY,
//     backdrop_path VARCHAR(255),
//     genre_ids INT[],
//     overview TEXT,
//     poster_path VARCHAR(255),
//     release_date VARCHAR(255),
//     title VARCHAR(255),
//     vote_average DECIMAL(3, 1),
//     vote_count INT
// );


// -- Create the Users Table
// CREATE TABLE Users (
//     user_id serial PRIMARY KEY,
//     username VARCHAR(50) NOT NULL,
//     email VARCHAR(100) NOT NULL,
//     password VARCHAR(100) NOT NULL,
//     -- Add any other columns for user information
// );

// -- Create the User Ratings Table
// CREATE TABLE UserRatings (
//     rating_id serial PRIMARY KEY,
//     user_id INT REFERENCES Users(user_id),
//     movie_id INT REFERENCES Movies(movie_id),
//     rating INT,
//     timestamp TIMESTAMP,
//     -- Add any other columns for user ratings if needed
// );

// -- Create the Favorites Table
// CREATE TABLE Favorites (
//     favorite_id serial PRIMARY KEY,
//     user_id INT REFERENCES Users(user_id),
//     movie_id INT REFERENCES Movies(movie_id),
//     timestamp TIMESTAMP,
//     -- Add any other columns if needed
// );

// -- Create the Want to Watch Table
// CREATE TABLE WantToWatch (
//     want_to_watch_id serial PRIMARY KEY,
//     user_id INT REFERENCES Users(user_id),
//     movie_id INT REFERENCES Movies(movie_id),
//     timestamp TIMESTAMP,
//     -- Add any other columns if needed
// );
