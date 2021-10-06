const handleProfile = (req, res, db) => {
    const {
        id
    } = req.params;
    db.select('*').from('users').where({
        id
    })
        .then(user => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(400).json('user not found');
            }
        })
        .catch(err => {
            res.status(404).json('Error getting user');
        });
};

const handleProfileUpdate = (req, res, db) => {
    const {
        id
    } = req.params;

    const {
        name, age, pet
    } = req.body;

    db('users').where({
        id
    }).update({ name, age, pet })
        .then(resp => {
            if (resp) {
                res.json({ message: 'success' });
            } else {
                res.status(400).json('Unable to Update');
            }
        })
        .catch(err => {
            console.log(err);
            res.status(404).json('error updating user');
        });
};

module.exports = {
    handleProfile,
    handleProfileUpdate,
};