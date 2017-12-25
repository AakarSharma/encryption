var sha256 = require('sha256');
var express = require('express');
var app = express();
var fs=require('fs');
var cryptoXor = require('crypto-xor');
var math=require('mathjs')
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var server_password="password";

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

function hextoString (tmp) {
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
    this.mobile_id="";	
    this.mobile_password="";
    this.sensor_id="";
    this.sensor_password="";
    this.user_id="";
    this.m_user_id="";	
    this.f_mobile="";
    this.x_mobile="";
    this.f_sensor="";
    this.x_sensor="";
}

app.post('/registration_mobile', function (req, res) 
{
    var obj = req.body;
    var m_data_file = fs.readFileSync('./mobile_data.json', "utf-8");
    var m_data=JSON.parse(m_data_file); 
    for(var i=0;i < m_data.length;i++)
    {
        if(m_data[i].m_mobile_id==obj.m_mobile_id)
        break;
    }
    var temp=new database();
    console.log(i);
    //temp.m_mobile_id=m_data[i].m_mobile_id;
    temp.mobile_id=m_data[i].mobile_id;
    temp.mobile_password=m_data[i].mobile_password;
    var uid,f,e,x;    
    var data= fs.readFileSync('./server.data', "utf-8");
    data=JSON.parse(data);
    if((Date.now()/1000)-obj.T<1)
    {
        uid =  cryptoXor.decode(obj.I,temp.mobile_id);
        f=sha256(OR_Hex(obj.m_user_id , stringtoHex(server_password)));
        x=sha256(OR_Hex(obj.m_user_password, stringtoHex(temp.mobile_password)));
        e=cryptoXor.encode(f,x);
    }
    temp.user_id=uid;
    temp.m_user_id=obj.m_user_id;
    temp.f_mobile=f;
    temp.x_mobile=x;
    data.push(temp);
    fs.writeFile('./server.data', JSON.stringify(data) , 'utf-8');
    data_send={
        "e":e,
        "T":Date.now()/1000
    }
    res.send(data_send);
});

app.post('/registration_sensor', function (req, res) 
{
    obj = req.body;
    var temp = new database();
    var s_data_file = fs.readFileSync('./sensor_data.json', "utf-8");
    var s_data=JSON.parse(s_data_file); 
    for(var q=0;q < s_data.length;q++)
    {
        if(s_data[q].m_sensor_id==obj.m_sensor_id)
        break;
    }
    var m_data_file = fs.readFileSync('./mobile_data.json', "utf-8");
    var m_data=JSON.parse(m_data_file); 
    for(var w=0;w < m_data.length;w++)
    {
        if(m_data[w].m_mobile_id==obj.m_mobile_id)
        break;
    }
    var data= fs.readFileSync('./server.data', "utf-8");
    data=JSON.parse(data)  
    for(var i=0;i<data.length;i++)
    {
        if(data[i].mobile_id==m_data[w].mobile_id)
        break;
    }
    temp.mobile_id=data[i].mobile_id;
    temp.mobile_password=data[i].mobile_password;
    temp.f_mobile=data[i].f_mobile;
    temp.x_mobile=data[i].x_mobile;
    temp.user_id=data[i].user_id;
    temp.sensor_id=s_data[q].sensor_id;
    temp.sensor_password=s_data[q].sensor_password;

    if((Date.now()/1000)-obj.T <1)
    {
        var rm= cryptoXor.decode(obj.mn,temp.sensor_password);
        var temp_mp=sha256(OR_Hex(OR_Hex(stringtoHex(temp.sensor_id),stringtoHex(temp.sensor_password)),rm));
        if(temp_mp==obj.mp)
        {
            res.send("error");
        }
        x=sha256(OR_Hex(obj.mp,stringtoHex(temp.sensor_password)));
        f=sha256(OR_Hex(stringtoHex(temp.sensor_id), stringtoHex(server_password)));
        e= cryptoXor.encode(f,x);
    }
    temp.f_sensor=f;
    temp.x_sensor=x;
    data[i]=temp;
    fs.writeFile('./server.data', JSON.stringify(data) , 'utf-8');
    data_send={
        "e":e,
        "T":Date.now()/1000
    }
    res.send(data_send);    
});
app.listen(8088,function(){console.log('Server has started')});