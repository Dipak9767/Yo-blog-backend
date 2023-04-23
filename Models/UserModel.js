const UserSchema = require("../Schemas/UserSchema")
const bcrypt = require("bcrypt");
const ObjectId = require("mongodb").ObjectId;

const User = class {
    constructor({ username, name, password, email }) {
        this.username = username,
            this.name = name,
            this.password = password,
            this.email = email
    }

    static verifyUserId({ userId }) {
        return new Promise(async (resolve, reject) => {
            if (!ObjectId.isValid(userId)) {
                reject("Invalid userId format");
            }

            try {
                const userDb = await UserSchema.findOne({ _id: userId });
                if (!userDb) {
                    reject(`No user corresponding to this ${userId}`);
                }

                resolve(userDb);
            } catch (error) {
                reject(error);
            }
        });
    }


    register() {
        return new Promise(async (resolve, reject) => {

            const hashedPass = await bcrypt.hash(this.password, parseInt(11))
            const user = new UserSchema({
                name: this.name,
                username: this.username,
                password: hashedPass,
                email: this.email
            })

            try {
                const userDB = await user.save()
                resolve(userDB)
            } catch (error) {
                reject(error)
            }
        })
    }

    static verifyUsernameAndEmailExits({ email, username }) {
        return new Promise(async (resolve, reject) => {
            try {
                const userDb = await UserSchema.findOne({
                    $or: [{ email }, { username }],
                });

                if (userDb && userDb.email === email) {
                    reject("Email Already Exit");
                }

                if (userDb && userDb.username === username) {
                    reject("Username Already Exit");
                }

                return resolve();
            } catch (error) {
                reject(error);
            }
        });

    }

    static loginUser({ loginId, password }) {
        return new Promise(async (resolve, reject) => {
            try {

                // finding user 
                const userDB = await UserSchema.findOne({
                    $or: [{ username: loginId }, { email: loginId }]
                })

                // if user not found
                if (!userDB) {
                    reject("user does not exists")
                }

                // matching the password
                const isMatched = bcrypt.compare(password, userDB.password)

                // checking for incorrect password
                if (!isMatched) {

                    reject("Incorrect Password")
                }

                // all good returning userDB
                resolve(userDB)
            } catch (error) {
                reject()
            }
        })
    }
}

module.exports = User;