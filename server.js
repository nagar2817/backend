import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/route.js';
dotenv.config();
const app = express();
import "./db.js";
import "./generateScripts.js";
// setup cors policy allow everyone to us this service

app.use(express.urlencoded({ extended: true }));

// write cors options for localhost:5173 
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8000

app.use('/',router);

app.listen(PORT,(req,res)=>{
    console.log(`Movie App is listening at ${PORT}`);
})


