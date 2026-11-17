const KEY="safai-v1";
let data=JSON.parse(localStorage.getItem(KEY)||'{"notes":[],"today":[],"future":[],"settings":{"sound":"soft","dark":false}}');
let mode="note", editId=null, imageData=null;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function save(){localStorage.setItem(KEY,JSON.stringify(data)); render();}
function esc(s=""){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function render(){
  $("#notesList").innerHTML=data.notes.map((x,i)=>card(x,"notes",i)).join("");
  $("#todayList").innerHTML=data.today.map((x,i)=>card(x,"today",i)).join("");
  $("#futureList").innerHTML=data.future.map((x,i)=>card(x,"future",i)).join("");
  $("#emptyNotes").style.display=data.notes.length?"none":"block";
  $("#emptyToday").style.display=data.today.length?"none":"block";
  $("#emptyFuture").style.display=data.future.length?"none":"block";
  document.body.classList.toggle("dark",!!data.settings.dark);
  $("#darkMode").checked=!!data.settings.dark;
  $("#sound").value=data.settings.sound;
}
function card(x,type,i){
  let when=x.date?(x.date+" • "+(x.time||"")):"";
  return `<article class="card ${x.done?"done":""}">
    <div class="card-top"><div><h3>${esc(x.title||"بدون عنوان")}</h3>${x.body?`<p>${esc(x.body)}</p>`:""}</div><span>${x.done?"✅":""}</span></div>
    ${x.image?`<img class="thumb" src="${x.image}">`:""}
    ${when?`<div class="meta">⏰ ${esc(when)}</div>`:""}
    <div class="card-actions">
      ${type!=="notes"?`<button class="small" onclick="toggleDone('${type}',${i})">${x.done?"↩️ إرجاع":"✅ تم"}</button>`:""}
      <button class="small" onclick="editItem('${type}',${i})">✏️ تعديل</button>
      <button class="small" onclick="removeItem('${type}',${i})">🗑️ حذف</button>
    </div>
  </article>`;
}
function openEditor(m,i=null){
  mode=m; editId=i; imageData=null;
  const old=i!==null?data[m][i]:null;
  $("#editorTitle").textContent=i===null?"إضافة "+(m==="notes"?"ملاحظة":"مهمة"):"تعديل";
  $("#titleInput").value=old?.title||""; $("#bodyInput").value=old?.body||"";
  $("#dateRow").classList.toggle("hidden",m==="notes");
  $("#dateInput").value=old?.date||new Date().toISOString().slice(0,10);
  $("#timeInput").value=old?.time||"09:00";
  $("#preview").src=old?.image||""; $("#preview").classList.toggle("hidden",!old?.image);
  $("#editor").classList.add("show");
}
$("#addNote").onclick=()=>openEditor("notes");
$("#addTask").onclick=()=>openEditor("today");
$("#addFuture").onclick=()=>openEditor("future");
$("#saveItem").onclick=()=>{
  const obj={title:$("#titleInput").value.trim(),body:$("#bodyInput").value.trim(),image:imageData||((editId!==null)?data[mode][editId].image||"":"")};
  if(mode!=="notes"){obj.date=$("#dateInput").value;obj.time=$("#timeInput").value;}
  if(editId===null){obj.id=Date.now();obj.done=false;data[mode].push(obj)}else{obj.id=data[mode][editId].id;obj.done=data[mode][editId].done;data[mode][editId]=obj}
  $("#editor").classList.remove("show");save();scheduleLocalReminder(obj,mode);
};
$("#imageInput").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{imageData=r.result;$("#preview").src=imageData;$("#preview").classList.remove("hidden")};r.readAsDataURL(f)};
function editItem(t,i){openEditor(t,i)}
function removeItem(t,i){if(confirm("حذف هذا العنصر؟")){data[t].splice(i,1);save()}}
function toggleDone(t,i){data[t][i].done=!data[t][i].done;save()}
window.editItem=editItem;window.removeItem=removeItem;window.toggleDone=toggleDone;

$$(".nav").forEach(b=>b.onclick=()=>{$$(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");$$(".section").forEach(x=>x.classList.remove("active"));$("#"+b.dataset.target).classList.add("active")});
$("#settingsBtn").onclick=()=>$("#settings").classList.add("show");
$$("[data-close]").forEach(b=>b.onclick=()=>b.closest(".modal").classList.remove("show"));
$("#darkMode").onchange=e=>{data.settings.dark=e.target.checked;save()};
$("#sound").onchange=e=>{data.settings.sound=e.target.value;save()};
$("#notifyBtn").onclick=async()=>{
 if(!("Notification" in window)){alert("المتصفح لا يدعم إشعارات الويب هنا.");return}
 const p=await Notification.requestPermission();
 alert(p==="granted"?"تم تفعيل الإشعارات.":"لم يتم السماح بالإشعارات.");
};
function scheduleLocalReminder(obj,type){
 if(!obj.date||!obj.time||!("Notification" in window)||Notification.permission!=="granted")return;
 const at=new Date(obj.date+"T"+obj.time).getTime(), delay=at-Date.now();
 if(delay>0&&delay<2147483647)setTimeout(()=>{if(!obj.done)new Notification("صفائي",{body:obj.title||"لديك مهمة الآن"})},delay);
}
setTimeout(()=>$("#splash").style.display="none",1500);
render();

if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(()=>{});
