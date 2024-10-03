var express = require('express'),
	app = express(),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

const port = 8000;
const https = require('https');

var key = fs.readFileSync(__dirname + '/newcert/key.pem');
var cert = fs.readFileSync(__dirname + '/newcert/cert.pem');
var options = {
  	key: key,
  	cert: cert,
	//requestCert: false,
    //rejectUnauthorized: false,
};

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'wadi',
  password : '74v0jckO',
  database : 'prodname'
});

connection.connect();

app.use(express.static(__dirname));
// Chargement de la page index.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


var server = https.createServer(options, app);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(arr) {
        id = arr.id;
        query = 'SELECT * from utilisateur_has_question';
        console.log(arr);
        username = ent.encode(arr.username);
        socket.id = id;
        socket.pseudo = username;
        //console.log(username + ' is happening on port 8080');
        connection.query(query, function(err, rows, fields) {
          if (!err) {
                socket.broadcast.emit('nouveau_client', rows);
            }
          else
            console.log('Error while performing Query id : ' + query);
        });
    });



     mes = "";
    socket.on('sendRfid', function (message) {
        mes = ent.encode(message);
        //console.log(mes);
        //socket.broadcast.emit('sendRfid', message);
        //io.to(socket.id).emit('sendRfid', mes);
        socket.broadcast.emit('sendRfid', mes);
    });

    socket.on('getAdmin', function(arr) {
        id = arr.id;//ent.encode(arr.id);
        query = 'SELECT * from utilisateur_has_question';
        //console.log(arr);
        username = ent.encode(arr.username);
        socket.id = id;
        socket.pseudo = username;
        //console.log(username + ' is happening on port 8080');
        connection.query(query, function(err, rows, fields) {
          if (!err) {
                socket.broadcast.emit('getAdmin', rows);
            }
          else
            console.log('Error while performing Query id : ' + query);
        });
    });


    socket.on('message', function (data) {
        uid = ent.encode(data.id);
        message = ent.encode(data.message);
        date_text = ent.encode(data.date_text);

        var post  = {user_id: socket.pseudo, question: message, date_text: date_text};
        var query = connection.query('INSERT INTO utilisateur_has_question SET ?', post, function(err, result) {
          if (!err)
          {
            socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message, id : uid, date_text: date_text});
            socket.broadcast.emit('addLine', {pseudo: socket.pseudo, message: message, id : uid, qid: result.insertId});
          }
        });
     }); 


     socket.on('testother', function (message) {
        message = ent.encode(message);
        socket.broadcast.emit('question', message);
    });


     socket.on('sendAnsw', function (data) {
        qid = ent.encode(data.id);
        //console.log("test = " + message);
        var updt  = {answer: data.message, id: data.id};
        var rqt = 'UPDATE utilisateur_has_question SET answer = "' + data.message + '" WHERE id = ' + data.id;
        var query = connection.query(rqt, function(err, result) {
          if (!err)
          {
            socket.broadcast.emit('refresh');
            //console.log('insert reussi');
          }
          else
            console.log('error update on query ' + rqt);
        });
        //socket.broadcast.emit('question', message);
    });


     
});

server.listen(port, () => {
  console.log("server starting on port : " + port)
});

//connection.end();
