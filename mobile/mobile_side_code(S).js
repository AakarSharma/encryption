//var q = require("../hex_operations.js");
var sha256 = require('sha256');
var fs=require('fs');
var readlineSync = require('readline-sync')
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

function database()
{
    this.m_user_id="";
    this.m_user_password="";
    this.m_r="";
    this.f_mobile='';  
}

function register_mobile()
{
    var clientHost = "localhost:8080";    
    var uid = readlineSync.question('Enter the your username: ');
    var password = readlineSync.question('Enter the your password: ');
    var m_conf = fs.readFileSync('./mobile.config', "utf-8");
    var m_conf=JSON.parse(m_conf);     
    var data=new database();
    var postData;
    data.m_r=Math.floor(Math.random()*1000);
    data.m_user_id=sha256(OR_Hex(d2h(data.m_r),stringtoHex(uid)));
    data.m_user_password=sha256(OR_Hex(d2h(data.m_r),stringtoHex(password)));
    postData={
        I: cryptoXor.encode(uid,m_conf.mobile_id),
        m_user_id:data.m_user_id,
        m_user_password:data.m_user_password,
        T:Date.now(),
        m_mobile_id:m_conf.m_mobile_id
    }
    
    var clientServerOptions = {
        uri: 'http://'+clientHost+''+"/registration_mobile",
        body: JSON.stringify(postData),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(clientServerOptions, function (error, response) {
        var obj=JSON.parse(response.body);
        if((Date.now()/1000)-obj.T<1)
        {
            var x=sha256(OR_Hex(data.m_user_password,stringtoHex(m_conf.mobile_password)));
            data.f_mobile= cryptoXor.decode(obj.e,x);
            fs.writeFile('./mobile.data',JSON.stringify(data) , 'utf-8');
        }
    });
}
function login(){  
    var m_conf = fs.readFileSync('./mobile.config', "utf-8");
    var m_conf=JSON.parse(m_conf); 
    var data = fs.readFileSync('./mobile.data', "utf-8");
    var data=JSON.parse(data); 
    var temp_user_id=readlineSync.question('Enter your username : ');
    var temp_user_password=readlineSync.question('Enter your password : ');
    var temp_m_user_id=sha256(OR_Hex(d2h(data.m_r),stringtoHex(temp_user_id)));
    var temp_m_user_password=sha256(OR_Hex(d2h(data.m_r),stringtoHex(temp_user_password)));     
    if(temp_m_user_id==data.m_user_id)
    {       
        var temp_xi=sha256(OR_Hex(temp_m_user_password,stringtoHex(m_conf.mobile_password)));
        var xi=sha256(OR_Hex(data.m_user_password,stringtoHex(m_conf.mobile_password)));
        if(temp_xi==xi)
        {   
            var send_auth_to_sensor =
            {
                "T1":Date.now()/1000,
                "m_mobile_id":m_conf.m_mobile_id,
                "m_user_id":data.m_user_id
            }        
            var sensorMobileOptions = {
                uri: 'http://'+"localhost:8082"+''+"/login_sensor_side",
                body: JSON.stringify(send_auth_to_sensor),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            request(sensorMobileOptions, function (error, response) 
            {                 
                obj1=response.body;
                console.log(obj1)
            })
        } 
    }                        
}
login();