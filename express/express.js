var express = require('express');
var ejs = require('ejs');
var app = express();
 
app.get('/', function (req, res) {
   res.render('home.html');
})

app.use('/static', express.static('public'))
app.set('views','./public/views')
app.set('view engine','html')
app.engine('html',ejs.renderFile) 
var server = app.listen(8081, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})