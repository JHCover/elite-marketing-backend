import {Router} from 'express';
import Event from '../../models/Event'
import User from "../../models/User";

const router = Router();

router.post('/begin', async (req, res) => {

    try {
        const user = await User.findById(req.body.user._id)
        if (!user) throw Error('No user.');
        const indexToUse = user.eventsDetails.findIndex(event => event.event == req.body.eventId);
        user.eventsDetails[indexToUse].status = "started";
        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');

        eventToUpdate.status = "started";
        eventToUpdate.currentRound.roundStarted = true;
        await user.save();
        await eventToUpdate.save();
        res.status(200).json({
            updatedStatus: eventToUpdate.status,
            updatedRoundStarted: eventToUpdate.currentRound.roundStarted,
            updatedEventDetails: user.eventsDetails});
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post('/conclude', async (req, res) => {

    try {
        const user = await User.findById(req.body.user._id)
        if (!user) throw Error('No user.');
        const indexToUse = user.eventsDetails.findIndex((event) => event.event == req.body.eventId);
        user.eventsDetails[indexToUse].status = "concluded";
        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');

        eventToUpdate.status = "concluded";
        eventToUpdate.currentRound.frozen = true;
        eventToUpdate.pastRounds.push(eventToUpdate.currentRound);
        eventToUpdate.playerList = req.body.playerList;
        await user.save();
        await eventToUpdate.save();
        res.status(200).json({
            updatedCurrentRound: eventToUpdate.currentRound,
            updatedStatus: eventToUpdate.status,
            updatedPlayerList: eventToUpdate.playerList,
            updatedPastRounds: eventToUpdate.pastRounds,
            updatedEventsDetails: user.eventsDetails
            });
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post('/next', async (req, res) => {

    try {
        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');
        console.log(eventToUpdate.currentRound)
        eventToUpdate.pastRounds.push(eventToUpdate.currentRound);
        eventToUpdate.currentRound = req.body.newRound;
        eventToUpdate.playerList = req.body.playerList;
        eventToUpdate.nameStrings = req.body.nameStrings;

        await eventToUpdate.save();
        res.status(200).json({
            updatedCurrentRound: eventToUpdate.currentRound,
            updatedPlayerList: eventToUpdate.playerList,
            updatedRemovedPlayers: eventToUpdate.removedPlayers,
            updatedPastRounds : eventToUpdate.pastRounds,
            nameStrings: eventToUpdate.nameStrings,
        });

    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }

})

router.post('/revert', async (req, res) => {

    try {
        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');

        eventToUpdate.currentRound = eventToUpdate.pastRounds[req.body.roundNumber - 1]
        eventToUpdate.pastRounds = eventToUpdate.pastRounds.slice(0, (req.body.roundNumber - 1))
        eventToUpdate.playerList = req.body.playerList;
        eventToUpdate.removedPlayers = req.body.removedPlayers;
        await eventToUpdate.save();

        res.status(200).json(eventToUpdate.currentRound);
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post('/time', async (req, res) => {
    try {
        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');

        eventToUpdate.settings.roundTime = req.body.newRoundTime;

        await eventToUpdate.save();

        res.status(200).json({updatedSettings: eventToUpdate.settings});
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post(`/redopairngs`, async (req, res) => {
    try {

        let eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');

        eventToUpdate.currentRound.roundPairings = req.body.roundPairings;
        eventToUpdate.playerList = req.body.playerList;
        eventToUpdate.nameStrings = req.body.nameStrings;
        await eventToUpdate.save();

        res.status(200).json({
            updatedCurrentRound: eventToUpdate.currentRound,
            updatedPlayerList: eventToUpdate.playerList,
            nameStrings: eventToUpdate.nameStrings,
        });
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post(`/editscores`, async (req, res) => {
    try {

        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');

        eventToUpdate.playerList = req.body.playerList;
        eventToUpdate.pastRounds[req.body.roundNumber - 1].roundPairings = req.body.roundPairings;

        await eventToUpdate.save(function(err){
            if(err){
                console.log(err);
                return;
            }
            res.status(200).json({
                updatedPlayerList: eventToUpdate.playerList,
                round: eventToUpdate.pastRounds[req.body.roundNumber - 1]
            });
        });


    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})


router.post(`/reset`, async (req, res) => {
    try {
        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');
        eventToUpdate.currentRound.roundStarted = false;
        await eventToUpdate.save();

        res.status(200).json({
            roundStarted: eventToUpdate.currentRound.roundStarted
        });
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})
export default router;
