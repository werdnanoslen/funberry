var express = require('express');
var app = express();
var server = app.listen(8000);
var io = require('socket.io')(server);
var fs = require('fs');
var cv = require('opencv');
var ReadWriteLock = require('rwlock');
var lock = new ReadWriteLock();

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
    res.sendFile('index.html');
    res.sendFile('phaser.min.js');
    res.sendFile('balloon.png');
});


var isDetecting = false;

// camera properties
var camWidth = 160;
var camHeight = 120;
var camFps = 30;
var camInterval = 1000 / camFps;

// face detection properties
var rectColor = [0, 255, 0];
var rectThickness = 1;

// initialize camera
var camera = new cv.VideoCapture(0);
camera.setWidth(camWidth);
camera.setHeight(camHeight);

io.on('connection', function(socket) {
    console.log("user connected to socket");

    socket.on('messageFromClientToServer', function(data) {
        console.log(data);
    });

    socket.on('disconnect', function() {
        console.log("user disconnected from socket");
    });

    setInterval(function() {
        if (!isDetecting) {
            isDetecting = true;
            camera.read(function(err, im) {
                if (err) throw err;
                lock.writeLock(function (release) {
                    //im.detectObject('./node_modules/opencv/data/haarcascade_frontalface_alt2.xml', { // slower, more accurate
                    im.detectObject('/usr/local/share/OpenCV/lbpcascades/lbpcascade_frontalface.xml', { // faster, less accurate
                        scale: 1.2,
                        minNeighbors: 1,
                        minSize: (20, 20),
                        maxSize: (100, 100),
                        haarFlags: 0
                    }, function(err, faces) {
                        if (err) throw err;
                        for (var i = 0; i < faces.length; i++) {
                            face = faces[i];
                            im.rectangle([face.x, face.y], [face.width, face.height], rectColor, rectThickness);
                            console.log("Found a face at %d,%d with dimensions %d,%d", face.x, face.y, face.width, face.height);
                            if (i == 0) {
                                socket.emit('center0', [face.x, face.y]);
                            }
                        }
                        release();
                        //socket.emit('frame', { buffer: im.toBuffer() });
                    });
                });
            });
            console.log("next interval");
            isDetecting = false;
        }
    }, camInterval);
});
