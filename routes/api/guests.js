import Guest from "../../models/Guest";
import Event from "../../models/Event";
import jwt from "jsonwebtoken";
import router from "./auth";
import auth from "../../middleware/auth";
import config from "../../config";

const {JWT_SECRET} = config;



router.post('/createguest', async (req, res) => {

    try {
        const guest = new Guest();
        const savedGuest = await guest.save();
        if (!savedGuest) throw Error('Something went wrong saving the guest');

        const event = new Event(
            {
                eventName: `Guest Event`,
                user: savedGuest._id,
                game: '(game not entered)',
                format: '(format not entered)',
                startDate: new Date(),
                status: "new",
                numberOfRounds: 0,
                numberOfPlayers: 0,
                settings: {
                    matchmakingAlgorithm: "competitive",
                    format: "swiss",
                    gameFormat: "1v1",
                    gamesToWin: 2,
                    optPodSize: 2,
                    roundTime: {minutes:"45", seconds: "00"},
                },
                playerList: [],
                removedPlayers: [],
                currentRound: {
                    roundNumber: 1,
                    manualDndPods: {
                        players:{},
                        columns: {
                            'column-1': {
                                id: 'column-1',
                                title: 'Pod 1',
                                podNumber: "1",
                                playerIds: []
                            }
                        },
                        benchedList: {
                            id:'bench',
                            playerIds: []
                        },
                        columnOrder: ['column-1']
                    },
                    automaticDndPods: {
                        players:{},
                        columns: {
                            'column-1': {
                                id: 'column-1',
                                title: 'Pod 1',
                                podNumber: "1",
                                playerIds: []
                            }
                        },
                        benchedList: {
                            id:'bench',
                            playerIds: []
                        },
                        columnOrder: ['column-1']
                    },
                    finalizedPairings: {
                        players:{},
                        columns: {
                            'column-1': {
                                id: 'column-1',
                                title: 'Pod 1',
                                podNumber: "1",
                                playerIds: []
                            }
                        },
                        benchedList: {
                            id:'bench',
                            playerIds: []
                        },
                        columnOrder: ['column-1']
                    },
                    pairingsFinalized: false,
                    roundStarted: false
                },
                pastRounds: []
            }
        );
        const savedEvent = await event.save();
        if (!savedEvent) throw Error('Something went wrong saving the event');

        savedGuest.event = savedEvent._id;

        const doubleSavedGuest = await savedGuest.save();
        if (!doubleSavedGuest) throw Error('Something went wrong saving the guest');

        const token = jwt.sign({ _id: doubleSavedGuest._id }, JWT_SECRET, {expiresIn: "1 day"});

        res.status(200).json({
            token,
            guest: {
                _id: savedGuest._id,
                event: savedEvent._id,
            }
        });
    } catch (e) {
        res.status(400).json({error: e.message});
    }
});

router.get('/load', auth, async (req, res) => {

    try {
        const guest = await Guest.findById(req.guest._id);
        if (!guest) throw Error('Guest does not exist');
        res.json(guest);
    } catch (e) {
        res.status(400).json({msg: e.message });
    }
});

export default router;
