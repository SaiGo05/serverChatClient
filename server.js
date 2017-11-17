var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

mongoose.Promise = Promise

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

var dbUrl = 'mongodb://zadmin:pass@ds257495.mlab.com:57495/nodelearning005'

var Message = mongoose.model('Message',{
    name: String,
    message: String
})


app.get('/messages',(req, res) =>{
    Message.find({},(err,messages) => {
        res.send(messages)
    })
    
})

app.post('/messages',async(req, res) =>{

    try {
        var message = new Message(req.body)
        var savedMessage = await message.save()
        
        console.log('saved')
        var censored = await Message.findOne({message: 'badword'})
    
        if(censored)
            await Message.remove({_id: censored.id})
        else
            io.emit('message',req.body)
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(err) 
    } finally {
        console.log('Processed')
    }


    
})



io.on('connection',(socket)=>{
    console.log('user connected')
})

mongoose.connect(dbUrl,{useMongoClient:true},(err)=>{
    console.log('MongoDB error',err)
})

var server = http.listen(3000, () =>{
    console.log("Server is listening on port", server.address().port)
})