import {} from 'dotenv/config'
import express  from "express"; 
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from 'cors';
import postRoute from './routes/posts.js';
import userRoutes from './routes/user.js';

const app = express();
app.use(bodyParser.json({limit:'30mb', extended: true}));
app.use(bodyParser.urlencoded({limit:'30mb', extended: true}));
app.use(cors());


app.use('/posts', postRoute);
app.use('/user', userRoutes);

app.get('/', (req, res) => {
    res.send('YOOOOO! Our app running successfully')
})

const CONNECTION_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vyi6c.mongodb.net/metroBabe?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true})
.then( () => app.listen(PORT, ()=> console.log(`Our crazy server running Port:  ${PORT}`)) )

.catch( (error) => console.log(error.message) )

// mongoose.set('useFindAndModify', false)