import {Router} from 'express';
import auth from '../../middleware/auth';
// Event Model
import Event from '../../models/Event';
import User from '../../models/User';
import getPlayerNamesArrays from "../../../client/src/utilityFunctions/getPlayerNamesArrays";
import getBenchedPlayerNamesString from "../../../client/src/utilityFunctions/getBenchedPlayerNamesString";

const router = Router();

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        const events = user.events;
        if (!events) throw Error('No events');

        res.status(200).json(events);
    } catch (e) {
        res.status(400).json({msg: e.message});
    }
});

router.post('/', async (req, res) => {

    try {
        const newEvent = new Event({
            status: req.body.event.status,
            pastRounds: req.body.event.pastRounds,
            currentRound: req.body.event.currentRound,
            settings: req.body.event.settings,
            playerList: req.body.event.playerList,
            eventName: req.body.event.eventName,
            nameStrings: req.body.event.nameStrings
        });

        const savedEvent = await newEvent.save();

        const eventDetails = {
            eventName: req.body.event.eventName,
            game: req.body.event.settings.game,
            eventFormat: req.body.event.settings.eventFormat,
            gameFormat: req.body.event.settings.gameFormat,
            startDate: req.body.event.startDate,
            status: req.body.event.status,
            numberOfRounds: req.body.event.settings.numberOfRounds,
            numberOfPlayers: req.body.event.numberOfPlayers,
            event: savedEvent._id
        }
        const user = await User.findById(req.body.userId)
        await user.eventsDetails.push(eventDetails)

        await user.save();

        if (!user) throw Error('Something went wrong saving the event');
        res.status(200).json(user);
    } catch (e) {
        res.status(400).json({msg: e.message});
    }
});

router.delete('/:id', auth, async (req, res) => {

    try {
        const user = await User.findById(req.user.id)
        if (!user) throw Error('No user.');
        const indexToUse = user.eventsDetails.findIndex((event) => event._id == req.params.id);
        user.eventsDetails.splice(indexToUse, 1);
        const event = await Event.findById(req.params.id);
        if (!event) throw Error('No event.');
        let removedEvent = await event.remove();
        if (!removedEvent) throw Error('Something went wrong while trying to delete the event');
        await user.save();
        res.status(200).json(user);
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
});

router.post('/update', async (req, res) => {
    try {
        const user = await User.findById(req.body.user._id);
        const indexToUpdate = user.eventsDetails.findIndex((eventDetails) => eventDetails.event == req.body.eventDetails.event);

        user.eventsDetails[indexToUpdate] = req.body.eventDetails;
        await user.save();
        if (!user) throw Error('No user');
        res.status(200).json(user);
    } catch (e) {
        res.status(400).json({msg: e.message});
    }
});

router.post('/settings', async (req, res) => {
    try {

        // const user = await User.findById(req.body.userId);
        // const indexToUpdate = user.eventsDetails.findIndex((event) => event._id == req.body.eventId);
        // const eventId = user.eventsDetails[indexToUpdate].event;

        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error("No event.")
        eventToUpdate.settings = req.body.updatedSettings;

        await eventToUpdate.save();

        res.status(200).json({updatedSettings: eventToUpdate.settings});
    } catch (e) {
        res.status(400).json({msg: e.message});
    }

});

router.post('/load', async (req, res) => {
    try {
        const event = await Event.findById(req.body.eventId);
        if (!event) throw Error("No event.")
        let activeTab;
        if (event.status !== "concluded") activeTab = event.currentRound.roundNumber
        else activeTab = 0;
        res.status(200).json({
            playerList: event.playerList,
            removedPlayers: event.removedPlayers,
            pastRounds: event.pastRounds,
            currentRound: event.currentRound,
            settings: event.settings,
            eventName: event.eventName,
            status: event.status,
            activeTab,
            nameStrings : event.nameStrings,
        });


    } catch (e) {
        res.status(400).json({msg: e.message});
    }
})

router.get('/roundtimebyeventid/:eventId', async (req, res) => {

    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) throw Error("No event.")

        res.status(200).json({
            roundTime: event.settings.roundTime,
            eventName: event.eventName,
            roundNumber: event.currentRound.roundNumber
        });

    } catch (e) {
        res.status(400).json({msg: e.message});
    }
})

router.get('/pairingsbyeventid/:eventId', async (req, res) => {

    try {
        const event = await Event.findById(req.params.eventId);
        console.log("step 1");
        if (!event) throw Error("No event.")
        const roundPairings = event.currentRound.roundPairings;
        const playerList = event.playerList;
        console.log("step 2");
        // console.log(roundPairings)
        let playerNamesArrays = getPlayerNamesArrays(roundPairings, playerList)
        console.log("step 3");
        let benchedPlayerNamesString = getBenchedPlayerNamesString(roundPairings, playerList)
        console.log("step 4");


        res.status(200).json({
            eventName: event.eventName,
            roundNumber: event.currentRound.roundNumber,
            playerNamesArrays: playerNamesArrays,
            benchedNamesString: benchedPlayerNamesString,
        });

    } catch (e) {
        res.status(400).json({msg: e.message});
    }
})

router.get('/playerlistbyeventid/:eventId', async (req, res) => {

    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) throw Error("No event.")

        res.status(200).json({
            eventName: event.eventName,
            roundNumber: event.currentRound.roundNumber,
            playerList: event.playerList
        });

    } catch (e) {
        res.status(400).json({msg: e.message});
    }
})

router.post('/namestrings', async (req, res) => {
    try {
        const event = await Event.findById(req.body.eventId);
        if (!event) throw Error("No event.")
        event.nameStrings = req.body.nameStrings;

        res.status(200).json({
            nameStrings: event.nameStrings
        });

    } catch (e) {
        res.status(400).json({msg: e.message});
    }
})


export default router;
