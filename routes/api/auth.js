import {Router} from 'express';
import bcrypt from 'bcryptjs';
import config from '../../config';
import jwt from 'jsonwebtoken';
import auth from '../../middleware/auth';
import _ from 'lodash';
import {millisToMinutesAndSeconds} from "../../utilityFunctions/millisecondsToMinutes";

// User Model
import User from '../../models/User';
import Event from '../../models/Event'
import nodemailer from "nodemailer";

const {JWT_SECRET, EMAIL_SECRET, GMAIL_PASS, GMAIL_USER, URL, BACKEND_PORT, FRONTEND_PORT, MAIL_URL, CONFIRM_PAGE_URL} = config;

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
    },
});

const router = Router();

// @route   POST api/auth
// @desc    Login user
// @access  Public

router.post('/login', async (req, res) => {
    const {email, password} = req.body;

    // Simple validation
    if (!email || !password) {
        return res.status(400).json({msg: 'Please enter all fields'});
    }

    try {
        // Check for existing user
        const user = await User.findOne({email});
        if (!user) throw Error('User does not exist');
        if (!user.confirmed) throw Error('Please confirm your email to login.')

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw Error('Invalid credentials');

        const token = jwt.sign({id: user._id}, JWT_SECRET, {expiresIn: "30 days"});
        if (!token) throw Error('Could not sign the token');


        res.status(200).json({
            token,
            user
        });
    } catch (e) {
        res.status(400).json({msg: e.message});
    }
});


// @route   POST api/users
// @desc    Register new user
// @access  Public

router.post('/register', async (req, res) => {
    const {name, email, password} = req.body;

    // Simple validation
    if (!name || !email || !password) {
        return res.status(400).json({msg: 'Please enter all fields'});
    }

    try {

        const salt = await bcrypt.genSalt(10);
        if (!salt) throw Error('Something went wrong with bcrypt');

        const hash = await bcrypt.hash(password, salt);
        if (!hash) throw Error('Something wet wrong hashing the password');

        const user = await User.findOne({email});

        if (user && user.confirmed === true) throw Error('User already exists');

        else if (user && user.confirmed === false) {

            if (Date.now() - user.confEmailLastSent < 300000) {
                throw Error(`An email has been sent recently. Please try again in ${millisToMinutesAndSeconds(300000 - (Date.now() - user.confEmailLastSent))}`)

            } else {
                jwt.sign(
                    {
                        user: _.pick(user, '_id'),
                        password: hash
                    },
                    EMAIL_SECRET,
                    {
                        expiresIn: '1d',
                    },
                    (err, emailToken) => {
                        const url = `${MAIL_URL}/api/auth/confirmation/${emailToken}`;
                        transporter.sendMail({
                            to: email,
                            subject: 'Confirm Email',
                            html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
                        });
                        user.lastConfirmationTokenCreated = emailToken;
                    },
                );
                user.confEmailLastSent = Date.now()
                const savedUser = await user.save();
                if (!savedUser) throw Error('Something went wrong saving the user.');
                res.status(200).json({
                    user
                });
            }
        } else if (!user) {
            const newUser = new User({
                name,
                email,
                password: "password",
                confirmed: false,
                eventsDetails: [],
                stripeId: null,
                subExpireDate: null,
            });
            const savedUser = await newUser.save();
            if (!savedUser) throw Error('Something went wrong saving the user');

            if (req.body.guestEventDetails != null) {
                newUser.eventsDetails.push(req.body.guestEventDetails)
                const eventToUpdate = Event.findById(req.body.guestEventDetails.event)
                if (!eventToUpdate) throw Error("No event.")
                eventToUpdate.user = savedUser._id;
                await savedUser.save();
            }
            ;

            // async email
            jwt.sign(
                {
                    user: _.pick(savedUser, '_id'),
                    password: hash
                },
                EMAIL_SECRET,
                {
                    expiresIn: '1d',
                },
                (err, emailToken) => {
                    const url = `${MAIL_URL}/api/auth/confirmation/${emailToken}`;
                    transporter.sendMail({
                        to: email,
                        subject: 'Confirm Email',
                        html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
                    });
                    savedUser.lastConfirmationTokenCreated = emailToken;
                },
            );
            savedUser.confEmailLastSent = Date.now();
            const doubleSavedUser = await savedUser.save();
            if (!doubleSavedUser) throw Error("Something went wrong saving the user.");

            res.status(200).json({
                user
            });
        }

    } catch (e) {
        res.status(400).json({error: e.message});
    }
});

router.post('/resend', async (req, res) => {
    const {email} = req.body;

    try {
        // Check for existing user
        const user = await User.findOne({email});
        if (!user) throw Error("There was a problem finding the user.")
        if (Date.now() - user.confEmailLastSent < 300000) {
            throw Error(`An email has been sent recently. Please try again in ${millisToMinutesAndSeconds(300000 - (Date.now() - user.confEmailLastSent))}`)
        }

        const {password} = jwt.verify(user.lastConfirmationTokenCreated, EMAIL_SECRET);


        // async email
        jwt.sign(
            {
                user: _.pick(user, '_id'),
                password: password
            },
            EMAIL_SECRET,
            {
                expiresIn: '1d',
            },
            (err, emailToken) => {
                const url = `${MAIL_URL}/api/auth/confirmation/${emailToken}`;

                transporter.sendMail({
                    to: email,
                    subject: 'Confirm Email',
                    html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
                });
            },
        );
        user.confEmailLastSent = Date.now();
        const savedUser = await user.save();
        if (!savedUser) throw Error("Something went wrong saving the user.")

        res.status(200).json({savedUser});

    } catch (e) {
        res.status(400).json({msg: e.message});
    }
});

router.post('/sendresetpassemail', async (req, res) => {
    const {email} = req.body;

    try {
        // Check for existing user
        const user = await User.findOne({email});
        if (!user) throw Error('User does not exist');
        if (Date.now() - user.passwordResetEmailLastSent < 300000) {
            throw Error(`An email has been sent recently. Please try again in ${millisToMinutesAndSeconds(300000 - (Date.now() - user.passwordResetEmailLastSent))}`)
        }
        // async email
        jwt.sign(
            {
                user: _.pick(user, '_id'),
            },
            EMAIL_SECRET,
            {
                expiresIn: '1d',
            },
            (err, resetToken) => {
                const url = `${MAIL_URL}/reset/${resetToken}`;
                transporter.sendMail({
                    to: email,
                    subject: 'Reset NerdStation Password',
                    html: `Please click this email to link to reset your password: <a href="${url}">${url}</a>`,
                });
            },
        );
        user.passwordResetEmailLastSent = Date.now();
        const savedUser = await user.save();
        if (!savedUser) throw Error("Something went wrong saving the user.")

        res.status(200).json({savedUser});

    } catch (e) {
        res.status(400).json({msg: e.message});
    }
});

// @route GET api/auth/user
// @desc    Get user data
// @access  Private

router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) throw Error('User does not exist');
        res.json(user);
    } catch (e) {
        res.status(400).json({msg: e.message});
    }
});

router.get('/confirmation/:token', async (req, res) => {
    try {

        console.log(jwt.verify(req.params.token, EMAIL_SECRET));
        const {user: {_id}, password} = jwt.verify(req.params.token, EMAIL_SECRET);
        const user = await User.findById(_id);
        if (!user) throw Error('User does not exists');
        user.confirmed = true;
        user.password = password;
        const savedUser = await user.save();
        if (!savedUser) throw Error("An error occurred saving the user.")
        res.redirect(`${CONFIRM_PAGE_URL}/confirm/${req.params.token}`)

    } catch (e) {
        res.status(400).json({error: e.message});
    }
})

router.post('/confirmlogin', async (req, res) => {

    try {
        // Simple validation
        const {user: {_id}} = jwt.verify(req.body.token, EMAIL_SECRET);

        // Check for existing user
        const user = await User.findById(_id);
        if (!user) throw Error('User does not exist');
        if (!user.confirmed) throw Error('Please confirm your email to login.')

        const token = jwt.sign({id: user._id}, JWT_SECRET, {expiresIn: "30 days"});
        if (!token) throw Error('Could not sign the token');


        res.status(200).json({
            token,
            user
        });
    } catch (e) {
        res.status(400).json({msg: e.message});
    }
});

router.post('/resetpassword/:token', async (req, res) => {
    try {

        const {user: {_id}} = jwt.verify(req.params.token, EMAIL_SECRET);
        const user = await User.findById(_id);
        if (!user) throw Error('User does not exists');
        const salt = await bcrypt.genSalt(10);
        if (!salt) throw Error('Something went wrong with bcrypt');
        const hash = await bcrypt.hash(req.body.newPassword, salt);
        if (!hash) throw Error('Something wet wrong hashing the password');
        user.confirmed = true;
        user.password = hash;
        await user.save();
        res.status(200).json({user});
    } catch (e) {
        res.status(400).json({error: e.message});
    }

})

router.post('/changepassword', async (req, res) => {
    try {
        const user = await User.findById(req.body.userId)
        if (!user) throw Error('User does not exists');

        const salt = await bcrypt.genSalt(10);

        if (!salt) throw Error('Something went wrong with bcrypt');

        const hash = await bcrypt.hash(req.body.newPassword, salt);

        if (!hash) throw Error('Something wet wrong hashing the password');

        user.password = hash;

        await user.save();
        res.status(200).json({user});
    } catch (e) {
        res.status(400).json({error: e.message});
    }

})


router.post('/set-stripe-id', async (req, res) => {

    try {
        const user = await User.findById(req.body.userId);
        if (!user) throw Error('User does not exist');

        user.stripeId = req.body.stripeId;

        await user.save();
        res.status(200).json({user});
    } catch (e) {
        res.status(400).json({error: e.message});
    }
});


export default router;
