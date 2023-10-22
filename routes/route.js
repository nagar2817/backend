import express from 'express';
const router = express.Router();
import {WelcomeRoute,FetchMovies,InsertMovies,getAllgenres,getMovies,getAllMovies,
    getMovieById,updateMovieRating,filteredgenres,searchedMovies,updateFavorites,
    updateWantToWatch,signin,fetchMovieFromFavorites,fetchFavoriteMovies,fetchWantToWatchMovies,
    fetchWantToWatchFromFavorites,fetchWatchedMovies,fetchMovieFromWatched,updateWatched,
    fetchUserRating,fetchAndUpdateUserRating} from '../authcontroller/controller.js';

router.get('/',WelcomeRoute);

router.get('/movies/:page',FetchMovies)
router.get('/moviesgenres/genres',getAllgenres);
router.get('/filteredgenres/:genre/:limit',filteredgenres);
router.post('/insertmovies/:page',InsertMovies);

// fetch from our DB
// get all movis with limit
router.get('/getMovies/:limit',getMovies);
router.get('/getAllmovies', getAllMovies);
router.get('/filteredMovies/:query',searchedMovies);
router.get('/getSinglemovie/:id', getMovieById);
router.put('/updateRating/:userId/:id', updateMovieRating);
router.post('/updatefavorites/:userId/:movieId/:action', updateFavorites);
router.get('/signin/:email/:password',signin);

router.get('/fetchMovieFromFavorites/:userId/:movieId',fetchMovieFromFavorites);
router.get('/fav/:userId',fetchFavoriteMovies);

router.post('/updatewantToWatch/:userId/:movieId/:action', updateWantToWatch);
router.get('/watch/:userId',fetchWantToWatchMovies);
router.get('/fetchWantToWatchFromFavorites/:userId/:movieId',fetchWantToWatchFromFavorites);

router.get('/watched/:userId',fetchWatchedMovies);
router.get('/fetchMovieFromWatched/:userId/:movieId',fetchMovieFromWatched);
router.post('/updateWatched/:userId/:movieId/:action',updateWatched);

router.get('/userrating/:userId/:movieId',fetchUserRating);
router.post('/updateUserRating/:userId/:movieId',fetchAndUpdateUserRating);

export default router;