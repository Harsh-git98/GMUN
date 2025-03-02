if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express= require('express')
const app= express()
const path= require('path')
const mongoose = require('mongoose')
const session= require('express-session');
const flash= require('express-flash');
const Registration= require('./models/registrationSchema.js')
const multer= require('multer')
const {storage} = require('./cloudinary/cloudinary.js')
const upload= multer({storage})
const MongoDBStore= require("connect-mongo");
// const dbUrl= 'mongodb://localhost:27017/gmun'
const dbUrl= process.env.DB_URL;
const secret= process.env.SECRET || 'thisshouldbeabettersecret'

app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({extended: true}))

app.set('view engine', 'ejs')

mongoose.connect(dbUrl);
const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", ()=>{
    console.log("Database Connected");
});

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24*60*60 //time is in seconds
});

store.on('error', function(err){
    console.log("Error!", err);
})

const sessionConfig= {
    store,
    name: 'GMUN_IIEST_Shibpur',
    httpOnly: true,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + (1000*60*60*24*7),
        maxAge: (1000*60*60*24*7)
    }
}

app.use(session(sessionConfig));
app.use(flash());


app.use((req, res, next)=>{
    res.locals.success= req.flash('success');
    res.locals.error= req.flash('error');
    next();
});

app.get('/', (req, res)=>{
    res.render('templates/home.ejs');
})

app.get('/register', (req, res)=>{
    // const event= req.params.event;
    // console.log(eventname)
    res.render('templates/form.ejs')
})

app.post('/register', upload.array('image'), async(req, res)=>{
    // res.send(req.body)
    try{
        const {name, phone, whatsapp, email, mun_attended, country_pref}=req.body;
        const newReg= new Registration({name, phone, whatsapp, email, mun_attended, country_pref});
        // return res.send(req.files)
        newReg.image =req.files.map(f=>({url:f.path, filename: f.filename}));
        // return res.send(newReg)
        await newReg.save()
        req.flash('success', "Regitration Successful")
        res.redirect('/')
    }
    catch(e){
        req.flash('error', "There was an error occured while making your registration")
        res.redirect('/')
    }
})

app.listen(8080, ()=>{
    console.log('Server started successfully on port 8080')
})

/**
 * about debsoc
 *
 * about GMUN
 * about UNHRC
 * UNSC
 * LOK SABHA
 * International press
 * specail comittee
 *
 * something else coming soon
 *
 *
 *
 */

/**
 * name
 * email
 * college
 * phone number
 * whatsapp number
 * payment ss
 * no. of mun attended
 * country preference
 */