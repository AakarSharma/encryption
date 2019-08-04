export function d2h(d) {
    return d.toString(16);
}

export function h2d (h) {
    return parseInt(h, 16);
}
export function OR_Hex(a, b) {
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

export function stringtoHex (tmp) {
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
module.export = "Q";