var sha256 = require('sha256');
var fs=require('fs');
var express = require('express');
var app = express();
var cryptoXor = require('crypto-xor');
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

function hexToString (tmp) {
    var arr = tmp.split(' '),
        str = '',
        i = 0,
        arr_len = arr.length,
        c;
 
    for (; i < arr_len; i += 1) {
        c = String.fromCharCode( h2d( arr[i] ) );
        str += c;
    } 
    return str;
}

var database = function()
{  
    this.m_mobile_id="";
    this.m_user_id="";
    this.f_sensor="";
    this.s_r="";
}

function sensor_mobile()
{
    var clientHost = "localhost:8080";
    var s_conf = fs.readFileSync('./sensor.config', "utf-8");
    var s_conf=JSON.parse(s_conf);  
    var data=new database();
    data.s_r=""+Math.floor(Math.random()*1000);
    var mp=sha256(OR_Hex(OR_Hex(stringtoHex(data.s_r),stringtoHex(s_conf.sensor_password)),stringtoHex(s_conf.sensor_id)));
    var postData={
        m_sensor_id:s_conf.m_sensor_id,
        mp:mp,
        T:Date.now()/1000,
        mn:cryptoXor.encode(data.s_r,s_conf.sensor_password)
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
            var x=sha256(OR_Hex(mp,stringtoHex(s_conf.sensor_password)))
            data.f_sensor=cryptoXor.decode(obj.e,x);
            data.m_mobile_id=obj.m_mobile_id;
            data.m_user_id=obj.m_user_id;
            fs.writeFile('./sensor.data', JSON.stringify(data) , 'utf-8');
            return;
        }
    });
}
sensor_mobile();