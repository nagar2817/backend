import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();
import pool from '../db.js';

export const WelcomeRoute = (req,res)=>{
    res.send('Welcome to Movie App');
}


// fetch movies
/**
 * Fetch popular movies from TMDB
 *  @returns {Array} movies
 */
const fetchMovies = async (page) => {
    try {
    let result;
      await axios
        .get(
          `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.MOVIE_DB_API_KEY}&language=en-US&page=${page}`
        )
        .then((response) => {
          result = response.data.results;
        })
        .catch((error) => {
          console.log(error);
        });
      return result;
    } catch (error) {
      console.error(error);
    }
  };

export const FetchMovies =  async (req, res,next)=>{
    try {
        const {page} = req.params;
        const data = await fetchMovies(page);

        return res.status(200).json({
          status:200,
          message: `${data.length} movies found`, 
          data
        })
      } catch (err) {
        return next(err);
    }
}
export const InsertMovies = async function (req, res, next) {
  try {
    const page = req.params.page;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.MOVIE_DB_API_KEY}&language=en-US&page=${page}`
    );
    const movies = response.data.results;

    for (const movie of movies) {
      const insertQuery = {
        text: 'INSERT INTO movies (movie_id, title, overview, release_date, rating, vote_count, poster_path, backdrop_path, genre_ids) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        values: [movie.id, movie.title, movie.overview, movie.release_date, movie.vote_average, movie.vote_count, movie.poster_path, movie.backdrop_path, movie.genre_ids],
      };
      await pool.query(insertQuery);
    }

    res.status(200).json({ message: 'Movies inserted successfully' });
  } catch (err) {
    return next(err);
  }
};

//app.js
/**
 * Fetch genres from the moviedb.org
 *  @returns {Array} list of genres
 */
const fetchGenres = async (page) => {
    try {
      let result;
      await axios
        .get(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.MOVIE_DB_API_KEY}`
        )
        .then((response) => {   
          result = response.data.genres;
        })
        .catch((error) => {
          console.log(error);
        });
      return result;
    } catch (error) {
      console.error(error);
    }
  };



export const getAllgenres = async (req,res)=>{
        try {
            const data = await fetchGenres();
    
            return res.status(200).json({
              status:200,
              message: `${data.length} genres found`, 
              data
            })
          } catch (err) {
            return next(err);
          }
}

export const filteredgenres = async (req, res) => {
  const { genre, limit } = req.params;
  try {
    const query = {
      text: 'SELECT * FROM Movies WHERE $1 = ANY (genre_ids) LIMIT $2',
      values: [genre, limit]
    };
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.log(err);
  }
};

export const getMovies = async (req, res)=> {
    try {
        const limit = req.params.limit;
        const query = {
          text: 'SELECT * FROM Movies LIMIT $1',
          values: [limit]
        };
        const result = await pool.query(query);
        res.status(200).json(result.rows);
      } catch (err) {
        console.error(err);
    }
}

export const getAllMovies = async(req,res)=>{
  try {
    const query = 'SELECT * FROM Movies';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
   console.error(err);
}
}

export const searchedMovies = async (req, res) => {
const query = req.params.query;
  try {
    // this search query should be case insensitive

    const searchQuery = {
      text: 'SELECT * FROM Movies WHERE title ILIKE $1 OR title ILIKE $2',
      values: [`%${query}%`, `%${query.replace(/\s/g, '')}%`],
    };
    const result = await pool.query(searchQuery);
    res.status(200).json(result.rows);
      } catch (err) {
    console.log(err);
      }
    }


export const getMovieById = async (req, res)=> {
    try {
        const id = req.params.id;
        const query = `SELECT * FROM Movies WHERE movie_id = ${id}`;
        const result = await pool.query(query);
        res.status(200).json(result.rows[0]);
      } catch (err) {
        console.log(err);
    }
}

// create an function to update the rating of a movie which account for rating pass from boyd and vote_count of that movie and do some math
export const updateMovieRating = async (req, res, next) => {
  try {
    const {userId,id} = req.params;
    const { rating } = req.body;
    const query = `SELECT * FROM Movies WHERE movie_id = ${id}`;
    const result = await pool.query(query);
    const movie = result.rows[0];
    const updatedRating = calculateUpdatedRating(movie.rating, movie.vote_count, rating);
    console.log(updatedRating);
        const updateQuery = `
          UPDATE Movies 
          SET rating = ${updatedRating}, vote_count = vote_count + 1 
          WHERE movie_id = ${id}
        `;
      await pool.query(updateQuery);
    // update quesry to update rating in userratings tbale correscponidg to userId & movie_id
    const updateRatingQuery = {
      text: 'UPDATE userratings SET rating = $1 WHERE user_id = $2 AND movie_id = $3',
      values: [rating, userId, id],
    };
    await pool.query(updateRatingQuery);

    res.status(200).json({ message: 'Movie rating updated successfully' });
  } catch (err) {
    return next(err);
  }
};


const calculateUpdatedRating = (currentRating, voteCount, newRating) => {
  const totalRating = currentRating * voteCount;
  const newTotalRating = totalRating + newRating;
  const newVoteCount = voteCount + 1;
  const updatedRating = newTotalRating / newVoteCount;
  // console.log(updatedRating);
  return updatedRating.toFixed(1);
};

// write an function to update the favroiur table mean add and remove from favoirit table
export const updateFavorites = async (req, res, next) => {
  try {
    const { userId, movieId, action } = req.params;
    // action 0 -> remove , 1 -> add

    let query;
    if (action == 1) {
      query = {
        text: 'INSERT INTO Favorites (user_id, movie_id, timestamp) VALUES ($1, $2, NOW())',
        values: [userId, movieId],
      };
    } else {
      query = {
        text: 'DELETE FROM Favorites WHERE user_id = $1 AND movie_id = $2',
        values: [userId, movieId],
      };
    }

    await pool.query(query);

    res.status(200).json({ message: 'Favorites updated successfully' });
  } catch (err) {
    return next(err);
  }
};

/// create similiar funtion to update the favroiur table for want to watch 
// write a function to update the WantToWatch table, meaning add and remove movies from the table
export const updateWantToWatch = async (req, res, next) => {
  try {
    const { userId, movieId, action } = req.params;
    // action 0 -> remove, 1 -> add

    let query;
    if (action == 1) {
      query = {
        text: 'INSERT INTO WantToWatch (user_id, movie_id, timestamp) VALUES ($1, $2, NOW())',
        values: [userId, movieId],
      };
    } else {
      query = {
        text: 'DELETE FROM WantToWatch WHERE user_id = $1 AND movie_id = $2',
        values: [userId, movieId],
      };
    }

    await pool.query(query);

    res.status(200).json({ message: 'WantToWatch updated successfully' });
  } catch (err) {
    return next(err);
  }
};

// creat an function to insert an user. while inserting first fetch total user so that new user have id as total user length + 1
// Create a function to insert a user and fetch the total number of users
const createUser = async (username, email, password) => {
  try {
    const countQuery = 'SELECT COUNT(*) FROM Users';
    const countResult = await pool.query(countQuery);
    const totalUsers = parseInt(countResult.rows[0].count);
    
    const query = {
      text: 'INSERT INTO Users (user_id, username, email, password) VALUES ($1, $2, $3, $4)',
      values: [totalUsers + 1, username, email, password],
    };
    await pool.query(query);
    return totalUsers + 1;
  } catch (error) {
    console.error('Error:', error);
  }
};

// create signin function as it check email and password wiht existing users table if is correct then return user id
// in signin function return something if user is not match
export const signin = async (req,res)=> {
  const {username,email, password} = req.params;
  try {
    const query = {
      text: 'SELECT user_id FROM Users WHERE email = $1 AND password = $2',
      values: [email, password],
    };
    const result = await pool.query(query);
    if (result.rows.length === 0) {
      const userId = await createUser(username, email, password);
      res.status(200).json(userId);
    }
    const userId = result.rows[0].user_id;
    res.status(200).json(userId);
  } catch (error) {
    console.error('Error:', error);
  }
};

// craete function to fetch movei from favorites table usin userid and movieid return movie if found otherwise -1
// Create a function to fetch a movie from the favorites table using the user ID and movie ID
// Return the movie if found, otherwise return -1
export const fetchMovieFromFavorites = async (req, res) => {
  const { userId, movieId } = req.params;
  try {
    const query = {
      text: 'SELECT * FROM Favorites WHERE user_id = $1 AND movie_id = $2',
      values: [userId, movieId],
    };
    const result = await pool.query(query);
    if (result.rows.length === 0) {
      res.status(200).json(-1);
    }else{
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// create function to fetching fav movis of user from favouite tables
export const fetchFavoriteMovies = async (req,res) => {
  // create subqeyr to fecth all movies having movie id correst posing to user_id in favrotir table
  const userId = req.params.userId;
  const subquery = `
    SELECT movie_id
    FROM Favorites
    WHERE user_id = ${userId}
  `;

  const query = `
    SELECT *
    FROM Movies
    WHERE movie_id IN (${subquery})
  `;

  try {
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error:', error);
  }
};

export const fetchWantToWatchFromFavorites = async (req, res) => {
  const { userId, movieId } = req.params;
  try {
    const query = {
      text: 'SELECT * FROM WantToWatch WHERE user_id = $1 AND movie_id = $2',
      values: [userId, movieId],
    };
    const result = await pool.query(query);
    if (result.rows.length === 0) {
      res.status(200).json(-1);
    }else{
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

export const fetchWantToWatchMovies = async (req,res) => {
  // create subqeyr to fecth all movies having movie id correst posing to user_id in favrotir table
  const userId = req.params.userId;
  const subquery = `
    SELECT movie_id
    FROM WantToWatch
    WHERE user_id = ${userId}
  `;

  const query = `
    SELECT *
    FROM Movies
    WHERE movie_id IN (${subquery})
  `;

  try {
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error:', error);
  }
};





