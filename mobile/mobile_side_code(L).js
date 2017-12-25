var fs=require('fs');
var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
function d2h(d) {
    return d.toString(16);
}

function h2d (h) {
    return parseInt(h, 16);
}

function OR_Hex(a, b) {
    var res = "",
    i = a.length,
    j = b.length;
    for(var t=0;t<64-i;t++)
    a='0'+a;
    for(var t=0;t<64-j;t++)
    b='0'+b;
    i = 64,
    j = 64;
    while (i-->0 && j-->0)
    res = (parseInt(a.charAt(i), 16) | parseInt(b.charAt(j), 16)).toString(16) + res;
    return res;
}

function stringtoHex (tmp) {
    var str = '',
    i = 0,
    tmp_len = tmp.length,
    c;    
    for (; i < tmp_len; i += 1) {
        c = tmp.charCodeAt(i);
        str += d2h(c) + '';
    }
    return str;
}
app.post('/registration_sensor', function (req, res) 
{
    var clientHost = "localhost:8088";
    obj = req.body;
    var m_conf = fs.readFileSync('./mobile.config', "utf-8");
    var m_conf=JSON.parse(m_conf);
    var data = fs.readFileSync('./mobile.data', "utf-8");
    var data=JSON.parse(data);
    var data_send;
    if((Date.now()/1000)-obj.T<1)
    {
        var postData={
            "T":Date.now()/100,
            "m_mobile_id":m_conf.m_mobile_id,
            "mn":obj.mn,
            "m_sensor_id":obj.m_sensor_id,
            "mp":obj.mp
        }
        var clientServerOptions = {
            uri: 'http://'+clientHost+''+"/registration_sensor",
            body: JSON.stringify(postData),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        request(clientServerOptions, function (error, response) {
            var obj=JSON.parse(response.body);
            if(Date.now()/1000-obj.T<1)
            {
                data_send={
                    "e":obj.e,
                    "T":Date.now()/1000,
                    "m_user_id":data.m_user_id,
                    "m_mobile_id":m_conf.m_mobile_id
                }
                res.send(data_send);
                
            }
        });
    }
});
app.listen(8080,function(){console.log('Mobile has started')});