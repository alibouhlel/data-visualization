//require everything
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var countries = require("i18n-iso-countries");
var country = require('countryjs');
var validator = require('validator');
var kafka = require('kafka-node');

//importing the client
var HighLevelConsumer = kafka.HighLevelConsumer;
var Client = kafka.Client;
//creating new client
var client = new Client('localhost:2181');
//consuming kafka topic messages
consumer = new HighLevelConsumer(
        client,
        [
            { topic: 'test' }, { topic: 'test' }
        ],
        {
            groupId: 'my-group'
        }
    );

//Basic NodeJS stuff
app.get('/', function(req, res) {
   res.sendFile(__dirname+'/index.html');
});

io.sockets.on('connection', function(socket){
  console.log("user connected");
    //send data to client
  consumer.on('message', function(message) {

 //get the ISO code of the country for exemple FRANCE => FR
  var countryCode= countries.getAlpha2Code(message.value, 'en');
  if(validator.isISO31661Alpha2(String(countryCode)))
  {
    //get the latitude and longitute of the country output:
     // [lat,lng]
     var latlng = country.latlng(countryCode).toString();
     //split the latlng object separator is ,
     latlngArray = latlng.split(',');
     //latlngArray contains the latitude in the first case and
     //the longiture and the second one
     var latitude = latlngArray[0];
     var longitude = latlngArray[1];
     var countryy = message.value
     //create a JSON object
     var countryJSON = {
             "country": countryy,
             "latitude": latitude,
             "longitude": longitude
             }
     var obj=JSON.stringify(countryJSON);
     console.log(obj);
     socket.emit('country', obj);
   }
  });
  consumer.on('error', function(err) {
    console.log('error', err);
  });

  process.on('SIGINT', function() {
    consumer.close(true, function() {
      process.exit();
    });
   });
  });

  http.listen(3000, function() {
     console.log('listening on *:3000');
  });

