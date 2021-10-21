const jwt = require('jsonwebtoken');
const redis = require('redis');

//Setup Redis Client

const redisClient = redis.createClient(process.env.REDIS_URL);

//for localhost
//const redisClient = redis.createClient({
//host: process.env.DB_HOST
//});

const handleSignIn = (req, res, db, bcrypt) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return Promise.reject({message : 'incorrect form submission'});
    }
    
    return db.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash);
            if (isValid) {
                return db.select('*').from('users')
                    .where('email', '=', email)
                    .then(user => user[0])
                    .catch(err => {
                        console.log(err);
                        Promise.reject({ message: 'User not found' });
                    });
            } else {
                Promise.reject({message: `Didn't find a match`});
            }
        })
        .catch(err => {
            console.log(err);
            Promise.reject({ message: 'wrong credentials' });
        });
};


const getAuthTokenId = (req, res) => {

    const { authorization } = req.headers;

    return redisClient.get(authorization, (err, data) => {
        if (err || !data) {
            res.status(400).json({ message: 'Unauthorized' });
        }
        return res.status(200).json({ id: data });
    });
};


const signToken = (email) => {

    const jwtPayload = { email };

    return jwt.sign(jwtPayload, process.env.JWT_SECRET, {
        expiresIn: '2 days'
    });
};


const setToken = (token, id) => {
    return Promise.resolve(redisClient.set(token, id));
};

const createSession = (data) => {

    const { id, email } = data;

    const token = signToken(email);

    return setToken(token, id)
        .then(() => {
            return {
                success: 'true',
                userId: id,
                token: token,
            };
        })
        .catch(err => {console.log(err);});
    
};


const signInAuthentication = (db, bcrypt) => (req, res) => {

    const { authorization } = req.headers;
    
    return authorization ?
        getAuthTokenId(req, res) :
        handleSignIn(req, res, db, bcrypt)
            .then(data => {
               return data.id && data.email ? createSession(data) : Promise.reject(data);
            })
            .then((session) => res.json(session))
            .catch(err => {
                console.log(err);
                res.status(400).json({ message: 'something is wrong' });
            });
};

module.exports = {
    signInAuthentication,
    redisClient
};