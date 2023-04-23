const express = require('express');
const { cleanUpAndValidate } = require('../Utils/AuthUtils');
const User = require('../Models/UserModel');
const { isAuth } = require('../Middlewares/AuthMiddleware');
const AuthRouter = express.Router();


// Register
AuthRouter.post('/register', async (req, res) => {
   
    const { name, username, email, password } = req.body;


    await cleanUpAndValidate({ username, name, email, password })
        .then(async () => {
            try {
                await User.verifyUsernameAndEmailExits({ username, email })
            } catch (error) {
                return res.send({
                    status: 400,
                    error: error
                })
            }
            // creating an object of user
            const user = new User({
                name, username, password, email
            })

            try {
                const userDB = await user.register();
                return res.send({
                    status: 200,
                    message: "user created successfully",
                    data: userDB
                });
            }
            catch (error) {
                return res.send({
                    status: 500,
                    message: "Database Error",
                    error: error
                })
            }
        })
        .catch((error) => {
            return res.send({
                status: 400,
                message: "data Invalid",
                error: error
            })
        })

});

// login
AuthRouter.post('/login', async (req, res) => {
    const { loginId, password } = req.body;

    try {

        const userDB = await User.loginUser({ loginId, password })

        // session based authentication
        req.session.isAuth = true;
        req.session.user = {
            username: userDB.username,
            userId: userDB._id,
            email: userDB.email
        }
        
        return res.send({
            status: 200,
            message: "user login successfully",
            data: userDB
        });

    } catch (error) {
        return res.send({
            status: 500,
            message: "Database error",
            error: error
        })
    }
});

AuthRouter.get('/check', isAuth, async (req, res) => {
    return res.send({
        message: "valid session"
    })
})

// logout
AuthRouter.post("/logout", isAuth, (req, res) => {
    const user = req.session.user;

    req.session.destroy((err) => {
        if (err) {
            return res.send({
                status: 400,
                message: "Logout unsuccessfull",
                error: err,
            });
        }

        return res.send({
            status: 200,
            message: "Logout Sucessfully",
            data: user,
        });
    });
});


module.exports = AuthRouter;