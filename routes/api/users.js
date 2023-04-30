import { Router } from 'express';
// User Model
import User from '../../models/User';
import Event from '../../models/Event';

const router = Router();

// @route   GET api/users
// @desc    Get all users
// @access  Private

router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        if (!users) throw Error('No users exist');
        res.json(users);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});


// @route POST api/events
// @desc Create An Event
// @access Private
router.post('/events/:id', async (req, res) => {
    const newEvent = new Event({
        name: req.body.name,
        status: req.body.status
    });
    try{
        const user = await User.findById(req.params.id)
        user.events.push(newEvent);
        await user.save();
        res.status(200).json(user)
    }
    catch (err) {
        res.status(400).json({ msg: e.message });
    }
});

export default router;