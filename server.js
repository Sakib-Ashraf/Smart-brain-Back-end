const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const register = require('./controller/register');
const SignIn = require('./controller/signIn');
const SignOut = require('./controller/signOut');
const profile = require('./controller/profile');
const image = require('./controller/image');
const auth = require('./middleware/authorization');
const knex = require('knex');
require('dotenv').config();
    
const db = knex({
	client: 'pg',
	connection: {
		connectionString: process.env.DATABASE_URL,
		ssl: true,
	},
});

//for localhost support
//connection: () => {
//		return {
//			host: process.env.DB_HOST, //localhost
//			user: process.env.DB_USER, //add your user name for the database here
//			password: process.env.DB_PASSWORD, //add your correct password in here
//			database: process.env.DB_NAME, //add your database name you created here
//		};
//	},


const app = express();

//middleware

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('Success');
});

app.post('/signin', 
    SignIn.signInAuthentication( db, bcrypt)
);

app.post('/signout', (req, res) => {
	SignOut.handleSignOut(req, res);
});

app.post('/register', (req, res) => {
    register.handleRegister(req, res, db, bcrypt);
});

app.get('/profile/:id', auth.requireAuth, (req, res) => {
    profile.handleProfile(req, res, db);
});

app.post('/profile-update/:id', auth.requireAuth, (req, res) => {
    profile.handleProfileUpdate(req, res, db);
});

app.put('/image', auth.requireAuth, (req, res) => {
    image.handleImage(req, res, db);
});
app.post('/imageurl', auth.requireAuth, (req, res) => {
    image.handleApi(req, res);
});

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
	console.log(`app is running successfully on port 3300`);
});