<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Chat Ima !</title>
        <link href="css/style.css" rel="stylesheet" rel="stylesheet" />
        <style>
            #zone_chat strong {
                color: white;
                background-color: black;
                padding: 2px;
            }

            .quest {
                text-decoration: none;
            }
        </style>
    </head>
 
    <body>
    <input type="text" id="varr" value=<?php echo $_GET['test']; ?> >
    <input type="text" id="varr2">

        <script src="http://code.jquery.com/jquery-3.1.1.min.js"></script>
        <script src="/socket.io/socket.io.js"></script>
        <script>

            // Connexion à socket.io
            var socket = io.connect('http://ns3036238.ip-164-132-160.eu:8080');

            var val = getVal();
            socket.emit('sendRfid', val);

             socket.on('sendRfid', function(rfid){

                setVal(rfid, val);
            });

            function setVal(rfid, val)
            {
                console.log(rfid);
                if (rfid == val)
                    $('#varr2').val(rfid);
            }

            function getVal()
            {
                return ($('#varr').val());
                
            }
        </script>
    </body>
</html>