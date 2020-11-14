import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Pusher from 'pusher';
import dbschema from './dbschema.js';

//app config
const app = express();
const port = process.env.PORT || 8000;

//pusher.com backend
const pusher = new Pusher({
    appId: "1103822",
    key: "8beb83d45ac75bb69e04",
    secret: "9ac61635e0d7c7ad691e",
    cluster: "us2",
    useTLS: true
});


//middleware
app.use(express.json())
app.use(cors())

//db config
const connectionUrl = "mongodb+srv://admin:cD0xgehn162wED2y@cluster0.pr04c.mongodb.net/instadb?retryWrites=true&w=majority";
mongoose.connect(connectionUrl,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.once('open', () => {
    console.log("Db is open and connection")
    //listen to changes in "posts" schema in instadb in mongoose
    const changeStream = mongoose.connection.collection('posts').watch()
    changeStream.on('change', (change) => {
        console.log("change triggred on pusher..")
        //console.log(change)
        console.log("End of change")

        if(change.operationType === 'insert'){
            console.log("triggring Pusher **Img*** UPLOAD***")
            const postDetails = change.fullDocument;
            pusher.trigger('posts', 'inserted', {
                //upload in realtime
                user: postDetails.user,
                caption: postDetails.caption,
                image: postDetails.image,
                comments: postDetails.comments
            })
        }else if(change.operationType === 'update'){
            console.log("Update operation type")
            pusher.trigger('messages', 'newComment', {
                'change': change
            })
        }
        else{
            console.log("Error triggering Pusher - Unknown trigger from pusher")
        }
    })
})

//api routes
app.get('/', (req, res) => res.status(200).send('Hello world'));

//upload image is stored in mongo db
app.post('/upload',(req, res) => {
    const body = req.body
    dbschema.create(body, (err, data) => {
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

///////
app.post('/new/comment', (req, res) => {
    const id = req.query.id;
    const newMsg = req.body
    console.log("new messsa", req.body)
    dbschema.update(
        {_id: id}, 
        {$push: {comments: newMsg}},
        (err, data) => {
            if(err){
                res.status(500).send(err)
            }else{
                res.status(201).send(data)
            }
        }
    )
})


//get data from db to render image data on app
app.get('/sync', (req, res) => {
    dbschema.find((err, data) => {
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send(data);
        }
    })
})

app.get('/get/comments', (req, res) => {
    const id = req.query.id
    dbschema.find({_id: id}, (err, data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})
//listen
app.listen(port, () => console.log(`listening from localhost: port ${port}`));
