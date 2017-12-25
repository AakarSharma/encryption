//var q = require("../hex_operations.js");
var fs=require('fs');
var readlineSync = require('readline-sync')
var sha256 = require('sha256')

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

function registration_sensor()
{   
    var data=[];
    var s_number=readlineSync.question('Enter the number of sensor devices you want register: ');
    for( var i=0;i<s_number;i++)
    {
       data.push(make_sensor_data(i));
    }
    fs.writeFile('./sensor_data.json',JSON.stringify(data),function (err) {if (err) return console.log(err);})
}

function registration_mobile()
{
    var data=[];
    var m_number=readlineSync.question('Enter the number of mobile devices you want register:');
    for( var i=0;i<m_number;i++)
    {
        data.push(make_mobile_data(i));
    } 
    fs.writeFile('./mobile_data.json',JSON.stringify(data),function (err) {if (err) return console.log(err);})
}

function make_mobile_data(i)
{
    var id=readlineSync.question("Enter Mobile Id:");
    var password=readlineSync.question("Enter Password:");
    var mid=sha256(OR_Hex(d2h(Math.floor(Math.random()*1000)),stringtoHex(i)));
    var temp={
        mobile_id:id,
        m_mobile_id:mid,
        mobile_password:password
    }
    return temp; 
}

function make_sensor_data(i)
{
    var id=readlineSync.question('Enter Sensor Id :')
    var password=readlineSync.question('Enter Password:')
    var sid=sha256(OR_Hex(d2h(Math.floor(Math.random()*1000)),stringtoHex(i)));
    var temp={
        sensor_id:id,
        m_sensor_id:sid,
        sensor_password:password
    }
    return temp  
}
registration_mobile();