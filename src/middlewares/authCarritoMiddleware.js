//authentication middleware

function authCarritoMiddleware (req, res, next) {
    if (!req.session.nombre) {
        console.log('CASHOOOOOO');
        return res.redirect('/login');
    }
    next ();
}

module.exports = authCarritoMiddleware;
