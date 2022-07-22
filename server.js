const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const mutler = require('multer');
const { check , body , validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = mutler({Storage:mutler.memoryStorage()});

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'stress-patient'
  });

// app.post('/register', (req, res, next) => {
//     let {username} = req.body;
//     db.query('SELECT username FROM `patient` WHERE `username` = ?',[username]),
//     (err, results) => {
//     if (results) {
//     return res.status(409).send({
//     msg: 'This name is already in use!'})
//     } else {
//         res.send('ok') }
// }});

// Homepage
app.get("/", (req, res) => {
    res.render('pages/index');
  });

// get all patients 
app.get('/patients', (req, res) => {
    
    connection.query(
        'SELECT * FROM `patient`',
        function(err, results, fields) {
          res.json(results);
          console.log(results);
        }
      );
});

// Check Patient by name
app.get('/patient', (req, res) => {
    let { user_name } = req.body;
    connection.execute('SELECT * FROM patient WHERE username = ?',[user_name],
        function(err,results){
            res.send(results)
    }
    )
})

// Patient Post
app.post('/record', upload.single('user_img') , (req, res) => {
    const validation_result = validationResult(req);

    let { user_name, user_stress } = req.body;
    

    if (!req.file){
        user_img = 'no image'
        console.log('nono')

    } 
    else  {

        user_img = req.file.buffer.toString('base64')
        console.log('yesyes')
    }

    if (!user_name || !user_stress || user_stress > 5 || user_stress < 0 ){
        return res.status(400).send("Invalid information!");
    } else {
        connection.query(
            'INSERT INTO `patient` (`username`, `stressLevel`, `image`) VALUES (?,?,?)',
            [user_name,user_stress,user_img],
            function(err, results) {
                console.log(err)
                res.send(`Submit success ! , go back to main <a href="/">Home</a>`)
            })
    };
})

// user check their record by name
app.post('/check', (req, res) => {
    const {name} = req.body;
    
    connection.query(
        'SELECT * FROM `patient` WHERE `username` = ?',
        [name],
        function(err, results) {
            console.log('Current Error : ',err)

            res.render('pages/check', {
                results:results[0]
            })
        }
      )
});

// Deploy on port 
app.listen(PORT, () => {
    console.log(`App is running on Port ${PORT}...`)
}) 
 