

const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.SECRET;
    const api = process.env.API;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked,
    })
    .unless({  //unless sirve para ignorar el uso jwt en este path especificado(iniciar sesion)
        path: [
            {url: /\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS']}, //hago uso de regex para que el usuario pueda ver los productos sin necesidad de loguearte
            {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS']}, //Aqui mismo las categorias
            `/api/v1/users/login`,
            `/api/v1/users/register`,
        ]
    })
}

async function isRevoked (req, payload, done) {
    if(!payload.isAdmin) {
        done(null, true);
    }

    done();
}

module.exports = authJwt;
