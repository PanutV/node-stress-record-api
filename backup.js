const fs = require('fs/promises');
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const db  = require('./dbConnect');
const cors = require('cors');
const mutler = require('multer');
const { check, body , validationResult } = require('express-validator');
 
signupValidation = [
    check('username', 'Name is requied').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
]
 
loginValidation = [
     check('email', 'Please include a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
     check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
 
]



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
  })

app.post('/register', signupValidation, (req, res, next) => {
    let {username} = req.body;
    db.query('SELECT username FROM `patient` WHERE `username` = ?',[username]),
    (err, results) => {
    if (results) {
    return res.status(409).send({
    msg: 'This name is already in use!'})
    } else {
        res.send('ok') }
}});

app.get("/", (req, res) => {
    res.render('pages/index');
  });

// get all patients from GET
app.get('/patients', (req, res) => {
    
    connection.query(
        'SELECT * FROM `patient`',
        function(err, results, fields) {
          res.json(results);
          console.log(results);
        }
      );
});

// Check Patient by id
app.get('/patient', [
    body('user_name','Invalid Name !').custom((value) => {
        return connection.execute(
            'SELECT username FROM `patient` WHERE `username` = ?',[value])
            .then(([rows]) =>{
                if (rows.length > 0 ){
                    return Promise.reject("this name already in use !")
                }
                return true
            })
    })
], (req, res) => {
    const validation_result = validationResult(req);
    const {user_name} = req.body;

    if (validation_result.isEmpty()) {
        connection.execute('SELECT username FROM patient WHERE username = ?',[user_name])
        .then(result => {
            res.send(`Submit success ! , go back to main <a href="/">Home</a>`)
        }).catch(err => {
            if (err) throw err;
        })
    } else {
        let allErrors = validation_result.error.map((error) => {
            return error.msg;
        })
        res.render('index',{
            registerError: allErrors,
            old_data:req.body
        })
    }

})

// Patient Post
app.post('/record', upload.single('user_img') , [
    body('user_name','Invalid Name !').custom((value) => {
        return connection.execute('SELECT username FROM `patient` WHERE `username` = ?',[value])
        .then(([rows]) => {
            if (rows.length > 0 ) {
                return Promise.reject("this name already in use !");
            }
            return true;
        })
    })
], (req, res) => {
    const validation_result = validationResult(req);
    let { user_name, user_stress, user_img } = req.body;

    if (user_img === undefined){
        user_img = 'no image'
    } else {
        let user_img = req.file.buffer.toString('base64');
    };

    if (validation_result.isEmpty()) {
        connection.execute('SELECT username FROM patient WHERE username = ?',[user_name]
        ,function(err,results){
            res.send(`Submit success ! , go back to main <a href="/">Home</a>`)
        }
        )

        // .then(result => {
        //     res.send(`Submit success ! , go back to main <a href="/">Home</a>`)
        // }).catch(err => {
        //     if (err) throw err;
        // })
    } else {
        let allErrors = validation_result.error
        // .map((error) => {
        //     return error.msg;
        // })
        console.log(validation_result)
        res.render('pages/index',{ 
            registerError: allErrors,
            old_data:req.body
        })
    }

})
    // let { user_name, user_stress, user_img } = req.body;

    

    

    // if (!user_name || !user_stress || user_stress > 5 || user_stress < 0 ){
    //     return res.status(400).send("Invalid information!") 
    // } else if (nameCheck == user_name){
    //     return res.status(400).send("Name already in used !") 
    // } else {
    //     connection.query(
    //         'INSERT INTO `patient` (`username`, `stressLevel`, `image`) VALUES (?,?,?)',
    //         [user_name,user_stress,user_img],
    //         function(err, results) {
    //             console.log(err)
    //         }
    //         ).then(res.send('Success!')).catch(err => {if(err) throw err;})
    // };



app.post('/check', (req, res) => {
    // const id = req.params.id
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



    // db.query(
    // `INSERT INTO users (name, email, password) VALUES ('${req.body.name}', ${db.escape(
    // req.body.email
    // )}, ${db.escape(hash)})`,
    // (err, result) => {
    // if (err) {throw err;return res.status(400).send({msg: err});
    // }
    // return res.status(201).send({
    // msg: 'The user has been registerd with us!'});
    // });

 