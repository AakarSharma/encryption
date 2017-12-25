//var q = require("../hex_operations.js");
var fs=require('fs');
var sha256 = require('sha256');
var cryptoXor = require('crypto-xor');
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
app.post('/login_sensor_side',function(req, res)
{    
    obj = req.body;
    var s_conf = fs.readFileSync('./sensor.config', "utf-8");
    var s_conf=JSON.parse(s_conf);
    var data = fs.readFileSync('./sensor.data', "utf-8");
    var data=JSON.parse(data);
    var T2=(Date.now()/1000)
    var xj,mp,Kj,SK;
    if(T2-obj.T1<1)
    {   
        mp=sha256(OR_Hex(OR_Hex(stringtoHex(data.s_r),stringtoHex(s_conf.sensor_password)),stringtoHex(s_conf.sensor_id)));
        xj=sha256(OR_Hex(mp,stringtoHex(s_conf.sensor_password)));
        var Aj=cryptoXor.encode(sha256(OR_Hex(OR_Hex(stringtoHex(s_conf.sensor_password),obj.m_user_id),d2h(T2))),xj)       
        Kj=""+Math.floor(Math.random()*1000);
        var Zj=cryptoXor.encode(Kj,data.f_sensor)
        postData={
            "m_sensor_id":s_conf.m_sensor_id,
            "Aj":Aj,
            "Zj":Zj,
            "T2":T2
        }
    }
    var clientHost = "localhost:8081"; 
    var mobileSensorOptions = {
        uri: 'http://'+clientHost+''+"/login_sensor",
        body: JSON.stringify(postData),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(mobileSensorOptions, function (error, response) 
    {
        var response1=JSON.parse(response.body);
        
        if(Date.now()/1000-response1.T5<1)
        {   
            var temp_Sj=sha256(OR_Hex(OR_Hex(stringtoHex(s_conf.sensor_password),xj),d2h(response1.T4)))
            if(temp_Sj==response1.Sj)
            {
                var Ki=cryptoXor.decode(sha256(OR_Hex(OR_Hex(data.f_sensor,obj.m_mobile_id),d2h(response1.T5))),response1.Rij)
                SK=sha256(cryptoXor.encode(Ki,Kj))
                res.send('Session is logined')
            }
        }
    });    
})
app.listen(8082,function(){console.log('Sensor has started')});