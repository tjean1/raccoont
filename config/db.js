const mongoose = require('mongoose');

mongoose
    .connect('mongodb://localhost:27017/raccoont', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((err) => console.log('Connexion à MongoDB échouée !', err));
