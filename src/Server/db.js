const mongoose  = require('mongoose');

mongoose.connect('mongodb+srv://admin:Piano**Computador**Botella**Agua123@cluster0.03bcw.mongodb.net/who-wants-to-be?retryWrites=true&w=majority', {
    useNewUrlParser: true
})
    .then(db => console.log('Conectado a la base de datos'))
    .catch(error => console.error(error));