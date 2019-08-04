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
app.post('/registration_sensor', function (req, res) 
{
    var clientHost = "localhost:8080";
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
app.post('/login_sensor', function (req, res) 
{       
    obj = req.body;
    var m_conf = fs.readFileSync('./mobile.config', "utf-8");
    var m_conf=JSON.parse(m_conf); 
    var data = fs.readFileSync('./mobile.data', "utf-8");
    var data=JSON.parse(data);
    var xi=sha256(OR_Hex(data.m_user_password,stringtoHex(m_conf.mobile_password)));
    var ei=cryptoXor.encode(data.f_mobile,xi)     
    if(Date.now()/1000-obj.T2<1)
    {
        var Zj=obj.Zj; //going to used below
        var postData={
            "T2":obj.T2,
            "T3":Date.now()/1000,
            "ei":ei,
            "Aj":obj.Aj,
            "m_sensor_id":obj.m_sensor_id,
            "m_mobile_id":m_conf.m_mobile_id
        }
        var clientServerOptions = {
            uri: 'http://'+"localhost:8080"+''+"/login",
            body: JSON.stringify(postData),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        request(clientServerOptions, function (error, response)
        {
                obj1=JSON.parse(response.body);
                if(Date.now()/1000-obj1.T4<1)
                {
                    var temp_Hi=sha256(OR_Hex(OR_Hex(data.f_mobile,stringtoHex(m_conf.mobile_password)),d2h(obj1.T4)));
                    if(temp_Hi==obj1.Hi)
                    {   
                        var T5=Date.now()/1000;
                        var fj=cryptoXor.decode(obj1.Fij,sha256(OR_Hex(data.f_mobile,stringtoHex(m_conf.mobile_password))))
                        var Kj=cryptoXor.encode(Zj,fj)
                        var Ki=""+Math.floor(Math.random()*1000);
                        var Rij=cryptoXor.encode(sha256(OR_Hex(OR_Hex(fj,m_conf.m_mobile_id),d2h(T5))),Ki)
                        var SK=sha256(cryptoXor.encode(Ki,Kj)) //maybe write this in a file for future use 
                        var data_send=
                        {                    
                            "T4":obj1.T4,
                            "T5":T5,
                            "Rij":Rij,
                            "Sj":obj1.Sj
                        }
                        res.send(data_send);
                    }
                }
        });
    }                
});
app.listen(8081,function(){console.log('Mobile has started')});