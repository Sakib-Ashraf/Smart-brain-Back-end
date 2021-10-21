const handleRegister = (req, res, db, bcrypt) => {
    const { name, email, password, age, pet } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json('incorrect form submission');
    }

    const hash = bcrypt.hashSync(password);

    db.transaction(trx => {
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
                    .then(user => {
                        res.json(user[0]);
                    })
                    .then(trx.commit)
                    .catch(trx.rollback);
            })
            .catch(err => {
                console.log(err);
                res.status(400).json('Wrong info or already registered');
            });
    })
        .catch(err => {
            console.log(err);
            res.status(400).json('Unable to register');
        });
};

module.exports = {
    handleRegister
};
