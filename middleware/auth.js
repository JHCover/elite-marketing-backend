import jwt from 'jsonwebtoken';
import config from '../config'

const { JWT_SECRET } = config;

export default (req, res, next) => {
    console.log(req.header);
    const token = req.header('x-auth-token');

    // Check for token
    if (!token)
        return res.status(401).json({ msg: 'No token, authorization denied'});

    try {
        // Verify token
        // Add user from payload
        req.user = jwt.verify(token, JWT_SECRET);
        req.guest = jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid'})
    }
};

