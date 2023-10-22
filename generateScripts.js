import pool from "./db.js";
import axios from "axios";

const generateRatingData = async (userIds,MovieIds) => {
  try {
    let ratingId =600;
    for (let i = 0; i < userIds.length; i++) { 
      const userId = userIds[i];

      for (let j = 1; j <= 5; j++) { 
        const movieIdIndex = Math.floor(Math.random() * MovieIds.length); // Assuming you have movie IDs up to 100000
        const rating = Math.floor(1+ Math.random() * 10); // Random rating between 1 and 10

        const ratingQuery = {
          text: 'INSERT INTO userratings (rating_id,user_id, movie_id, rating) VALUES ($1, $2, $3,$4)',
          values: [ratingId++,userId, MovieIds[movieIdIndex], rating],
        };
        await pool.query(ratingQuery);
      }
    }

    console.log('Data generation and insertion complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // pool.end(); // Close the pool
  }
};

const GenerateUsers = async (starting,number)=>{
        // generate 10000 users
        let Users = [];// Start a transaction
        for (let i = starting; i < number; i++) {
            const userQuery = {
                text: 'INSERT INTO users (user_id,username,email,password) VALUES ($1,$2,$3,$4) RETURNING user_id',
                values: [i, `user_${i}`, `user${i}@gmail.com`, `user${i}@123`],
            };
            const userResult = await pool.query(userQuery);
            const userId = userResult.rows[0].user_id;
            Users.push(userId);
        }
        return Users;
}

const getMoviesId = async (limit)=>{
  // get movie_id of 10000 movies from the Movies table in the database
    try {
      const client = await pool.connect();
      const query = `SELECT movie_id FROM Movies LIMIT ${limit}`;
      const result = await client.query(query);
      const movieIds = result.rows.map(row => row.movie_id);
      return movieIds;
    } catch (error) {
      console.error('Error:', error);
    }
};

const getUsersId = async (limit)=>{
  // get movie_id of 10000 movies from the Movies table in the database
    try {
      const client = await pool.connect();
      const query = `SELECT user_id FROM Users LIMIT ${limit}`;
      const result = await client.query(query);
      const usersIds = result.rows.map(row => row.user_id);
      return usersIds;
    } catch (error) {
      console.error('Error:', error);
    }
};

const usergenerationtracker = async(l,h)=>{
  let breakpoint = 100;
  let usersId = [];
  let  i =l;
  while(i<=h){
    const ids = await GenerateUsers(i,i+breakpoint);
    usersId.push(ids);
    console.log(`${i}+ ${breakpoint} user generated`);
    i=i+breakpoint
  }
  return usersId;
}

export const InsertMovies = async(page)=>{
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.MOVIE_DB_API_KEY}&page=${page}`
    );
    const movies = response.data.results;

    for (const movie of movies) {
      const insertQuery = {
        text: 'INSERT INTO movies (movie_id, title, overview, release_date, rating, vote_count, poster_path, backdrop_path, genre_ids) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        values: [movie.id, movie.title, movie.overview, movie.release_date, movie.vote_average, movie.vote_count, movie.poster_path, movie.backdrop_path, movie.genre_ids],
      };
      await pool.query(insertQuery);
    // console.log(`Movies inserted successfully ${page}`)
    }

  } catch (err) {
    console.error('Error:', err);
  }
};

// create functoin similar to usergenerationtracker for inserting movies
const movieTracker = async(l,h)=>{
  let  i =l;
  while(i<=h){
     await InsertMovies(i);
     i++;
    // console.log(`${i} pages movies inserted`);
  }
}

// const movieTrackerResponse = await movieTracker(101,300);

// const userId = await createUser("user01", "dsds.@gamil.com", "jyWR1VZCKsZV3RgVfCuame6yTFB3");
// console.log(userId);

const MovieIds = await getMoviesId(5000);
console.log(MovieIds);
const userIds = await getUsersId(1000);
console.log(userIds);

// const UserIds = await GenerateUsers(10000,10100);
// console.log(UserIds);



// start from here
// const users = await usergenerationtracker(5001,5000);
// console.log(users);

const ans = await generateRatingData(userIds, MovieIds);
// console.log(ans);
// generateRandomData();
