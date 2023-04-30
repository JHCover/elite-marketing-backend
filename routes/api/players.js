import {Router} from 'express';
import Event from "../../models/Event"

const router = Router();

router.post('/', async (req, res) => {
    try {

        const eventToUpdate = await Event.findById(req.body.eventId)
        if (!eventToUpdate) throw Error("No event.");

        eventToUpdate.playerList.push(req.body.newPlayer);

        const savedEvent = await eventToUpdate.save();
        if (!savedEvent) {
            throw Error("No event.")
        }
        const newestPlayer = savedEvent.playerList[savedEvent.playerList.length - 1];

        res.status(200).json({newestPlayer: newestPlayer, playerList: savedEvent.playerList});
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})


router.post('/remove', async (req, res) => {
    try {

        // let user = await User.findById(req.body.userId);
        //
        // function correctEventIndex(event) {
        //     if (event._id == req.body.eventId) {
        //         return true
        //     }
        // }

        function correctPlayerToRemove(player) {
            if (player._id == req.body.playerToRemoveId) {
                return true
            }
        }

        // const eventsDetailsIndexToUpdate = user.eventsDetails.findIndex(correctEventIndex);
        // const eventToUpdateId = user.eventsDetails[eventsDetailsIndexToUpdate].event

        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error("No event.")

        let playerIndexToRemove = eventToUpdate.playerList.findIndex(correctPlayerToRemove);
        let playerToRemove = eventToUpdate.playerList.pop(playerIndexToRemove);

        eventToUpdate.removedPlayers.push(playerToRemove);
        eventToUpdate.finalizedPairings = req.body.finalizedPairings;
        // eventToUpdate.playerList.splice(playerIndexToRemove, 1)
        await eventToUpdate.save();

        res.status(200).json({
            updatedPlayerList: eventToUpdate.playerList,
            updatedRemovedPlayers: eventToUpdate.removedPlayers,
            updatedFinalizedPairings: eventToUpdate.finalizedPairings
        });
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
});

router.post('/score', async (req, res) => {

    try {
        // let user = await User.findById(req.body.userId);
        //
        // function correctEventIndex(event) {
        //     if (event._id == req.body.eventId) {
        //         return true
        //     }
        // }
        //
        //
        // const eventIndexToUpdate = user.eventsDetails.findIndex(correctEventIndex);
        // const eventId = user.eventsDetails[eventIndexToUpdate].event;

        const eventToUpdate = await Event.findById(req.body.eventId);
        if (!eventToUpdate) throw Error("No event.")
        eventToUpdate.playerList = req.body.playerList;
        eventToUpdate.currentRound.roundPairings = req.body.roundPairings;

        // req.body.updatedPlayers.forEach(updatedPlayer => {
        //     let updatedPlayerId = updatedPlayer._id;
        //     finalizedPairings.players[updatedPlayerId] = updatedPlayer;
        // })

        // req.body.updatedPlayers.forEach(updatedPlayer => {
        //
        //     let updatedPlayerId = updatedPlayer._id;
        //     let playerIndexToUpdate = eventToUpdate.playerList.findIndex(player => player._id == updatedPlayerId);
        //     if (playerIndexToUpdate !== -1) {
        //         eventToUpdate.playerList[playerIndexToUpdate] = updatedPlayer;
        //     } else {
        //         playerIndexToUpdate = eventToUpdate.removedPlayers.findIndex(player => player._id == updatedPlayerId);
        //         eventToUpdate.removedPlayers[playerIndexToUpdate] = updatedPlayer;
        //     }
        // })

        await eventToUpdate.save();

        res.status(200).json({
            updatedPlayerList: eventToUpdate.playerList, updatedRoundPairings: eventToUpdate.currentRound.roundPairings
        });
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post('/podshift', async (req, res) => {
    try {

        const eventToUpdate = await Event.findById(req.body.eventId)
        if (!eventToUpdate) throw Error("No event.");

        eventToUpdate.currentRound.roundPairings = req.body.roundPairings;
        eventToUpdate.playerList = req.body.playerList;
        eventToUpdate.nameStrings = req.body.nameStrings;
        const savedEvent = await eventToUpdate.save();
        if (!savedEvent) {
            throw Error("No event.")
        }

        res.status(200).json({
            updatedRoundPairings: eventToUpdate.currentRound.roundPairings,
            updatedPlayerList : eventToUpdate.playerList,
            nameStrings: eventToUpdate.nameStrings,
        });

    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post('/addbackplayer', async (req, res) => {
    try {

        const eventToUpdate = await Event.findById(req.body.eventId)
        if (!eventToUpdate) throw Error("No event.");

        eventToUpdate.playerList = (req.body.playerList);

        const savedEvent = await eventToUpdate.save();
        if (!savedEvent) {
            throw Error("No event.")
        }

        res.status(200).json({updatedPlayerList: savedEvent.playerList});
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post('/addplayertobench', async (req, res) => {
    try {

        const eventToUpdate = await Event.findById(req.body.eventId)
        if (!eventToUpdate) throw Error("No event.");

        eventToUpdate.playerList = req.body.playerList;
        eventToUpdate.currentRound.roundPairings.benchedList = req.body.benchedList;
        eventToUpdate.nameStrings = req.body.nameStrings;
        const savedEvent = await eventToUpdate.save();
        if (!savedEvent) {
            throw Error("No event.")
        }

        res.status(200).json({updatedPlayerList: savedEvent.playerList, updatedCurrentRound: savedEvent.currentRound, nameStrings: eventToUpdate.nameStrings});
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post('/removefrompods', async (req, res) => {
    try {

        const eventToUpdate = await Event.findById(req.body.eventId)
        if (!eventToUpdate) throw Error("No event.");

        eventToUpdate.playerList = req.body.playerList;
        eventToUpdate.currentRound.roundPairings = req.body.roundPairings;

        const savedEvent = await eventToUpdate.save();
        if (!savedEvent) {
            throw Error("No event.")
        }

        res.status(200).json({updatedPlayerList: savedEvent.playerList, updatedCurrentRound: savedEvent.currentRound});
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})

router.post('/placeplayer', async (req, res) => {
    try {

        const eventToUpdate = await Event.findById(req.body.eventId)
        if (!eventToUpdate) throw Error("No event.");
        eventToUpdate.nameStrings = req.body.nameStrings;
        eventToUpdate.playerList = req.body.playerList;
        eventToUpdate.currentRound.roundPairings = req.body.roundPairings;

        const savedEvent = await eventToUpdate.save();
        if (!savedEvent) {
            throw Error("No event.")
        }

        res.status(200).json({
            updatedPlayerList: savedEvent.playerList,
            updatedCurrentRound: savedEvent.currentRound,
            nameStrings : eventToUpdate.nameStrings,

        });
    } catch (e) {
        res.status(400).json({msg: e.message, success: false});
    }
})



export default router;
