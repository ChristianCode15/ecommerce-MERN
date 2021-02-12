

const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({sucesss: false});
    }

    res.send(userList);
});

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({success: false});
    }

    res.status(200).send(user);
})

router.post(`/`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
    })
    user = await user.save();

    if(!user)
    {
        return res.status(404).send('El usuario no ha sido creado')
    }

    res.send(user);
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.SECRET;

    if(!user) {
        return  res.status(400).send('Usuario no encontrado');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
        {    
            userId: user.id,
            isAdmin: user.isAdmin,
        },
        secret,
        {expiresIn: '1d'}
        );
        res.status(200).send({ user: user.email, token: token});
    }else{
        res.status(400).send('La contraseña es incorrecta');
    }

});

router.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: req.body.passwordHash,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })
    user = await user.save();

    if(!user) {
        return res.status(400).send('El usuario no se pudo crear');
    }

    res.send(user);
})

router.delete('/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id)
    .then( user => {
        if(user){
            return res.status(200).json({success: true, message: 'El usuario a sido eliminada con exito'});
        } else {
            return res.status(404).json({success: false, message: 'No se ha encontrado el usuario'});
        }
    })
    .catch( err => {
        return res.status(400).json({success: false, error: err});
    })
})

router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments((count) => count);

    if(!userCount) {
        res.status(500).json({success: false});
    }

    res.send({
        userCount: userCount,
    });
})


module.exports = router;