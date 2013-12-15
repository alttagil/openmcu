var max_subframes=100;
var default_page_width=942; //CHANGE IT IF YOU WISH, IT'LL BE AUTO-INCREASED IF NEEDED
var page_border_width=70;   //for detect panel width
var debug=0;
var MIXER_PANEL_BGCOLOR='#575';
var MIXER_PANEL_BGCOLOR2='#242';
var MIXER_PANEL_MIXER_STYLE='font-weight:bold;background-color:'+MIXER_PANEL_BGCOLOR2+';padding-left:3px;padding-right:3px;border-radius:2px;border:2px solid #484;color:#fc5';
var DRAGANDDROP_BORDER_COLOR='#007';
var MIXER_PANEL_HEIGHT=33;
var panel_width=200; // init anyhow :)
var PANEL_ITEM_HEIGHT=17; // height of BOLVANCHIK
var PANEL_ICON_HEIGHT=PANEL_ITEM_HEIGHT-2;
var PANEL_ICON_WIDTH=PANEL_ICON_HEIGHT;
var PANEL_LEVEL_WIDTH=2; // audio level block width
var SCROLLER_WIDTH=22; // browser specific, maybe calculated, but not yet
var panel_ip_width=120; // width of IP address bar in panel
var PANEL_MIXERID_WIDTH=10; // width of mixer id bar in panel
var PANEL_HIDEBUTTON_WIDTH=15;
var MIXER_LAYOUT_SCROLL_LEFT_STYLE="line-height:10px;font-weight:bold;color:#fff;cursor:pointer";
var MIXER_LAYOUT_SCROLL_RIGHT_STYLE=MIXER_LAYOUT_SCROLL_LEFT_STYLE;
var MIXER_LAYOUT_SCROLL_LEFT_BUTTON="&#9668;";
var MIXER_LAYOUT_SCROLL_RIGHT_BUTTON="&#9658;";
var VAD_FIELD_STYLE="width:40px;background-color:#fce;border-radius:5px;color:blue;font-weight:bold";
var MIX_BORDER_COLOR='#5ce';


var OTFC_UNMUTE                  =  0; // corresponds to h323.h
var OTFC_MUTE                    =  1;
var OTFC_MUTE_ALL                =  2;
var OTFC_REMOVE_FROM_VIDEOMIXERS =  3;
var OTFC_REFRESH_VIDEO_MIXERS    =  4;
var OTFC_DROP_MEMBER             =  7;
var OTFC_VAD_NORMAL              =  8;
var OTFC_VAD_CHOSEN_VAN          =  9;
var OTFC_VAD_DISABLE_VAD         = 10;
var OTFC_REMOVE_VMP              = 11;
var OTFC_MOVE_VMP                = 12;
var OTFC_SET_VMP_STATIC          = 13;
var OTFC_VAD_CLICK               = 14;
var OTFC_MIXER_ARRANGE_VMP       = 15;
var OTFC_MIXER_SCROLL_LEFT       = 16;
var OTFC_MIXER_SHUFFLE_VMP       = 17;
var OTFC_MIXER_SCROLL_RIGHT      = 18;
var OTFC_MIXER_CLEAR             = 19;
var OTFC_MIXER_REVERT            = 20;
var OTFC_GLOBAL_MUTE             = 21;
var OTFC_SET_VAD_VALUES          = 22;
var OTFC_TEMPLATE_RECALL         = 23;
var OTFC_SAVE_TEMPLATE           = 24;
var OTFC_DELETE_TEMPLATE         = 25;
var OTFC_INVITE                  = 32;
var OTFC_REMOVE_OFFLINE_MEMBER   = 33;
var OTFC_DROP_ALL_ACTIVE_MEMBERS = 64;
var OTFC_INVITE_ALL_INACT_MMBRS  = 65;
var OTFC_REMOVE_ALL_INACT_MMBRS  = 66;
var OTFC_SAVE_MEMBERS_CONF       = 67;
var OTFC_YUV_FILTER_MODE         = 68;
var OTFC_TAKE_CONTROL            = 69;
var OTFC_DECONTROL               = 70;
var OTFC_ADD_VIDEO_MIXER         = 71;
var OTFC_DELETE_VIDEO_MIXER      = 72;
var OTFC_SET_VIDEO_MIXER_LAYOUT  = 73;
var OTFC_SET_MEMBER_VIDEO_MIXER  = 74;
var OTFC_VIDEO_RECORDER_START    = 75;
var OTFC_VIDEO_RECORDER_STOP     = 76;

var libyuv_flt_desc = Array('None', 'Bilin.', 'Box');

var mmw = -1; // build_page() initializer
var visible_ids='';
var mixers=0, bfw=704, bfh=576, room='';

var mixer_refresh_timer = null;

if(debug)document.write('<div style="width:800px;height:80px;overflow:auto;border:1px dotted red" id="debug1">'); function dmsg(s){if(debug){document.getElementById('debug1').innerHTML+=s+'. ';document.getElementById('debug1').scrollTop=document.getElementById('debug1').scrollHeight;}}

var fv_ids=Array('room','tag','moderated','vidmemnum','muteUnvisible','VAdelay','VAtimeout','VAlevel');
var idsl=fv_ids.length;
for(var i=0;i<max_subframes;i++)fv_ids[i+idsl]='usr'+i;
var dd_in_progress=false;
var query_active=false;
var appendedflying=false;
var dd_over=0;
var dd_over_idx=-1;
var dd_over_substance=-1;
var dd_final_idx=0;
var dd_final_substance='?';
var prvnt=0;
var mrefreshing=false;
var staticMemberSelecting=false;
var selectingObject=0;

var query_gas = 0; // query status for 'form_gather_and_send()'
var query_gas_result = 0; // query result of 'form_gather_and_send()': 0=OK; -1=FAIL; 1=in progress

var otfrq=Array(); // on the fly control command queue
var otf_in_progress = false; // on the fly control request flag

var invall=false;

var dd_flying_idx=false; // position for d&d
var dd_flying_substance=0; // panel marker for d&d
var dd_ex_marker=0;

var recallflag=false;
var offliners=false;

var vad_setup_mode=false;
var tpl_save_mode=false;
var vad1=100; var vad2=1000; var vad3=10000;

var hl_links=[];
var hl_id = -1;
var hl_state = -1;

function index_exists(a, i)
{
  try
  {
    if(typeof a[i] == 'undefined') return false;
    else return true;
  }
  catch (error){}
  return false;
}

function uncheck_recall(){
 document.cookie='autorec=false';
 document.getElementById('autorecall').checked=false;
}

function getcookie(name){
  var regexp=new RegExp("(?:; )?"+name+"=([^;]*);?");
  if (regexp.test(document.cookie)) return decodeURIComponent(RegExp["$1"]);
  return false;
}

function descreen1(s){ s+="";return s.replace(/\%7C/g,'|').replace(/\%23/g,'#'); }

function screen1(s){ s+=""; return s.replace(/\|/g,'%7C').replace(/\#/g,'%23'); }

function pstrip(s){ return s.replace(/[^А-Яа-яA-Z0-9a-z-_]/gi,''); }

function wpcheck(){ if(document.getElementById("disable_pe").checked){ alert("Please uncheck 'W/p' first."); return false; } return true; }

function update_or_reload(layout_changed){ if(layout_changed)return document.forms[0].sendit.click(); else return form_gather_and_send(); }

function my_trim(s){ s+=""; return s.replace(/(^[\s\t\n\r]+)|([\s\t\n\r]+$)/g, ""); }

function checkcontrol(){
  if(isModerated)return true;
  my_alert("Please take the control first");
  return false;
}

function ddstart(e,o,substance,idx){
  if(prvnt) return false;
  if(!checkcontrol()) return false;
  if(e.preventDefault)e.preventDefault(); else e.returnValue=false;
//something like mutex:
  if(dd_in_progress)return false; if(query_active)return false; dd_in_progress=true;

  dd_flying_idx=idx; dd_flying_substance=substance;

  dd_over_idx=-1; dd_over_substance=substance;
  draggingobject=o;
  backupedbgcolor=o.style.backgroundColor;
  o.style.backgroundColor='#557';
  somethingflying=document.createElement('div');
  var s=somethingflying.style;
  s.width=o.style.width;
  s.height=o.style.height;
  s.backgroundColor='transparent';
  s.border='2px solid '+DRAGANDDROP_BORDER_COLOR; if(s.width>10)s.width-=2; if(s.height>10)s.height-=2;
  somethingflying.innerHTML=o.innerHTML;
  s.backgroundColor=backupedbgcolor;
  s.position='absolute';
  s.cursor='move';
  s.opacity='0.5';
  sfo_x=e.clientX; sfo_y=e.clientY;
  if((substance!=='panel')&&(substance!=='panel_top')){ // from mockup:
   base_offset_x=document.getElementById('pp'+substance+'_'+idx).offsetLeft-document.getElementById('pbase').offsetLeft;
   base_offset_y=document.getElementById('pp'+substance+'_'+idx).offsetTop-document.getElementById('pbase').offsetTop;
  } else { // from right list panel:
   var id=idx+"";
   if(id.substr(0,1)=='-')id='_'+id.substr(1);
   base_offset_x=document.getElementById('rpan_'+id).offsetLeft+document.getElementById('pp_2').offsetLeft-document.getElementById('pbase').offsetLeft;
   base_offset_y=document.getElementById('rpan_'+id).offsetTop+document.getElementById('pp_2').offsetTop-document.getElementById('pbase').offsetTop;
   if(dd_flying_substance=='panel_top')
   {
     if(dd_flying_idx==-1)base_offset_x+=23;
     if(dd_flying_idx==-2)base_offset_x+=56;
   }
   base_offset_y-=document.getElementById('right_scroller').scrollTop;
  }
  appendedflying=false;
  s.left=base_offset_x;
  s.top=base_offset_y;
}

function ddprogress(e){
 if(!dd_in_progress) return true;
 if(e.preventDefault)e.preventDefault(); else e.returnValue=false;
 if(!appendedflying){
  appendedflying=true;
  document.getElementById('pbase').appendChild(somethingflying);
 }
 somethingflying.style.left=base_offset_x-sfo_x+e.clientX+'px';
 somethingflying.style.top=base_offset_y-sfo_y+e.clientY+'px';
 return false;
}

function ddstop(e){
 if(!dd_in_progress) return false;
 dd_final_idx=dd_over_idx;
 dd_final_substance=dd_over_substance;
 if(dd_over!==0)ddout(e,dd_over,dd_over_idx);
 if(appendedflying) document.getElementById('pbase').removeChild(somethingflying);
 appendedflying=false;
 draggingobject.style.backgroundColor=backupedbgcolor;
 dd_in_progress=false;
 dd_do_it(dd_flying_substance,dd_flying_idx,dd_final_substance,dd_final_idx);
 return false;
}

function ddover(e,o,substance,idx){
 if(!dd_in_progress) return true;
 if(dd_over===o)return false; //already complete
 if((dd_flying_substance==0)&&(dd_flying_idx===idx)) {dd_over_idx=-1;return false;} //?????????????????????
 if(dd_over!==0)ddout(event,dd_over,idx);
 dd_over=o;
 dd_over_bgbkp=o.style.backgroundColor;
 if(idx==-2) {
  if(dd_flying_idx>0) o.style.backgroundColor='#ccc';
 } else o.style.backgroundColor='#f00';
 dd_over_idx=idx;
 dd_over_substance=substance;
}

function ddout(e,o,substance,idx){
 if(!dd_in_progress) return true;
 if(dd_over===0) return true;
 dd_over.style.backgroundColor=dd_over_bgbkp;
 dd_over=0;
 return false;
}

function dd_do_it(s1, p1, s2, p2)
{
  if((s1===s2)&&(p1===p2)) return true; // nothing to do

  if(((s1==='panel')||(s1=='panel_top'))&&((s2==='panel')||(s2==='panel_top'))) return true; //panel->panel

  if(s1==='panel_top') // top panel -> ...
  { alert('Header -> somewhere: '+s1+'/'+p1+' -> '+s2+'/'+p2); return; }

  if(s1==='panel') // panel -> ...
  { queue_otf_request(OTFC_SET_VMP_STATIC,p1,s2,p2); return true; }

  if((s2==='panel')||(s2==='panel_top'))
  { queue_otf_request(OTFC_REMOVE_VMP,s1,p1); return true; }

  queue_otf_request(OTFC_MOVE_VMP,s1,p1,s2,p2);
}

function form_gather_and_send(){
 if(query_gas) return false; query_gas=1; var d=document.forms[0];
 query_gas_result=1;
 var cmd='room=' + d.room.value;
 if(d.moderated.checked)cmd+='&moderated=%2B';
 if(d.muteUnvisible.checked)cmd+='&muteUnvisible=%2B';
 cmd
 +='&VAlevel='      + d.VAlevel.value
  +'&VAdelay='      + d.VAdelay.value
  +'&VAtimeout='    + d.VAtimeout.value
  +'&vidmemnum='    + d.vidmemnum.value
 ;
 for(var i=0;i<max_subframes;i++) eval('if(document.forms[0].usr'+i+')cmd+="&usr"+i+"="+document.forms[0].usr'+i+'.value;else cmd+="&usr"+i+"=0";');
 cmd=cmd.replace(/\+/g,'%2B');
 cro_gas=createRequestObject();
 cro_gas.open('POST','Select',true);
 cro_gas.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
 cro_gas.setRequestHeader("Content-length", cmd.length);
 cro_gas.setRequestHeader("Connection", "close");
 cro_gas.onreadystatechange=gas_result;
 cro_gas.send(cmd);
}

function gas_result(){
 try {
  if (cro_gas.readyState==4) {
   if (cro_gas.status==200) query_gas_result=0; else query_gas_result=-1;
   cro_gas.abort();
   query_gas=0;
  }
 } catch (e) { ; }
}

function set_create_usr_value(n,id){
// alert('scuv('+n+','+id+')');
 var d=false; eval('if(document.forms[0].usr'+n+')d=document.forms[0].usr'+n);
 if(d===false) return false;
 if(d.type!='select-one') return false;
 var flag=false;
 for(var i=0;i<d.length;i++)if(d.options[i].value==id) {flag=true;d.selectedIndex=i;break;}
 if (flag) return true;
 var option=document.createElement("option");
 option.text=member_read_by_id(id,2);
 option.value=id;
 try {
   d.add(option,selvmn.options[null]);
 } catch (e) {
   d.add(option,null);
 }
 d.selectedIndex=d.length-1;
 return true;
}

function createRequestObject(){
 if (typeof XMLHttpRequest==='undefined'){
  XMLHttpRequest=function(){
   try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch(e) {}
   try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch(e) {}
   try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch(e) {}
   try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch(e) {}
   return false;
 }} return new XMLHttpRequest();
}

function queue_otf_request(action, value, option, option2, option3){ // options are optional
  var q=Array(action,value);
  if(typeof option!='undefined')
  { q[2]=option;
    if(typeof option2!='undefined')
    { q[3]=option2;
      if(typeof option3!='undefined') q[4]=option3;
    }
  }
  var len=otfrq.push(q);
  dmsg('Request queued, queue length is '+len);
  if(len==1) dmsg('Starting On-the-Fly queue');
  if(len==1) start_otf_control();
}

function start_otf_control(){
 if(otf_in_progress)
 {
   dmsg('Request will be delayed for 333 ms');
   return setTimeout(start_otf_control,333);
 }
 otf_in_progress=true;
 if(otfrq.length==0) { otf_in_progress=false; return; }
 var data=otfrq.pop();
 var cmd='room='+encodeURIComponent(roomName)
   + '&otfc=1'
   + '&action='+data[0]
   + '&v='+data[1];
 if(2 in data) cmd+='&o='+encodeURIComponent(data[2]);
 if(3 in data) cmd+='&o2='+encodeURIComponent(data[3]);
 if(4 in data) cmd+='&o3='+encodeURIComponent(data[4]);
 dmsg('Sending <font color="green">'+cmd+'</font>');
 otf_timer=setTimeout(otf_fail,5555);
 cro_otf=createRequestObject();
 cro_otf.open('POST','Select',true);
 cro_otf.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
 cro_otf.setRequestHeader("Content-length", cmd.length);
 cro_otf.setRequestHeader("Connection", "close");
 cro_otf.onreadystatechange=otf_result;
 cro_otf.send(cmd);
 dmsg('Sent');
}

function otf_result(){
 try {
  if (cro_otf.readyState==4) {
   if (cro_otf.status==200) {
    clearTimeout(otf_timer);
    dmsg('Server responded: <b>'+cro_otf.responseText+'</b>, queue length: '+otfrq.length);
    cro_otf.abort();
    otf_in_progress=false;
    if(otfrq.length>0) start_otf_control();
   } else {
    otfrq=Array();
    cro_otf.abort();
    clearTimeout(otf_timer);
    my_alert('On-the-Fly Control error: reply code='+cro_otf.status+'.');
    otf_in_progress=false;
   }
  }
 } catch (e) {
 }
}

function otf_fail(){
 cro_otf.abort(); otf_in_progress=false; otfrq=Array();
 my_alert('On-the-Fly Control request cancelled by timeout.');
}

function member_modify_by_id(id,index,value){
 if(typeof members==='undefined') return false;
 for(var i=0;i<members.length;i++) if(members[i][0]) if(members[i][1]==id){
    members[i][index]=value;
    return true;
 }
 return false;
}

function member_read_by_id(id,index){
 if(typeof members==='undefined') return false;
 for(var i=0;i<members.length;i++) if(members[i][0]) if(members[i][1]==id) return members[i][index];
 return false;
}

function muteunmute(obj,mid){
  dmsg('Executing MUTE for member id '+mid);
  var mute=member_read_by_id(mid,3);
  obj.src='openmcu.ru_launched_Ypf.gif';
  queue_otf_request(OTFC_MUTE-mute,mid);
  return false;
}

function vadoptions(obj,mid){
 var disv=member_read_by_id(mid,4);
 var cvan=member_read_by_id(mid,5);
 if(!(cvan|disv))var cmd=OTFC_VAD_CHOSEN_VAN; else if(cvan)var cmd=OTFC_VAD_DISABLE_VAD;else var cmd=OTFC_VAD_NORMAL;
 queue_otf_request(cmd,mid);
 obj.src='openmcu.ru_launched_Yph.gif';
 return false;
}

function checking_failed(){
  check_alive=0;
  if(!iframe_reconnection){
    var ifr=document.getElementById('loggingframe');
    var doc=ifr.contentWindow.document.open('text/html','replace');
    doc.write('<body style="font-face:Verdana,Arial;color:red;font-size:10px;font-weight:bold">Connection dropped :(<br>Trying to reconnect...');
    if(typeof link_was_lost==='undefined')link_was_lost=document.getElementById('logging1').innerHTML;
  }
  setTimeout(reconnect_iframe,1500);
}

function reconnect_iframe(){
  iframe_reconnection=1;
  var ifr=document.getElementById('loggingframe');
  try{
  document.getElementById('logging1').removeChild(ifr);
  document.getElementById('logging1').innerHTML=link_was_lost;
  check_alive=setTimeout(checking_failed,5500);
  } catch(e){ location.href=location.href; }
}

function alive(){
  iframe_reconnection=0;
  if(typeof check_alive !== 'undefined') if(check_alive!==0) clearTimeout(check_alive);
  if(typeof check_alive_counter === 'undefined') check_alive_counter=0; else check_alive_counter++;
  var ifr=document.getElementById('loggingframe');
  if(check_alive_counter>=2000){
    check_alive_counter=0;
    ifr.contentWindow.location.href=ifr.contentWindow.location.href;
  }
  ifr.contentWindow.scrollTo(0,999999);
  check_alive=setTimeout(checking_failed,5000);
}

function inviteoffline(obj,mname){ queue_otf_request(OTFC_INVITE,mname); obj.src='openmcu.ru_launched_Ypf.gif'; }

function removeoffline(obj,mname){ if(confirm("Remove "+decodeURIComponent(mname)+"?")) {queue_otf_request(OTFC_REMOVE_OFFLINE_MEMBER,mname); obj.src='openmcu.ru_launched_Ypf.gif'; }}

function disablevad_yes_no(obj,mid,disv){ obj.style.color='#ff0'; queue_otf_request(3-disv,mid); return false; }

function chosenvan_yes_no(obj,mid,cvan){ obj.style.color='#ff0'; queue_otf_request(5-cvan,mid); return false; }

function kick_confirm(obj,mid,mname){ if(confirm("Drop connection with "+decodeURIComponent(mname)+"?")) {queue_otf_request(OTFC_DROP_MEMBER,mid); obj.src='openmcu.ru_launched_Ypf.gif'; }}

function drop_all0(obj){ if(confirm('Drop ALL active connections?')) {queue_otf_request(OTFC_DROP_ALL_ACTIVE_MEMBERS,0); }}

function invite_all(obj){ if(confirm('Invite ALL inactive members?')) {queue_otf_request(OTFC_INVITE_ALL_INACT_MMBRS,0); }}

function remove_all0(obj){ if(confirm('Remove ALL inactive members from list?')) {queue_otf_request(OTFC_REMOVE_ALL_INACT_MMBRS,0); }}

function save_members_conf(obj){ if(confirm('Rewrite members.conf?')) {queue_otf_request(OTFC_SAVE_MEMBERS_CONF,0); }}

function highlight(id, state)
{
  if((hl_state == state) && (hl_id == id)) return;
  if(state==0)
  {
    if((id != hl_id)||(hl_state==0)) return;
    if(index_exists(hl_links,hl_id))
    for(var i=0;i<hl_links[hl_id].length;i++)
    {
      document.getElementById(hl_links[hl_id][i]).style.opacity="0.5";
      document.getElementById(hl_links[id][i]).style.filter='alpha(opacity=50)';
    }
  }
  else
  {
    if(index_exists(hl_links,id))
    {
      for(var i=0;i<hl_links[id].length;i++)
      {
        document.getElementById(hl_links[id][i]).style.opacity="0";
        document.getElementById(hl_links[id][i]).style.filter='alpha(opacity=0)';
      }
    }
  }
  hl_state = state;
  hl_id = id;
}

function on_abook_check_all(obj){
  var checked = obj.checked;
  for(i=0;i<addressbook.length;i++)
  {
    mmbr=addressbook[i];
    check_box = document.getElementById("abook_check_"+mmbr[2]);
    if(check_box)
      check_box.checked = checked;
  }
}
function on_abook_check(obj){
  if(obj.checked) return;
  check_box = document.getElementById("abook_check_all");
  if(check_box)
      check_box.checked = obj.checked;
}
function invite_checked_abook(){
  check_box = document.getElementById("abook_check_all");
  if(check_box)
    check_box.checked =false;
  for(i=0;i<addressbook.length;i++)
  {
    mmbr=addressbook[i];
    check_box = document.getElementById("abook_check_"+mmbr[2]);
    if(check_box)
    {
      if(check_box.checked)
      {
        inviteoffline(this,encodeURIComponent(mmbr[2]));
        check_box.checked = false;
      }
    }
  }
}
function on_invite_abook_input(){
  if(document.getElementById("invite_input"))
  {
    var addr = document.getElementById("invite_input").value;
    if(addr != "") inviteoffline(this,addr);
  }
}

function format_mmbr_button(m,st){
 var bgcolors=Array('#d3d4d5','#f5fffa','#f5ccff');
 var shadowcolors=Array('#000','green','magenta');
 var s='<div style="margin-left:2px;';
 s+='border-bottom:1px dotted '+shadowcolors[st]+';border-right:1px dotted '+shadowcolors[st]+';padding:1px';
 s+=";width:"+(panel_width-4)+"px;overflow:hidden;height:"+PANEL_ITEM_HEIGHT+"px;line-height:"+(PANEL_ITEM_HEIGHT-2)+"px;border-radius:4px;margin-bottom:2px;text-align:left;background-color:"+bgcolors[st];
 var id=m[1]+"";
 if(id.substr(0,1)=='-')id='_'+id.substr(1);
 s+='" id="rpan_'+id+'"';
 if(st!=0) s+=';cursor:move" id="rpan_'+id+'" onmousedown="{highlight('+m[1]+',0);ddstart(event,this,\'panel\','+m[1]+');}" onmouseover="highlight('+m[1]+',1)" onmouseout="highlight('+m[1]+',0)"';
 else s+='" id="rpan_'+id+'"';
 var uname=m[2]+"";
 ip=get_addr_uri(uname);
 uname=get_addr_name(uname);

 var mute=''; var vad=''; var kick=''; var hide='';

 var mixer=m[7]; if(mixer==-1) mixer='va';
// mixer='<

 if(st>0) mute="<img onclick='muteunmute(this,"+m[1]+")' style='cursor:pointer' src='i15_mic_"+(m[3]?"off":"on")+".gif' alt='"+(m[3]?"Unmute":"Mute")+"' width="+PANEL_ICON_WIDTH+" height="+PANEL_ICON_HEIGHT+" id='mrpan_"+id+"'>";
 else mute="<img onclick='inviteoffline(this,\""+encodeURIComponent(m[2])+"\")' style='cursor:pointer' src='i15_inv.gif' width="+PANEL_ICON_WIDTH+" height="+PANEL_ICON_HEIGHT+" alt='Invite'>";

 var cmd=10; if(!(m[4]|m[5]))var cmd=8; else if(m[5]) var cmd=9;
 if(st>0) vad="<img onclick='vadoptions(this,"+m[1]+")' style='cursor:pointer' src='openmcu.ru_vad_"+((cmd==8)?"vad":"")+((cmd==9)?"chosenvan":"")+((cmd==10)?"disable":"")+".gif' alt='"+((cmd==8)?"Normal":"")+((cmd==9)?"Van":"")+((cmd==10)?"AD disabled":"")+"' width="+PANEL_ICON_WIDTH+" height="+PANEL_ICON_HEIGHT+" id='vrpan_"+id+"'>";

 if(st>0) kick="<img onclick='kick_confirm(this,"+m[1]+",\""+encodeURIComponent(m[2])+"\");' onmouseover='prvnt=1' onmouseout='prvnt=0' style='cursor:pointer' src='i16_close_red.png' width=16 height=16 alt='Drop'>";
 else kick="<img onclick='removeoffline(this,\""+encodeURIComponent(m[2])+"\")' style='cursor:pointer' src='i16_close_gray.png' width=16 height=16 alt='Remove'>";

 if(st>0) hide="<img style='cursor:pointer' src='i15_getNoVideo.gif' width=15 height=15 title='Remove from video mixers' onclick='if(checkcontrol())queue_otf_request("+OTFC_REMOVE_FROM_VIDEOMIXERS+","+m[1]+")'>";

 var posx_mute   = 2;                                                          // >>
 var posx_vad    = posx_mute        + PANEL_ICON_WIDTH;
 var posx_level  = posx_vad         + PANEL_ICON_WIDTH;
 var posx_name   = posx_level       + PANEL_LEVEL_WIDTH      + 2;
 var posx_kick   = panel_width      - PANEL_ICON_WIDTH       - SCROLLER_WIDTH; // <<
 var posx_ip     = posx_kick        - panel_ip_width;
 var posx_hide   = posx_ip          - PANEL_HIDEBUTTON_WIDTH - 2;
 var posx_mixer  = posx_hide        - PANEL_MIXERID_WIDTH    - 2;
 var name_width=posx_mixer-posx_name;
 if(name_width<10){my_alert('Exception: maybe screen resolution too low?'); if(name_width<1)name_width=1;}
 ip="<span style='color:"+((st==0)?"#576":"blue")+";font-size:10px'>"+ip+"</span>";
 s+='>'; var dpre="<div style='width:0px;height:0px;position:relative;top:0px;left:";
 s+=dpre+posx_mute+"px'><div style='vertical-align:-1px;overflow:hidden;text-align:center;width:"+PANEL_ICON_WIDTH+"px;height:"+PANEL_ICON_HEIGHT+"px;line-height:"+(PANEL_ITEM_HEIGHT-2)+"px'>"+mute+"</div></div>";
 if(st>0)s+=dpre+posx_vad+"px'><div style='vertical-align:-1px;overflow:hidden;text-align:center;width:"+PANEL_ICON_WIDTH+"px;height:"+PANEL_ICON_HEIGHT+"px;line-height:"+(PANEL_ITEM_HEIGHT-2)+"px'>"+vad+"</div></div>";
 if(st>0)s+=dpre+posx_level+"px'><div style='padding-bottom:2px;margin-left:2px;vertical-align:-1px;overflow:hidden;width:"+PANEL_LEVEL_WIDTH+"px;height:"+(PANEL_ITEM_HEIGHT-2)+"px;line-height:"+(PANEL_ITEM_HEIGHT-2)+"px' id='srpan_"+id+"'>&nbsp;</div></div>";
 s+=dpre+posx_name+"px'><div style='vertical-align:-1px;overflow:hidden;padding-left:2px;width:"+name_width+"px;height:"+(PANEL_ITEM_HEIGHT-2)+"px;line-height:"+(PANEL_ITEM_HEIGHT-2)+"px'><nobr>"+uname+"</nobr></div></div>";
 if(st>0)s+=dpre+posx_mixer+"px'><div onclick='javascript:{if(checkcontrol())queue_otf_request("+OTFC_SET_MEMBER_VIDEO_MIXER+","+m[1]+","+(m[7]+1)+");}' style='cursor:pointer;font-size:9px;background-color:#aaf;color:#505;vertical-align:-1px;overflow:hidden;padding-left:1px;padding-right:1px;width:"+PANEL_MIXERID_WIDTH+"px;height:"+(PANEL_ITEM_HEIGHT-2)+"px;line-height:"+(PANEL_ITEM_HEIGHT-2)+"px'>"+mixer+"</div></div>";
 if(st>0)s+=dpre+posx_hide+"px'>"+hide+"</div>";
 s+=dpre+posx_ip+"px'><div style='vertical-align:-1px;overflow:hidden;width:"+(panel_ip_width-2)+"px;height:"+(PANEL_ITEM_HEIGHT-2)+"px;line-height:"+(PANEL_ITEM_HEIGHT-2)+"px'>"+ip+"</div></div>";
 s+=dpre+posx_kick+"px'><div style='vertical-align:-1px;overflow:hidden;width:"+PANEL_ICON_WIDTH+"px;height:"+PANEL_ICON_HEIGHT+"px;line-height:"+(PANEL_ITEM_HEIGHT-2)+"px'>"+kick+"</div></div>";
 s+='</div>';

 return s;
}

function format_mmbr_abook(m,st,num){
  var bgcolors=Array('#F5F5F5','#E6E6FA');
  var state_color;
  if(num%2==0) bgcolor = bgcolors[0];
  else bgcolor = bgcolors[1];

  var height = PANEL_ICON_HEIGHT; //15
  var width = PANEL_ICON_WIDTH; // 15
  var s='<div style="margin-left:2px;border-radius:0px;padding:2px 0px 2px 0px;';
  s+="width:"+(panel_width)+"px;overflow:hidden;height:"+(height+2)+"px;text-align:left;background-color:"+bgcolor;
  var id=m[1]+"";
  if(id.substr(0,1)=='-')id='_'+id.substr(1);
  s+='" id="rpan_'+id+'"';
  s+='>';

  var uname=m[2]+"";
  var name=get_addr_name(uname);
  var ip=get_addr_uri(uname);

  var invite = "", check = "";
  if(!st) invite="<img onclick='inviteoffline(this,\""+encodeURIComponent(m[2])+"\")' style='cursor:pointer' src='i15_inv.gif' width="+width+" height="+height+" alt='Invite'>";
  else invite="<img style='' src='i20_plus.gif' width='"+width+"' height='"+height+"' alt='Invite'>";
  if(!st) check="<input id='abook_check_"+uname+"' onclick='on_abook_check(this)' type='checkbox' width="+width+" height="+height+" style='margin:2px;'>";

  var posx_invite = 8;
  var posx_check  = posx_invite      + width + 16;
  var posx_name   = posx_check       + width + 10;
  var free        = (panel_width)    - posx_name - SCROLLER_WIDTH;
  var width_ip    = free/2           + SCROLLER_WIDTH;
  var width_name  = free/2           - SCROLLER_WIDTH - 10;
  var posx_ip     = panel_width      - width_ip - SCROLLER_WIDTH;

  if(width_name<10){my_alert('Exception: maybe screen resolution too low?'); if(width_name<1)width_name=1;}

  var dpre="<div style='width:0px;height:0px;position:relative;top:0px;left:";
  s+=dpre+posx_invite+"px'><div style='width:"+width+"px;height:"+height+"px'>"+invite+"</div></div>";
  s+=dpre+posx_check+"px'><div style='width:"+width+"px;height:"+height+"px'>"+check+"</div></div>";
  s+=dpre+posx_name+"px'><div style='overflow:hidden;font-size:12px;width:"+width_name+"px;'><nobr>"+name+"</nobr></div></div>";
  s+=dpre+posx_ip+"px'><div style='overflow:hidden;font-size:10px;width:"+width_ip+"px;'>"+ip+"</div></div>";
  s+='</div>';
  return s;
}

function additional_panel(){
  var dpre="<div style='width:0px;height:0px;position:relative;top:0px;left:";
  var height = PANEL_ICON_HEIGHT; // 15
  var width = PANEL_ICON_WIDTH; // 15
  var dbutton="<div class='btn btn-small' style='border-width:1px;border-radius:0px;padding:2px 0px 2px 0px;height:"+(height+1)+"px;line-height:"+(height+1)+"px;text-align:center;cursor:pointer;";
  var s="<div id='additional_panel' style='display:block;width:"+panel_width+"px;height:22px;padding:0px 0px 4px 0px;border-bottom:1px solid #E6E6FA;'>"
   +dpre+"2px;'>"+dbutton+"width:80px' onmousedown='queue_otf_request("+OTFC_MUTE_ALL+")'>Mute&nbsp;All</div></div>"
   +dpre+"100px;'>"+dbutton+"width:28px;' onclick='invite_all(this)'><img width="+width+" height="+height+" alt='Inv.' src='i15_inv.gif'></div></div>"
   +dpre+"132px;'>"+dbutton+"width:28px' onclick='remove_all0(this)'><img width=16 height=16 src='i16_close_gray.png'></div></div>"
   +dpre+"164px;'>"+dbutton+"width:28px;' onclick='drop_all0(this)'><img width=16 height=16 src='i16_close_red.png'></div></div>"
//   +dpre+"0px;'>"+dbutton+"width:20px' id='rpan_0' name='rpan_0' onmousedown='ddstart(event,this,\"panel_top\",0)'>[ ]</div></div>"
//   +dpre+"23px;'>"+dbutton+"width:30px' id='rpan__1' name='rpan__1' onmousedown='ddstart(event,this,\"panel_top\",-1)'>VAD</div></div>"
//   +dpre+"56px;'>"+dbutton+"width:36px' id='rpan__2' name='rpan__2' onmousedown='ddstart(event,this,\"panel_top\",-2)'>VAD2</div></div>"
//   +dpre+"220px"+dbutton+"width:50px;text-align:left;padding-left:4px' onclick='save_members_conf(this)'>Save</div></div>"
   +"</div>";
  return s;
}

function additional_panel_abook(){
  var dpre="<div style='width:0px;height:0px;position:relative;top:0px;left:";
  var height = PANEL_ICON_HEIGHT; // 15
  var width = PANEL_ICON_WIDTH; // 15
  var dbutton="<div class='btn btn-small' style='border-width:1px;border-radius:0px;padding:2px 0px 2px 0px;height:"+(height+1)+"px;line-height:"+(height+1)+"px;text-align:center;cursor:pointer;";
  var input_width = 200;
  var input_posx = panel_width-input_width-5;
  var s="<div id='additional_panel_abook' style='display:none;width:"+panel_width+"px;height:22px;padding:0px 0px 4px 0px;border-bottom:1px solid #E6E6FA;'>"
   +dpre+"2px;'>"+dbutton+"width:28px;' onclick='invite_checked_abook(this)'><img style='opacity:1;' width="+width+" height="+height+" alt='Inv.' src='i15_inv.gif'></img></div></div>"
   +dpre+"34px;'>"+dbutton+"width:28px;' ><input id='abook_check_all' onclick='on_abook_check_all(this)' type='checkbox' height="+height+" style='margin:2px;'></input></div></div>"
   +dpre+(input_posx-width-5)+"px'><img onclick='on_invite_abook_input()' style='margin-top:3px;cursor:pointer' src='i15_inv.gif' width="+width+" height="+height+" alt='Invite'></img></div>"
   +dpre+input_posx+"px'><input id='invite_input' type='text' style='font-size:12px;width:"+input_width+"px;height:20px;padding:0px;'></input></div>"
   +"</div>";
  return s;
}

function tab_panel(){
  var dpre="<div style='width:0px;height:0px;position:relative;top:0px;left:";
  var dmain="px'><div style='width:120px;padding:0;border-bottom:solid 1px #CDC9C9;border-top-left-radius:10px;border-top-right-radius:10px;height:22px;line-height:22px;text-align:center;cursor:pointer;";
  var tab1_name = window.l_connections_word_room;
  var tab2_name = window.l_param_managing_users;
  var s ="<div id='tab_panel' style='border-bottom:solid 1px #E6E6FA;width:"+panel_width+"px;height:22px;margin-bottom:4px'>"
   +dpre+"2"+dmain+"background-color:#E6E6FA' id='tab_members' onclick='on_tab_members()'>"+tab1_name+"</div></div>"
   +dpre+"124"+dmain+"background-color:#F5F5F5' id='tab_abook' onclick='on_tab_abook()'>"+tab2_name+"</div></div>"
   +"</div>";
  return s;
}
function on_tab_members(){
  if(document.getElementById('right_scroller')) document.getElementById('right_scroller').style.display = "block";
  if(document.getElementById('right_scroller_abook')) document.getElementById('right_scroller_abook').style.display = "none";
  document.getElementById('tab_members').style.backgroundColor = "#E6E6FA";
  document.getElementById('tab_abook').style.backgroundColor = "#F5F5F5";
  document.getElementById('additional_panel').style.display = "block";
  document.getElementById('additional_panel_abook').style.display = "none";
  members_refresh();
}
function on_tab_abook(){
  if(document.getElementById('right_scroller')) document.getElementById('right_scroller').style.display = "none";
  if(document.getElementById('right_scroller_abook')) document.getElementById('right_scroller_abook').style.display = "block";
  document.getElementById('tab_members').style.backgroundColor = "#F5F5F5";
  document.getElementById('tab_abook').style.backgroundColor = "#E6E6FA";
  document.getElementById('additional_panel').style.display = "none";
  document.getElementById('additional_panel_abook').style.display = "block";
  abook_refresh();
}

function members_refresh(){
 if(typeof members==='undefined'){
  document.getElementById('members_pan').innerHTML='ERROR: <i>members</i> variable not set';
  return false;
 }
 var tab_height = 25;
 var addpanel_height = 25;
 if(document.getElementById('tab_panel')) tab_height = document.getElementById('tab_panel').offsetHeight;
 if(document.getElementById('additional_panel')) addpanel_height = document.getElementById('additional_panel_abook').offsetHeight;

 var p_height=200;
 if(typeof total_height!='undefined') p_height=total_height-tab_height-addpanel_height-4;
 if(!document.getElementById('right_scroller')) document.getElementById('members_pan').innerHTML='<div id="right_scroller" style="width:'+panel_width+';height:'+p_height+'px;overflow:hidden;overflow-y:auto">Initializing panel...</div>';

// var formids=',';
 offliners=false;
// for(var i=0;i<max_subframes;i++) eval('if(document.forms[0].usr'+i+'){formids+=document.forms[0].usr'+i+'.value+",";}');
 var vmr='';
 var amr='';
 var imr='';
 for(i=0;i<members.length;i++){
  mmbr=members[i];
//  alert(mmbr[1]); if(mmbr[1]!=0){alert('!');alert(mmbr[7]);}
  if(mmbr[0])
   if(visible_ids.indexOf(','+mmbr[1]+',')>=0) vmr+=format_mmbr_button(mmbr,2);
   else amr+=format_mmbr_button(mmbr,1);
  else {imr+=format_mmbr_button(mmbr,0);offliners=true;}
 }
 recallflag=(visible_ids!=',');
 result='<div style="width:"+panel_width+"px" id="right_pan">'+amr+vmr+imr+'</div>';
 var mp=document.getElementById('right_scroller');
 if(mp.innerHTML!=result){
  mp.innerHTML=result;
 }
 for(i=0;i<members.length;i++) if(members[i][0]&&members[i][6])audio(members[i][1],members[i][6]);

 var scroller_abook = document.getElementById('right_scroller_abook');
 if(scroller_abook && scroller_abook.style.display != "none")
   abook_refresh();

 return true;
}

function abook_refresh(){
  if(typeof addressbook==='undefined') return true;
  var tab_height = 25;
  var addpanel_height = 25;
  if(document.getElementById('tab_panel')) tab_height = document.getElementById('tab_panel').offsetHeight;
  if(document.getElementById('additional_panel_abook')) addpanel_height = document.getElementById('additional_panel_abook').offsetHeight;

  var height = 200;
  if(typeof total_height!='undefined') height = total_height;
  height = height-tab_height-addpanel_height-4;

  if(!document.getElementById('right_scroller_abook'))
    document.getElementById('members_pan').innerHTML+='<div id="right_scroller_abook" style="display:none;width:'+panel_width+';height:'+height+'px;overflow:hidden;overflow-y:auto"></div>';
  var scroller_members = document.getElementById('right_scroller');
  if(scroller_members && scroller_members.style.display == "none")
    document.getElementById('right_scroller_abook').style.display = "block";

  var imr='';
  for(i=0;i<addressbook.length;i++)
  {
    mmbr=addressbook[i];
    var state = 0;
    if(typeof members!=='undefined')
    {
      for(j=0;j<members.length;j++)
      {
        if(members[j][8] == mmbr[1]) // urlid
        {
          if(members[j][0]) { state = 1; break; }
        }
      }
    }
    imr+=format_mmbr_abook(mmbr,state,i);
  }
  result="<div style='width:"+panel_width+"px' id='right_pan_abook'>"+imr+"</div>";

  var abook=document.getElementById("right_scroller_abook");
  if(abook.innerHTML!=result) abook.innerHTML=result;
  return true;
}

function inviteall(){
  invall=1;
  queue_otf_request(OTFC_INVITE_ALL_INACT_MMBRS,0);
  invall=false;
}

function audio(id,vol){
// var formids=','; //for(var i=0;i<max_subframes;i++) eval('if(document.forms[0].usr'+i+'){formids+=document.forms[0].usr'+i+'.value+",";}');
 for(var i=0;i<members.length;i++) if(members[i][1]==id){
   members[i][6]=vol;
    var o='rpan_'; id+=''; if(id.substr(0,1)=='-')o+='_'+id.substr(1);else o+=id;
    try{
      if(document.getElementById(o)==='undefined')return;
      if(document.getElementById('s'+o)==='undefined')return;
      o2=document.getElementById('s'+o);
      o=document.getElementById(o);
    } catch(e) { return; }
    var shadowcolors=Array('#000','green','magenta');
    var status=members[i][0];
    if(status)if(visible_ids.indexOf(','+id+',')>=0)status=2;
    if(status==2){var mr=0xf5; var mg=0x00; var mb=0x00ff;} else {var mr=0x00; var mg=0xff; var mb=0x00;}
    var brd=1;
    var clr=shadowcolors[members[i][0]];
    var dtd='dotted';
    var o2value='&nbsp;';
    if(vol>10){
//      var l=1-(Math.log(vol)-2.302585092994046)/8.094622615405134;
      var vol0=1; var vol1=Math.floor(vol/256); while(vol1>0){vol0++;vol1=Math.floor(vol1/2);}if(vol0>8)vol0=8;
      var l=(8-vol0)/7;
      o2value='<font color=';
      if(status==2)o2value+='green'; else o2value+='red';
      o2value+='><b>&#960'+vol0+';</b></font> ';
      mr=Math.round((255-mr)*l)+mr;
      mg=Math.round((255-mg)*l)+mg;
      mb=Math.round((255-mb)*l)+mb;
      mr=mr.toString(16);
      mg=mg.toString(16);
      mb=mb.toString(16);
      if(mr.length < 2) mr='0'+mr;
      if(mg.length < 2) mg='0'+mg;
      if(mb.length < 2) mb='0'+mb;
      if(vol>100) brd=2;
      clr='#'+mr+mg+mb;
      var dtd='solid';
    }
    try
    {
      o.style.borderBottom=brd+'px '+dtd+' '+clr;
      o.style.borderRight=brd+'px '+dtd+' '+clr;
      o.style.paddingBottom=''+(2-brd)+'px';
      o.style.paddingRight=''+(2-brd)+'px';
      o2.innerHTML=o2value;
    } catch(e)
    {
      dmsg('Audio visualisation failed');
      return alive();
    }
    break;
  }
  alive();
}

function get_addr_name(addr){
  return addr.substring(0, addr.lastIndexOf('['));
}
function get_addr_uri(addr){
  return addr.substring(addr.lastIndexOf('[')+1, addr.lastIndexOf(']'));
}

function addmmbr(st,id,name,mute,dvad,cvan,al,mixr,urlid){
  if(typeof members==='undefined') return alive();
  var found=0; var j=members.length;
  for(var i=j-1;i>=0;i--)
  {
    if(name.lastIndexOf(" ##") == -1 && members[i][0] == 0)
    {
      if((members[i][1] == id) || (members[i][8] == urlid))
        if(found){ members.splice(i,1); j--; } else { found=1; j=i; }
    } else {
      if((members[i][1] == id) || (members[i][2] == name))
        if(found){ members.splice(i,1); j--; } else { found=1; j=i; }
    }
  }
  members[j]=Array(st,id,name,mute,dvad,cvan,al,mixr,urlid);
  alive();
  members_refresh();
  top_panel();
  var check=false, i=0;
  do
  {
    if(mixer_refresh_timer == null)
    {
      mixer_refresh_timer = setTimeout(function(){mixer_refresh_timer=null;queue_otf_request(OTFC_REFRESH_VIDEO_MIXERS,0);},250);
      check = true;
    }
    i++;
  } while ((!check) && (mixer_refresh_timer==null) && (i < 12));
}

function chmix(id,mx){
  if(typeof members!='undefined')
  for(var i=0;i<members.length;i++) if(members[i][1]==id){
    members[i][7]=mx;
    members_refresh();
    break;
  }
  alive();
}

function remmmbr(st,id,name,mute,dvad,cvan,al,urlid,clear){
  if(typeof clear=='undefined') clear=false;
  if(typeof members==='undefined') return alive();
  var found=0; var j=members.length;
  for(var i=j-1;i>=0;i--)
  if((members[i][2]==name)||(members[i][1]==id))
  if(found){ members.splice(i,1); j--; } else { found=1; j=i; }
  if(!clear)members[j]=Array(st,0,name,mute,dvad,cvan,al,0,urlid);
  alive();
  members_refresh();
  top_panel();
  var check=false, i=0;
  do
  {
    if(mixer_refresh_timer == null)
    {
      mixer_refresh_timer = setTimeout(function(){mixer_refresh_timer=null;queue_otf_request(OTFC_REFRESH_VIDEO_MIXERS,0);},250);
      check = true;
    }
    i++;
  } while ((!check) && (mixer_refresh_timer==null) && (i < 12));
}

function remove_all(){
  if(typeof members==='undefined') return alive();
  for(var i=members.length-1;i>=0;i--) if(!members[i][0]) members.splice(i,1);
  members_refresh();
  alive();
}

function drop_all(){
  if(typeof members==='undefined') return alive();
  for(var i=members.length-1;i>=0;i--) if(members[i][0]) {members[i][0]=0; members[i][1]=0;}
  for(var i=members.length-1;i>0;i--) for(var j=i-1;i>=0;j--) if(members[i][2]==members[j][2]) {members.splice(j,1); break;}
  members_refresh();
  alive();
}

function object_return(o,id){
  id+='';
  if(id.substr(0,1)=='-')o+='_'+id.substr(1);else o+=id;
  try{
    if(document.getElementById(o)==='undefined')return;
    o=document.getElementById(o);
  } catch(e) { return false; }
  return o;
}

function imute(id){
  for(var i=0;i<members.length;i++) if(members[i][1]==id)
  { members[i][3]=1;
    if((o=object_return('mrpan_',id))===false) return alive();
    o.src='i15_mic_off.gif';
    return alive();
  }
}

function imute_all()
{ for(var i=0;i<members.length;i++) if(members[i][0])
  { members[i][3]=1;
    if((o=object_return('mrpan_',members[i][1]))===false) continue;
    o.src='i15_mic_off.gif';
  }
  return alive();
}

function iunmute(id){
  for(var i=0;i<members.length;i++) if(members[i][1]==id){
    members[i][3]=0;
    if((o=object_return('mrpan_',id))===false) return alive();
    o.src='i15_mic_on.gif';
    return alive();
  }
}

function ivad(id,v){
  dmsg('Executing VAD switch for member id '+id+': new VAD value is '+v);
  for(var i=0;i<members.length;i++) if(members[i][1]==id){
    var src='openmcu.ru_vad_vad.gif';
    if(v==2){members[i][4]=1;members[i][5]=0;src='openmcu.ru_vad_disable.gif';}
    else if(v==1){members[i][4]=0;members[i][5]=1;src='openmcu.ru_vad_chosenvan.gif';}
    else {members[i][4]=0;members[i][5]=0;}
    if((o=object_return('vrpan_',id))===false) return alive();
    o.src=src;
    return alive();
  }
}

function button_control(){
  if(isModerated){
    if(mixers>1)if(!confirm("Additional mixers will be removed.\r\nAre you sure you want to decontrol room?")) return false;
    queue_otf_request(OTFC_DECONTROL,0);
  } else queue_otf_request(OTFC_TAKE_CONTROL,0);
  return false;
}

function room_change(newRoom){
  try{
    var oldUrl=document.getElementById('loggingframe').contentWindow.location.href;
    var newUrl=oldUrl.substr(0,oldUrl.indexOf('room='))+'room='+encodeURIComponent(newRoom);
    if(oldUrl!=newUrl) document.getElementById('loggingframe').contentWindow.location.href=newUrl;
  } catch(e){
    location.href='Select';
  }
}

function top_panel(){
  if(vad_setup_mode) return;
  if(tpl_save_mode) return;
  try{
    var t=document.getElementById('cb1');
    roomName=conf[0][3];
    isModerated=(conf[0][4]!='-');
    globalMute=(conf[0][5]!='0');
    vad1=0+conf[0][6]+0; vad2=0+conf[0][7]+0; vad3=0+conf[0][8]+0;
    roomList=Array(); roomStrings=Array();
    for(var i=0;i<conf[0][9].length;i++){
      roomList[i]=conf[0][9][i][0];
      roomStrings[i]=conf[0][9][i][0]+conf[0][9][i][2]+' ('+(conf[0][9][i][1])+')';
    }
  } catch(e){ return false;}
  var c="<table width='100%'><tr><td width='70%'>"
    c+="<form style='margin:0px;padding:0px' name='FakeForm1'>";
    c+="<select class='btn btn-large btn-";
    if(isModerated)c+="success"; else c+="primary";
    c+="' style='height:38px;' name='RoomSelector' onchange='room_change(this.value);return false'>";
    for(i=0;i<roomList.length;i++){
      c+="<option value=\""+roomList[i]+"\"";
      if(roomList[i]==roomName) c+=" selected";
      c+=">"+roomStrings[i]+"</option>";
    }
    c+="</select>";
  c+="<input onclick='javascript:{button_control();return false;}' type='button' class='btn btn-large btn-"+(isModerated?"primary":"success")+"' value='";
    if(isModerated)c+='Decontrol';
    else c+='Take contrl';
  c+="' />";

  c+="<input onclick='javascript:{if(checkcontrol())queue_otf_request(OTFC_GLOBAL_MUTE,"+(!globalMute)+");}' type='button' class='btn btn-large btn-";
    if(globalMute)c+="warning' value='Unmute'>";
    else c+="inverse' value='Mute invis.'>";
  c+="<input onclick='javascript:{if(checkcontrol())vad_setup();}' type='button' class='btn btn-large btn-inverse' value='VAD setup'>";
  var yuvflt='None';
  var yuvfltidx=0;
  try
  {
    yuvfltidx=conf[0][10];
    if(yuvfltidx!=-1) yuvflt=libyuv_flt_desc[ yuvfltidx ];
  } catch(e) {
    yuvfltidx=-1;
    yuvflt='None';
  }

  if(yuvfltidx != -1)
  {
    c += "<input onclick='javascript:{queue_otf_request("
      +  OTFC_YUV_FILTER_MODE + "," + ((yuvfltidx+1)%3)
      +  ");}' type='button' class='btn btn-large btn-info' value='Flt: " + yuvflt + "'>";
  }

  try{ recState=conf[0][11]; } catch(e) { recState=0; }
  c +="<input type='button' class='btn btn-large "
    + (recState?"btn-inverse":"btn-danger")
    + "' style='width:36px;height:36px;"
    + (recState?"border-radius:0px":"border-radius:18px")
    + "' value=' ' title='"
    + (recState?"Stop recording":"Start recording")
    + "' onclick='javascript:queue_otf_request(OTFC_VIDEO_RECORDER_"
    + (recState?"STOP":"START")
    + ",0)'>";

  c+="</td><td width='30%' align=right id='savetpl' name='savetpl'>";


  c+="<input type='button' class='btn btn-large btn-danger' style='width:20px;padding-left:0px;padding-right:0px;margin-right:1px' value='&ndash;' onclick='javascript:{if(confirm(\"Template \"+document.getElementById(\"templateSelector\").value+\" will be deleted\"))queue_otf_request("+OTFC_DELETE_TEMPLATE+",document.getElementById(\"templateSelector\").value);}'>";
  c+="<select class='btn btn-large btn-disabled' style='margin-left:1px;height:39px' id='templateSelector' name='templateSelector' onchange='queue_otf_request("+OTFC_TEMPLATE_RECALL+",this.value)'>";
   if(typeof tl=='undefined') tl=Array();
   if(typeof seltpl=='undefined') seltpl='';
    c+="<option value=\"\""; if(seltpl=="") c+=" selected"; c+=">&nbsp;</option>";
    for(var i=0;i<tl.length;i++)
    {
      c+="<option value=\"" + tl[i] +"\"";
      if(tl[i]==seltpl) c+=" selected";
      c+=">"+tl[i]+"</option>";
    }
  c+="</select>";
  c+="<input onclick='javascript:{save_template();}' type='button' class='btn btn-large btn-inverse' value='Save'>";
  c+="</form>";

  c+="</td></tr></table>";

  t.innerHTML=c;
}

function save_template(finalName)
{
  if(typeof finalName!='undefined') //stage 2
  {
    while ( (finalName!="") && (finalName[0]==' ') ) finalName=finalName.substr(1);
    while ( (finalName!="") && (finalName[finalName.length-1]==' ') ) finalName=finalName.substring(0,finalName.length-1);
    if(finalName!="") queue_otf_request(OTFC_SAVE_TEMPLATE,finalName);
    tpl_save_mode=false;
    top_panel();
    return;
  }

  if(tpl_save_mode) return false; else tpl_save_mode=true;

  var tDefName=document.getElementById('templateSelector').value;
  if(tDefName[tDefName.length-1]=='*') tDefName=tDefName.substring(0,tDefName.length-1);

  var s=""
    + "<table border=0 cellpadding=0 cellspacing=0 width='100%'><tr><td width='20%' valign='middle'>"
    + "<b>SAVING ROOM TEMPLATE</b></td><td width='80%' align='right' valign='middle'>"
    + "<input type='button' disabled class='btn-large btn-info' value='Enter template id: '>"
    + "<input name='tplname' id='tplname' class='btn btn-large' value=\"" + tDefName + "\" style='width:60px'"
    + " onkeyup='javascript:{if(event.keyCode==13){save_template(document.getElementById(\"tplname\").value);}else if(event.keyCode==27){tpl_save_mode=false;top_panel();}}'"
    + ">"
    + "<input type='button' onclick='javascript:{save_template(document.getElementById(\"tplname\").value);}' type='button' class='btn btn-large btn-danger' value='Save'>"
    + "<input type='button' onclick='javascript:{tpl_save_mode=false;top_panel();}' class='btn btn-large btn-inverse' value='Cancel'>";
    + "</td></tr></table>";

  document.getElementById('cb1').innerHTML=s;
  document.getElementById('tplname').focus();
  document.getElementById('tplname').select();
}

function vad_save(){
  var vad11=document.getElementById('vad1').value;
  var vad22=document.getElementById('vad2').value;
  var vad33=document.getElementById('vad3').value;
  vad_setup_mode=false;
  queue_otf_request(OTFC_SET_VAD_VALUES,vad11,vad22,vad33);
  top_panel();
}

function vad_setup(){
  if(tpl_save_mode) {my_alert('Please close "Template Saving" dialog first'); return false;}
  vad_setup_mode=true;
  var inputst="<input class='span2' style='"+VAD_FIELD_STYLE+"' ";
  var pfx3="<span class='add-on'>";
  var sfx="</span>&nbsp;&nbsp;&nbsp;";
  
  var c ="<div style='border-radius:15px;background-color:#dec;border:1px solid #acb;padding-left:15px'><form name='fakeform2'><div class='input-prepend input-append'>";
    c  +="<br><b>Voice Activation Volume:</b> "+inputst+"name='vad1' id='vad1' value='"+vad1+"' size=5 maxlength=5>"+pfx3+"level: 0...65535"+sfx;
    c  +="<b>Delay:</b> " +inputst+"name='vad2' id='vad2' value='"+vad2+"' size=5 maxlength=5>"+pfx3+"ms: 0...65535"   +sfx;
    c  +="<b>Timeout:</b> "          +inputst+"name='vad3' id='vad3' value='"+vad3+"' size=5 maxlength=5>"+pfx3+"ms: 0...65535"   +sfx;
  c+="<input type='button' onclick='javascript:vad_save()' class='btn btn-danger' value='Save'> ";
  c+="<input type='button' onclick='javascript:{vad_setup_mode=false;top_panel();}' class='btn btn-inverse' value='Cancel'>";
  c+="</div></form></div>";
  document.getElementById('cb1').innerHTML=c;
  document.getElementById('vad1').focus();
  document.getElementById('vad1').select();
}

function frameload(i){
  jpegframes[i][1].onload=function(){reframe(i);};
  jpegframes[i][1].src=jpegframes[i][0]+'&r='+Math.random();
//  alert(jpegframes[i][1].src);
}
function reframe(i){
  document.getElementById('frame'+i).src=jpegframes[i][1].src;
  jpegframes[i][2]=setTimeout(function(){frameload(i);},1999);
}

function change_split(mixer,value){
 my_alert('Mixer '+mixer+' is now '+value);
}

function split_selector(mixer, splitSelected){
  if(typeof splitdata=='undefined')return 'No splits available';
  var r="<span style='"+MIXER_LAYOUT_SCROLL_LEFT_STYLE+"' onclick='javascript:{if(checkcontrol())queue_otf_request("
      +OTFC_SET_VIDEO_MIXER_LAYOUT
      +",(parseInt(document.getElementById(\"splitselector"+mixer+"\").value)+splitdata.length-1)%splitdata.length,"+mixer+");}'"
    +">"+MIXER_LAYOUT_SCROLL_LEFT_BUTTON+"</span>";
  r+="<select id='splitselector"+mixer+"' name='splitselector"+mixer+"' style='width:75px' onchange='javascript:{if(checkcontrol())queue_otf_request("+OTFC_SET_VIDEO_MIXER_LAYOUT+",this.value,"+mixer+"); else this.value="+splitSelected+";}'>";
  for(var i=0;i<splitdata.length;i++){
    r+="<option value="+i;
    if(i==splitSelected) r+=" selected";
    r+=">"+splitdata[i]+"</option>";
  }
  r+="</select>";
  r+="<span style='"+MIXER_LAYOUT_SCROLL_RIGHT_STYLE+"' onclick='javascript:{if(checkcontrol())queue_otf_request("
      +OTFC_SET_VIDEO_MIXER_LAYOUT
      +",(parseInt(document.getElementById(\"splitselector"+mixer+"\").value)+1)%splitdata.length,"+mixer+");}'"
      +">"+MIXER_LAYOUT_SCROLL_RIGHT_BUTTON+"</span>";
  return r;
}

function build_page()
{ try {mixer_out(0);} catch(e){};
  try{ if(typeof jpegframes!='undefined')for(i=jpegframes.length-1;i>=0;i--)if(jpegframes[i][2])clearTimeout(jpegframes[i][2]); } catch(e){};
  jpegframes=Array();
  top_panel();
  if(typeof conf=='undefined' || typeof document.getElementById('cb3')=='undefined') return;
  b=document.getElementById('cb3');
  mixers=conf[0][0]; bfw=conf[0][1]; bfh=conf[0][2]; room=conf[0][3]; roomLink=encodeURIComponent(room);

  var page_width = document.body.clientWidth || default_page_width;
  if(page_width != default_page_width) {
    page_width = page_width-page_border_width;
  }

  var i;

  if(typeof mmw == 'undefined') mmw=-1; if(mmw==-1)
  { mmw=0; total_height=0;
    for(i=0;i<mixers;i++){
      var mw=conf[i+1][0][0]; var mh=conf[i+1][0][1];
      if(mw>mmw) mmw=mw;
      total_height+=mh;
      total_height+=MIXER_PANEL_HEIGHT;
    }
    if(mmw<200)mmw=200; //minimal mixer width
    var free_x=page_width-mmw;
    if(free_x<444)
      page_width=mmw+444;
    log_width=free_x/2;
    panel_width=page_width-log_width-mmw-5;
    if(panel_width<275){ log_width-=(275-panel_width); panel_width=275; }
    panel_ip_width = (panel_width/2) - PANEL_ICON_WIDTH - PANEL_HIDEBUTTON_WIDTH - 2;
  }

  if(total_height < 460) total_height = 460;

  try {
    var l0=document.getElementById('logging0');
    var l1=document.getElementById('logging1');
    var l2=document.getElementById('loggingframe');
    l0.style.left='-'+(log_width-5)+'px';
    l1.style.width=(log_width-2)+'px'; l1.style.height=(total_height-2)+'px';
    l2.style.width=(log_width-2)+'px'; l2.style.height=(total_height-2)+'px';
    l0=document.getElementById('cb2');
    l0.style.width=''+mmw+'px'; l0.style.height=total_height+'px';
  } catch(e) {};

  mockup_content=""; var pos_y=0;
  for(i=0;i<mixers;i++){
    var mw=conf[i+1][0][0]; var mh=conf[i+1][0][1]; var pos_x=(mmw-mw)>>1;
    mockup_content+="<div style='position:relative;top:"+pos_y+"px;left:"+pos_x+"px;width:0px;height:0px'>"; // pointing block for mockup[i]
     mockup_content+="<img style='position:absolute' id='frame"+i+"' name='frame"+i+"'"+ // rectangle for mockup[i]
      " src='Jpeg?room="+roomLink+"&w="+mw+"&h="+mh+"&mixer="+i+"'"+
      " alt='Video Mixer "+(i+1)+"'"+
     " />";
    mockup_content+="</div>";
    pos_y+=mh+MIXER_PANEL_HEIGHT;
    jpegframes[i]=Array("Jpeg?room="+roomLink+"&w="+mw+"&h="+mh+"&mixer="+i,new Image(),null);
  }

  workplace_content="<div id='pbase' style='position:relative;top:0px;left:0px;width:0px;height:0px'>"; // just workplace pointer
    workplace_content+="&nbsp;";
  workplace_content+="</div>";

  panel_content="<div id='pp_2' style='position:relative;top:0px;left:"+mmw+"px;width:0px;height:0px'>"; // pointing block for panel
    panel_content += tab_panel();
    panel_content += additional_panel();
    panel_content += additional_panel_abook();
    panel_content+="<div"+ // rectangle for panel
      " onmouseover='ddover(event,this,\"panel\",-1)'"+
      " onmouseout='ddout(event,this,\"panel\",-1)'"+
      " id='members_pan'"+
      " name='members_pan'"+
      " style='position:absolute;width:"+panel_width+"px;height:"+total_height+"px'>";
      panel_content+="...";
    panel_content+="</div>";
  panel_content+="</div>";

  vmp_content = get_mixers_content(); //sets visible_ids

  main_content = mockup_content;
  main_content += workplace_content;
  main_content += panel_content;
  main_content += vmp_content;

  b.innerHTML=main_content;
  members_refresh();
  alive();
  for(i=0;i<mixers;i++)frameload(i);

}

function get_mixers_content()
{
  var s='', pos_y=0;
  visible_ids=',';
  hl_links=[];
  for(i=0;i<conf[0][0];i++)
  { s+="<div id='mixercontrol"+i+"'>";
    var mw=conf[i+1][0][0]; var mh=conf[i+1][0][1]; var pos_x=(mmw-mw)>>1;
// walking through the mixer's positions
    for(var j=0;j<conf[i+1][1].length;j++)
    { var id=false; try { if(typeof conf[i+1][2][j] != 'undefined') id=conf[i+1][2][j]; } catch(e) {id=false;}
      if(id!==false) if((id!=0)&&(id!=-1)&&(id!=-2)) visible_ids += ''+id+',';
      var type=false; if(id!==false) try { if(typeof conf[i+1][3][j]!='undefined') type=conf[i+1][3][j]; } catch(e) {type=false;}
      var x=Math.round(conf[i+1][1][j][0]/bfw*mw); var y=Math.round(conf[i+1][1][j][1]/bfh*mh);
      var w=Math.round(conf[i+1][1][j][2]/bfw*mw); var h=Math.round(conf[i+1][1][j][3]/bfh*mh);
      var border='1px solid '+MIX_BORDER_COLOR; if(type===2)border='1px solid red'; else if(type===3) border='0;border-right:2px solid yellow;border-bottom:2px solid yellow';
      if(id!==false)if(id!=-1)if(id!=-2){ if(index_exists(hl_links,id)) hl_links[id].push("pr"+i+"_"+j); else { hl_links[id]=[]; hl_links[id][0]="pr"+i+"_"+j; }}
      s+="<div id='pp"+i+"_"+j+"' style='position:relative;top:"+(pos_y+y)+"px;left:"+(pos_x+x)+"px;width:0px;height:0px'>"; // pointing block for member's mockup
        s+="<div id='pr"+i+"_"+j+"'"+ // rectangle for member's mockup
          " onmousedown='ddstart(event,this,"+i+","+j+")' onmouseover='ddover(event,this,"+i+","+j+")' onmouseout='ddout(event,this,"+i+","+j+")'"+
          " style='overflow:hidden;opacity:0.5;filter:alpha(opacity=50);position:absolute;background-color:#F2F2F2;text-align:center;"+
           "border:"+border+";padding:0;cursor:move;width:"+(w-2)+"px;height:"+(h-2)+"px'>";
        s+=get_mixer_position_html(i,j);
        s+="</div>";
      s+="</div>";
    }
    s+="</div>";

    // mixer panel:
      s+="<div id='mxp"+i+"' style='position:relative;top:"+(pos_y+mh)+"px;left:0px;width:0px;height:0px'>"; // pointing block for mixer panel
        s+="<div onmouseover='mixer_over("+i+")' onmouseout='mixer_out("+i+")' style='width:"+(mmw-2)+"px;height:"+(MIXER_PANEL_HEIGHT-1)+"px;background-color:"+MIXER_PANEL_BGCOLOR+";overflow:hidden;text-align:left;line-height:"+(MIXER_PANEL_HEIGHT-1)+"px;padding-left:2px'>";
          s+="<span style='"+MIXER_PANEL_MIXER_STYLE+"'>#"+i;

          s+=" <span style='color:red;cursor:pointer;position:relative;left:0px' onclick='javascript:{if(checkcontrol())queue_otf_request("+OTFC_ADD_VIDEO_MIXER+","+i+");}'>+</span> ";
          if(mixers>1)s+=" / <span style='color:blue;cursor:pointer;position:relative;left:0px' onclick='javascript:{if(checkcontrol())queue_otf_request("+OTFC_DELETE_VIDEO_MIXER+","+i+");}'>&ndash;</span>";

          s+="</span>&nbsp;";
          s+=split_selector(i,conf[i+1][0][2]);

          var str0="&nbsp;<img src='i24_";
          var str1=" width=24 height=24 style='vertical-align:middle;cursor:pointer' onclick='javascript:{if(checkcontrol())queue_otf_request(";
          var str2=","+i+");}' onmouseover='this.style.backgroundColor=\""+MIXER_PANEL_BGCOLOR2+"\"' onmouseout='this.style.backgroundColor=\""+MIXER_PANEL_BGCOLOR+"\"' />&nbsp;&nbsp;";

          s += str0 + "mix.gif' alt='Arrange members'" + str1 + OTFC_MIXER_ARRANGE_VMP + str2
            +  str0 + "revert.gif' alt='Revert'"       + str1 + OTFC_MIXER_REVERT + str2
            +  str0 + "left.gif' alt='Rotate left'"    + str1 + OTFC_MIXER_SCROLL_LEFT + str2
            +  str0 + "shuff.gif' alt='Shuffle'"       + str1 + OTFC_MIXER_SHUFFLE_VMP + str2
            +  str0 + "right.gif' alt='Rotate right'"  + str1 + OTFC_MIXER_SCROLL_RIGHT + str2
            +  str0 + "clr.gif' alt='Clear positions'" + str1 + OTFC_MIXER_CLEAR + str2;

        s+="</div>";
      s+="</div>";
    pos_y+=mh+MIXER_PANEL_HEIGHT;
  }
  return s;
}

function mixrfr()
{
  var pos_y=0;
  var old_visible_ids=visible_ids;
  visible_ids=',';
  hl_links=[];
  for(i=0;i<mixers;i++)
  { var obj = null;
    try { obj=document.getElementById('mixercontrol'+i); } catch(e) {obj=null;}
    if(obj==null) continue;

    var s='';
    var mw=conf[i+1][0][0]; var mh=conf[i+1][0][1]; var pos_x=(mmw-mw)>>1;
// walking through the mixer's positions
    for(var j=0;j<conf[i+1][1].length;j++)
    { var id=false; try { if(typeof conf[i+1][2][j]!='undefined') id=conf[i+1][2][j]; } catch(e) {id=false;}
      if(id !== false) if((id!=0)&&(id!=-1)&&(id!=-2)) visible_ids+=''+id+',';
      var type=false; if(id!==false) try {if(typeof conf[i+1][3][j]!='undefined') type=conf[i+1][3][j];} catch(e) {type=false;}
      var x=0, y=0, w=0, h=0;
      try
      { x=Math.round(conf[i+1][1][j][0]/bfw*mw); y=Math.round(conf[i+1][1][j][1]/bfh*mh);
        w=Math.round(conf[i+1][1][j][2]/bfw*mw); h=Math.round(conf[i+1][1][j][3]/bfh*mh);
      }
      catch(e)
      {
        continue;
      }
      var border='1px solid '+MIX_BORDER_COLOR; if(id==-1)border='1px solid red'; else if(id==-2) border='1px dotted #f00';
      if(id!==false)if(id!=-1)if(id!=-2){ if(index_exists(hl_links,id)) hl_links[id].push("pr"+i+"_"+j); else { hl_links[id]=[]; hl_links[id][0]="pr"+i+"_"+j; }}
      s+="<div id='pp"+i+"_"+j+"' style='position:relative;top:"+(pos_y+y)+"px;left:"+(pos_x+x)+"px;width:0px;height:0px'>"; // pointing block for member's mockup
        s+="<div id='pr"+i+"_"+j+"'"+ // rectangle for member's mockup
          " onmousedown='ddstart(event,this,"+i+","+j+")' onmouseover='ddover(event,this,"+i+","+j+")' onmouseout='ddout(event,this,"+i+","+j+")'"+
          " style='overflow:hidden;opacity:0.5;filter:alpha(opacity=50);position:absolute;background-color:#F2F2F2;text-align:center;"+
           "border:"+border+";padding:0;cursor:move;width:"+(w-2)+"px;height:"+(h-2)+"px'>";
        s+=get_mixer_position_html(i,j);
        s+="</div>";
      s+="</div>";
    }
    obj.innerHTML=s;
  }
  if(old_visible_ids != visible_ids) members_refresh();
  alive();
}

function get_mixer_position_html(mixer, position)
{ var s='';
  if(typeof conf=='undefined') return s;
  var mi=mixer+1;
  if(typeof conf[mi]=='undefined') return s;
  c=conf[mi];
  var mw=c[0][0]; var mh=c[0][1]; var p=position;

  var id=false; if(typeof c[2][p]!='undefined') id=c[2][p];

  var type=false; if(id!==false) if(typeof c[3][p]!='undefined') type=c[3][p];

  var x=Math.round(c[1][p][0]/bfw*mw); var y=Math.round(c[1][p][1]/bfh*mh); //where?
  var w=Math.round(c[1][p][2]/bfw*mw); var h=Math.round(c[1][p][3]/bfh*mh);

  var label_width= w; var label_height=20; if(label_height>h) label_height=10; if(label_height>h) label_height=8;
  var clear_width=20; if(id===false) clear_width=0;
  var  type_width=20;
  var  user_width=w-type_width-clear_width; if(user_width<10)user_width=5;

  if(user_width+clear_width+type_width>w)
  { var halfwidth=w>>1;
    if(halfwidth>clear_width) { user_width=w-clear_width-type_width+2; clear_width--; type_width--; }
    else
    { user_width=0;
      if(halfwidth>2){ clear_width=halfwidth; type_width=w-halfwidth;} else { clear_width=0; type_width=w; }
    }
  }

  if(type===false)
  { s+="<div style='position:relative;top:0px;left:0px;width:0px;height:0px'>";
      s+="<div id='plus"+mixer+"_"+p+"'"
        +" onmouseover='prvnt=1' onmouseout='prvnt=0' onclick='vmp_vad_click("+mixer+","+p+")'"
        +" style='overflow:hidden;cursor:pointer;width:20px;height:"+(label_height-2)+"px'>";
        s+="<img src='i20_plus.gif' title='Add video position' width=20 height=20>";
    s+="</div></div>";
    return s;
  }


  if (type_width>0)
  { s+="<div style='position:relative;top:0px;left:0px;width:0px;height:0px'>";
      s+="<div id='tp"+mixer+"_"+p+"'"
        +" onmouseover='prvnt=1' onmouseout='prvnt=0' onclick='vmp_vad_click("+mixer+","+p+","+type+")'"
        +" style='cursor:pointer;width:"+(type_width)+"px;height:"+(label_height-2)+"px'>";
        s+="<img src='i20_";
          if(type==2) s+='vad'; else if(type==3) s+='vad2'; else s+='static';
          s+=".gif' width="+type_width+" height="+label_height+">";
    s+="</div></div>";
  }

  var memberName = member_read_by_id(id,2);
  if(user_width>0) if(type==1) if(memberName !== false)
  { s+="<div style='position:relative;top:0px;left:"+(type_width)+"px;width:0px;height:0px'>";
     s+="<div id='us"+mixer+"_"+p+"'"
       +" onmouseout='javascript:{prvnt=0;}' onmouseover='javascript:{prvnt=1;}' onclick='javascript:{member_selector(this,"+mixer+","+p+","+id+")}'"
       +" style='x-overflow:hidden;white-space:nowrap;cursor:pointer;width:"+(user_width)+"px;height:"+(label_height-2)+"px'>";
    s+=memberName;
    s+="</div></div>";
  }

  if(clear_width>0)
  { s+="<div style='position:relative;top:0px;left:"+(type_width+user_width)+"px;width:0px;height:0px'>";
     s+="<div id='tp"+mixer+"_"+p+"'"
       +" onmouseover='prvnt=1' onmouseout='prvnt=0' onclick='if(checkcontrol()){queue_otf_request("+OTFC_REMOVE_VMP+","+mixer+","+p+");prvnt=0;}'"
       +" style='cursor:pointer;width:"+(clear_width)+"px;height:"+(label_height-2)+"px'>";
      s+="<img src='i20_close.gif' width="+clear_width+" height="+label_height+">";
    s+="</div></div>";
  }

  return s;
}

function r_moder(){
  conf[0][4]='+'; 
  for(var i=0;i<conf[0][9].length;i++) if(conf[0][9][i][0]==roomName) conf[0][9][i][2]='+';
  top_panel();
  alive();
}

function r_unmoder(){
  conf[0][4]='-';
  for(var i=0;i<conf[0][9].length;i++) if(conf[0][9][i][0]==roomName) conf[0][9][i][2]='-';
  top_panel();
  alive();
}

function mixer_over(mixer)
{ if(dd_in_progress) return false;
  if(typeof mixerover !='undefined') if(mixerover) mixer_out();
  mixerover=1+mixer;
  mixerbackup=document.getElementById('mixercontrol'+mixer).innerHTML;
  document.getElementById('mixercontrol'+mixer).innerHTML='';
}

function mixer_out(mixer)
{
  if(typeof mixerover=='undefined') return false;
  if(mixerover==0) return false;
  mixer=mixerover-1;
  if(typeof mixerbackup!='undefined') document.getElementById('mixercontrol'+mixer).innerHTML=mixerbackup;
  mixerover=0;
}

function vmp_vad_click(mixer,position,type){
  if(!checkcontrol()) return false;
  if(typeof type=='undefined') type=2; else type++;
  if(type>3) type=1;
  queue_otf_request(OTFC_VAD_CLICK,mixer,position,type);
}

function shuffle(mixer){
  alert('Shuffle, mixer '+mixer);
}

function mixer_arrange(mixer){
  alert('Arrange, mixer '+mixer);
}

function array_print(arr,level,idx,values){
  if(typeof level=='undefined')level=0;
  if(typeof values=='undefined')values=1;
  if(typeof idx=='undefined') idx='';
  var r='Array';
  var r2='';
  if(level!=0)r+='L'+level;
  r+='(';
  var flag=0;
  for(var key in arr)
  {
    if(flag)r+=',';
    r+='{'+key+':';
    var i=idx;
    i+='['+key+']';
    r2+='array'+i+'=';
    if(is_array(arr[key]))
    {
      r+=array_print(arr[key],level+1);
      r2+='array; '+array_print(arr[key],level+1,i,1);
    } else
    {
      r+=arr[key];
      r2+=arr[key];
    }
    r+='}';
    r2+='; ';
    flag=1;
  }
  r+=')';
  if(values) return r2;
  return r;
}

//function is_array(inputArray) { return inputArray && !(inputArray.propertyIsEnumerable('length')) && typeof inputArray === 'object' && typeof inputArray.length === 'number';}
function is_array(a){ return (typeof a=='object'); }

function member_selector_mouse_out()
{
  document.body.removeChild(memberSelector);
  staticMemberSelecting=false;
}

function member_selector_select(mixer, position, id)
{
  member_selector_mouse_out();
  queue_otf_request(OTFC_SET_VMP_STATIC,id,mixer,position);
}

function member_selector(obj,mixer,position,id)
{
  dmsg('Creating member selector for mixer '+mixer+', position '+position);
  if(!checkcontrol()) return false;
  if(staticMemberSelecting) document.body.removeChild(memberSelector);

  memberSelector=document.createElement('div');
//  memberSelector.className='input-prepend input-append';
  var selWidth=250;
  var selHeight=300;
  memberSelector.style.width=selWidth+'px';
  memberSelector.style.height=selHeight+'px';
  memberSelector.style.position='absolute';
  memberSelector.style.left=getLeftPos(obj)+'px';
  memberSelector.style.top=getTopPos(obj)+'px';
  memberSelector.style.overflowY='scroll';
  memberSelector.style.overflowX='hidden';
  memberSelector.style.border='1px solid #000';
  memberSelector.style.borderRadius='5px';
  memberSelector.style.backgroundColor='#fff';
  memberSelector.onmouseleave=member_selector_mouse_out;

  var selector="";
  for(var i=0;i<members.length;i++)
  {
    if(members[i][0])
    {
      var current=(id==members[i][1]);
      selector+="<p ";
      if(!current) selector+="onclick='javascript:{member_selector_select(" + mixer + "," + position + "," + members[i][1] + ");}' ";
      else selector+="onclick='javascript:member_selector_mouse_out();' ";
      selector+=" class='btn btn-large";
      if(current) selector+=" btn-success";
      selector+="' style='margin:1px;width:"+(selWidth-8)+"px;text-align:left'><nobr>"+members[i][2]+"</nobr></p>";
    }
  }

  memberSelector.innerHTML=selector;

  document.body.appendChild(memberSelector);

  staticMemberSelecting = true;
}

function my_alerting()
{
  myAlertingCounter++;
  if(myAlertingCounter>=8)
  {
    myAlertObject.innerHTML=myAlertBackup;
    myAlertObject.style.color=myAlertBackupColor;
    myAlertObject.style.backgroundColor=myAlertBackupBGColor;
    myAlertBackup='ale';
    return;
  }
  if(myAlertingCounter&1)
  {
    myAlertObject.style.color='#f00';
    myAlertObject.style.backgroundColor='#fff';
  }
  else
  {
    myAlertObject.style.color='#fff';
    myAlertObject.style.backgroundColor='#f00';
  }
  myAlertTimeout=setTimeout(my_alerting,444);
}

function my_alert(s)
{
  try { clearTimeout(myAlertTimeout); } catch (e) {};
  myAlertString=s;
  myAlertObject=document.getElementById('tip');
  if(typeof myAlertBackup=='undefined') myAlertBackup='ale';
  if(myAlertBackup=='ale')
  {
    myAlertBackup=myAlertObject.innerHTML;
    myAlertBackupColor=myAlertObject.style.color;
    myAlertBackupBGColor=myAlertObject.style.backgroundColor;
  }
  myAlertObject.innerHTML=s;
  myAlertObject.style.color='#fff';
  myAlertObject.style.backgroundColor='#f00';
  myAlertingCounter=0;
  myAlertTimeout=setTimeout(my_alerting,444);
}

function getTopPos(el) {
  for (var topPos=0; el!=null; topPos+=el.offsetTop, el=el.offsetParent);
  return topPos;
}

function getLeftPos(el) {
  for (var leftPos=0; el!=null; leftPos+=el.offsetLeft, el=el.offsetParent);
  return leftPos;
}
