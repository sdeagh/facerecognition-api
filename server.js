const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');
const register = require('./controllers/register');
const signin = require('./controllers/signin')

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true
    }
})

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('working...')
})

app.post('/signin', (req, res) => {signin.handleSignin(req, res, db, bcrypt)})

app.post('/register', (req, res) => {register.handleRegister(req, res, db, bcrypt)})

app.get('/profile/:id', (req, res) => {
    const  { id } = req.params;
    db.select('*').from('users').where('id', id)
        .then(user => {
            if (user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('User not found')
            }
        })
        .catch(err => res.status(400).json("Error retrieving user"))
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users')
        .where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0])
        })
        .catch(err => res.status(400).json("Unable to get entries"))
    
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`app is running on port ${process.env.PORT}`)
})