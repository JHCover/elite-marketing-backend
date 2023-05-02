import { Router } from 'express';
// User Model
import PitchStats from '../../models/PitchStats';

const router = Router();

// @route   GET api/users
// @desc    Get all users
// @access  Private

router.get('/', async (req, res) => {
    try {
        const pitchStats = await PitchStats.find();
        if (!pitchStats) throw Error('No pitch stats exist');
        res.json(pitchStats);
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
