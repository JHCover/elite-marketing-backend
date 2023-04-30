import {Router} from 'express';
import Event from "../../models/Event";


const router = Router();

router.post('/dndaddplayer', async (req, res) => {

    try {
        const eventToUpdate = await Event.findById(req.body.eventId)
        if (!eventToUpdate) throw Error('No event');
        eventToUpdate.currentRound.roundPairings = req.body.roundPairings;
        eventToUpdate.playerList = req.body.playerList;
        const savedEvent = await eventToUpdate.save();

        await eventToUpdate.save(function (err) {
            if (err) {
                console.log(err);
                return;
            }
            res.status(200).json({
                updatedCurrentRound: savedEvent.currentRound,
                updatedPlayerList: savedEvent.playerList,
            });
        });
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post('/dndremoveplayer', async (req, res) => {
    try {

        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');

        eventToUpdate.playerList = req.body.playerList;
        eventToUpdate.currentRound.roundPairings = req.body.roundPairings;
        await eventToUpdate.save();

        res.status(200).json({
            updatedPlayerList: eventToUpdate.playerList,
            updatedCurrentRound: eventToUpdate.currentRound,
        });
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post('/dnd', async (req, res) => {
    try {
        let eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');

        eventToUpdate.playerList = req.body.playerList;
        eventToUpdate.currentRound.roundPairings = req.body.podsCopy;
        eventToUpdate.nameStrings = req.body.nameStrings;
        let draggedPlayer;
        let droppedPlayer;
        if (req.body.draggedPlayer) draggedPlayer = req.body.draggedPlayer;
        if (req.body.droppedPlayer) droppedPlayer = req.body.droppedPlayer;


        const savedEvent = await eventToUpdate.save();
        if (!savedEvent) throw Error('An error occurred saving the event.');
        const roundPairings = savedEvent.currentRound.roundPairings;
        const columns = savedEvent.currentRound.roundPairings.columns;
        const benchedList = savedEvent.currentRound.roundPairings.benchedList;
        const playerList = savedEvent.playerList;

        if (!savedEvent) throw Error('An error occurred saving the event.');
        res.status(200).json({
            draggedPlayer,
            droppedPlayer,
            playerList,
            roundPairings,
            columns,
            benchedList,
        });
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post('/deletepod', async (req, res) => {
    try {

        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');

        eventToUpdate.currentRound.roundPairings = req.body.roundPairings;
        eventToUpdate.nameStrings = req.body.nameStrings;
        await eventToUpdate.save();

        res.status(200).json({updatedRoundPairings: eventToUpdate.currentRound.roundPairings, nameStrings : eventToUpdate.nameStrings});
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post('/addpod', async (req, res) => {
    try {

        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');

        eventToUpdate.currentRound.roundPairings = req.body.roundPairings;
        eventToUpdate.nameStrings = req.body.nameStrings;
        await eventToUpdate.save();

        res.status(200).json({updatedCurrentRound: eventToUpdate.currentRound, nameStrings: eventToUpdate.nameStrings});
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post('/changepodsize', async (req, res) => {

    try {
        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');

        eventToUpdate.currentRound.roundPairings = req.body.roundPairings;
        eventToUpdate.playerList = req.body.playerList;
        await eventToUpdate.save();

        const savedEvent = await eventToUpdate.save();
        if (!savedEvent) throw Error('An error occurred saving the event.');


        res.status(200).json({
            roundPairings: savedEvent.currentRound.roundPairings,
            playerList: savedEvent.playerList,
        });
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})


router.post('/changepodsize', async (req, res) => {
    try {

        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error('No event');

        eventToUpdate.currentRound.roundPairings = req.body.roundPairings;
        eventToUpdate.playerList = req.body.playerList;

        await eventToUpdate.save();

        res.status(200).json({currentRound: eventToUpdate.currentRound, playerList: eventToUpdate.playerList});
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})


export default router;
