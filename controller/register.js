const getAuthTokenId = require('./signIn').getAuthTokenId;
const createSession = require('./signIn').createSession;

const handleRegister = (req, res, db, bcrypt) => {

    const { name, email, password, age, pet } = req.body;

    console.log(req.body);

    if (!name || !email || !password) {
        return Promise.reject({ message: 'incorrect form submission' });
    }

    const hash = bcrypt.hashSync(password);

    return db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        name: name,
                        email: loginEmail[0],
                        age: age,
                        pet: pet,
                        joined: new Date(),
                    })
                    .then(user => user[0])
                    .then(trx.commit)
                    .catch(trx.rollback);
            })
            .catch(err => {
                console.log(err);
                 Promise.reject({ message: 'Unable to Signup' });
            });
    })
        .catch(err => {
            console.log(err);
            Promise.reject({ message: 'wrong credentials' });
        });
};

const signUpAuthentication = (db, bcrypt) => (req, res) => {
	const { authorization } = req.headers;

    return authorization ?
        getAuthTokenId(req, res) :
        handleRegister(req, res, db, bcrypt)
				.then((data) => {
                    return data.id && data.email ?
                        createSession(data) :
                        Promise.reject(data);
				})
				.then((session) => res.json(session))
				.catch((err) => {
					console.log(err);
					res.status(400).json({ message: 'something is wrong' });
				});
};

module.exports = {
	signUpAuthentication,
};
