/** Imports and Configurations */
const express = require('express');
const router = new express.Router();
const jwt = require('jsonwebtoken');
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require('../config');
const User = require('../models/user');
const ExpressError = require('../expressError');
/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        let user;
        try{
            user = await User.get(username);
            authenticated = await User.authenticate(username, password);
            if(!user || !authenticated) throw new Error();
            
        } catch(e) {
            throw new ExpressError('Invalid username/password', 400);
        }

        await User.updateLoginTimestamp(username);
        const token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
    } catch (e) {
        return next(e);
    }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try{
        const { username, password } = req.body;
        const user = await User.register(req.body);
        await User.updateLoginTimestamp(username);
        const token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
    } catch(e) {
        return next(e);
    }
});

module.exports = router;