const { Router } = require('express');
const router = Router();
const Game = require('../Models/game');

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    let game = '';
    if (id == 'all'){
        game = await Game.find();
    } else {
        game = await Game.findOne({id: id});
    }
    res.json(game);
});

router.post('/', async (req, res) => {
    const { id, questions, admin, timePerQuestion } = req.body;
    console.log("JAJAJA:", req.body);
    if(id && questions && admin && timePerQuestion){
        const newGame = new Game({id, questions, admin, timePerQuestion});
        await newGame.save();
        res.json({"mensaje" : "Saved Game"});
    } else {
        res.json({"mensaje" : "Acuerdese de rellenar todos los valores"});
    }
});

module.exports = router;