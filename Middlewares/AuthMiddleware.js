const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next()
    } else {
        return res.send({
            status: 200,
            message: "invalid session please login again"
        });
    }
}

module.exports = {isAuth}