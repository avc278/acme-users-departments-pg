const express = require('express');
const path = require('path');
const db = require('./db');
const app = express();

app.use(express.json());

app.get('/', (req, res, next) => {
    try {    
        res.sendFile(path.join(__dirname, 'index.html'));
    }
    catch {
        ex => console.log(ex)
    }
});

app.get('/api/users', (req, res, next) => {
    db.findAllUsers()
        .then( users => res.send(users))
        .catch( ex => console.log(ex))
});

app.get('/api/departments', async(req, res, next) => {
    db.findAllDepartments()
        .then( departments => res.send(departments))
        .catch( ex => console.log(ex))
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`));
