var express = require('express')
var path = require('path')
var app = express()
var bodyParser = require('body-parser')
app.use(bodyParser.json())

var port = process.env.port || 3000

app.use(express.static(__dirname + '/static'))



app.listen(port, () => console.log('Serwer rusza na porcie: 3000'))



var dataBase = require('nedb')
var session = require('express-session')


app.use(session({
    secret: "key",              //secret option required for sessions

    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365   //24h 365 dni
    },


    resave: false,                  //express - session
    saveUninitialized: false,
}))

var dane_bazy = new dataBase({
    filename: './static/baza/baza.db',
    autoload: true
})
require('./static/js/przekierowanie')(app, path, __dirname, dane_bazy)
