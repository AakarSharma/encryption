var sha256 = require('sha256')
var sizeof = require('object-sizeof');
var prompt = require('prompt');
prompt.start();
var str="Aakar";
var hash = sha256(str);
console.log(hash.toString('hex'));

prompt.get(['username', 'email'], function (err, result) {
    // 
    // Log the results. 
    // 
    console.log('Command-line input received:');
    console.log('  username: ' + result.username);
    console.log('  email: ' + result.email);
  });

  var bs = require("binary-search");
  bs([1, 2, 3, 4], 3, function(a, b) { return a - b; }); // => 2
  bs([1, 2, 4, 5], 3, function(a, b) { return a - b; }); // => -3




// app.post('/file', function (req, res) {
//     obj = req.body;
//     fs.writeFile('./myApp/index.js',main(), function (err) {
//       if (err) throw err;
//       console.log('Saved!');
//     });
//    res.send("received");
//    build();
    
//   })
