const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const register = require('./controller/register');
const SignIn = require('./controller/signIn');
const profile = require('./controller/profile');
const image = require('./controller/image');
const knex = require('knex');
    
const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'postgreSQL',
        database: 'smartbraindb'
    }
});

const app = express();

//middleware

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('Success');
});

app.post('/signin', (req, res) => {
    SignIn.handleSignIn(req, res, db, bcrypt);
});

app.post('/register', (req, res) => {
    register.handleRegister(req, res, db, bcrypt);
});

app.get('/profile/:id', (req, res) => {
    profile.handleProfile(req, res, db);
});

app.put('/image', (req, res) => {
    image.handleImage(req, res, db);
});
app.post('/imageurl', (req, res) => {
    image.handleApi(req, res);
});


app.listen(process.env.PORT || 3300, () => {
    console.log(`app is running successfully on port ${process.env.PORT}`);
});