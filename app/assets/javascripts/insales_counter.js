var server_path = 'http://counter.insales.ru';

var referrer = (window.decodeURI)?window.decodeURI(document.referrer):document.referrer;
var resource = (window.decodeURI)?window.decodeURI(document.URL):document.URL;

var uniq  = 0;
var visit = 0;

function readCookie(cookieName) {
    var theCookie=";"+document.cookie;
    cookieName = "; " + cookieName;
    var ind=theCookie.indexOf(cookieName);
    if (ind==-1 || cookieName=="") return false;
    var ind1=theCookie.indexOf(';',ind + 1);
    if (ind1==-1) ind1=theCookie.length;
    var value = unescape(theCookie.substring(ind+cookieName.length+1,ind1));
    return value
};

function setCookie(cookieName, cookieValue, msec_in_utc) {
    var expire = new Date(msec_in_utc);
    document.cookie = cookieName + "=" + escape(cookieValue) + ";path=/" +";expires=" + expire.toUTCString();
};

if (readCookie('visit')) {
    visit = 1
}
var today = new Date();
var expire_time = today.getTime() + 30 * 60 * 1000; // 30 min
setCookie('visit', 't', expire_time);

var loc = server_path+
'?cl='+encodeURIComponent(resource)+
'&r=' +encodeURIComponent(referrer) +
'&visit=' + visit +
'&id=' + __id;

// чтобы зря не слать запросы к серверу, шлём данные только о новых посетителях
if (visit == 0) {
  document.write("<div style='display:none;'><img src='" + loc + "' width=1 height=1></div>");
}
;
