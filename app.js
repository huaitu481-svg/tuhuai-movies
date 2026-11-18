const DEMOS=[
{id:"demo-1",title:"星际漫游",originalTitle:"Journey Beyond",category:"电影",region:"海外",year:2024,rating:8.7,summary:"一段关于未知星域、勇气与探索的原创演示片目。此条目仅用于展示界面。"},
{id:"demo-2",title:"山海之间",category:"纪录片",region:"国内",year:2023,rating:9.1,summary:"穿越山川与海岸，记录自然生态与人文故事。此条目仅用于展示界面。"},
{id:"demo-3",title:"像素冒险",originalTitle:"Pixel Quest",category:"动漫",region:"海外",year:2025,rating:8.4,summary:"一场充满想象力的动画冒险。此条目仅用于展示界面。"},
{id:"demo-4",title:"城市微光",category:"电视剧",region:"国内",year:2022,rating:8.2,summary:"普通人在城市生活中寻找希望与答案。此条目仅用于展示界面。"}
];
const $=s=>document.querySelector(s);
let movies=DEMOS,category="全部",region="全部",query="";
const favorites=new Set(JSON.parse(localStorage.getItem("xk_favorites")||"[]"));
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function filtered(){return movies.filter(m=>(category==="全部"||m.category===category)&&(region==="全部"||m.region===region)&&(!query||m.title.toLowerCase().includes(query.toLowerCase())||(m.originalTitle||"").toLowerCase().includes(query.toLowerCase())));}
function render(){
 const list=filtered();$("#movieGrid").innerHTML=list.length?list.map(m=>`<article class="movie-card" data-id="${esc(m.id)}"><div class="poster">${m.posterURL?`<img loading="lazy" src="${esc(m.posterURL)}" alt="">`:'<span class="film-icon">✦</span>'}<span class="rating">★ ${Number(m.rating).toFixed(1)}</span></div><div class="card-info"><div class="card-title">${esc(m.title)}</div><div class="meta">${esc(m.year)} · ${esc(m.region)} · ${esc(m.category)}</div><div class="card-summary">${esc(m.summary)}</div></div></article>`).join(""):'<div class="status">没有找到匹配内容。</div>';
 document.querySelectorAll(".movie-card").forEach(el=>el.addEventListener("click",()=>openDetail(el.dataset.id)));
}
function showStatus(msg){const s=$("#status");s.textContent=msg;s.hidden=false;}
function hideStatus(){$("#status").hidden=true;}
function openDetail(id){
 const m=movies.find(x=>x.id===id);if(!m)return;
 $("#detailContent").innerHTML=`<div class="detail-poster">${m.posterURL?`<img src="${esc(m.posterURL)}" style="width:100%;height:100%;object-fit:cover;border-radius:14px" alt="">`:"✦"}</div><div class="eyebrow">${esc(m.category)} · ${esc(m.region)} · ${esc(m.year)}</div><h2>${esc(m.title)}</h2><p class="muted">${esc(m.originalTitle||"")}</p><p class="muted">★ ${Number(m.rating).toFixed(1)}</p><p class="muted">${esc(m.summary)}</p><div class="detail-actions"><button class="primary" id="playBtn" ${m.playbackURL?"":"disabled"}>▶ 立即播放</button><button class="secondary" id="favBtn">${favorites.has(m.id)?"★ 已收藏":"☆ 收藏"}</button></div>${m.playbackURL?"":'<p class="tiny">此为演示片目，尚未配置获授权的播放地址。接入合法片库后才可播放。</p>'}`;
 $("#detailDialog").showModal();
 $("#favBtn").onclick=()=>{favorites.has(m.id)?favorites.delete(m.id):favorites.add(m.id);localStorage.setItem("xk_favorites",JSON.stringify([...favorites]));$("#favBtn").textContent=favorites.has(m.id)?"★ 已收藏":"☆ 收藏";};
 $("#playBtn").onclick=()=>{if(!m.playbackURL)return;const w=window.open("","_blank");if(w)w.document.write(`<video controls autoplay playsinline style="width:100%;height:100%;background:#000" src="${esc(m.playbackURL)}"></video>`);};
}
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).close());
$("#settingsBtn").onclick=()=>{$("#apiInput").value=localStorage.getItem("xk_api")||"";$("#localStats").textContent=`收藏 ${favorites.size} 部 · 浏览器本地保存`;$("#settingsDialog").showModal();};
$("#searchInput").addEventListener("input",e=>{query=e.target.value;render();});
$("#categoryChips").addEventListener("click",e=>{const b=e.target.closest("button[data-category]");if(!b)return;category=b.dataset.category;document.querySelectorAll(".chip").forEach(x=>x.classList.toggle("active",x===b));render();});
$("#regionBtn").onclick=()=>{region=region==="全部"?"国内":region==="国内"?"海外":"全部";$("#regionBtn").textContent=region+"地区⌄";render();};
$("#exploreBtn").onclick=()=>document.querySelector("#movieGrid").scrollIntoView({behavior:"smooth"});
$("#refreshBtn").onclick=loadCatalog;
$("#saveApi").onclick=()=>{const v=$("#apiInput").value.trim();localStorage.setItem("xk_api",v);$("#settingsDialog").close();loadCatalog();};
$("#clearApi").onclick=()=>{localStorage.removeItem("xk_api");movies=DEMOS;$("#settingsDialog").close();hideStatus();render();};
$("#dismissTip").onclick=()=>{$("#installTip").remove();localStorage.setItem("xk_tip_hidden","1");};
async function loadCatalog(){
 const base=localStorage.getItem("xk_api");if(!base){showStatus("当前为界面演示片库。要显示真实内容，请在设置中配置你有权使用的合法片库 API。");return;}
 try{const root=base.replace(/\/+$/,"");const res=await fetch(root+"/catalog",{headers:{Accept:"application/json"}});if(!res.ok)throw new Error("HTTP "+res.status);const data=await res.json();if(!Array.isArray(data.items))throw new Error("API 格式错误：需要 items 数组");movies=data.items;hideStatus();render();}
 catch(e){showStatus("片库加载失败："+e.message+"。已保留当前片目。");}
}
if(localStorage.getItem("xk_tip_hidden")==="1")$("#installTip").remove();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
render();if(localStorage.getItem("xk_api"))loadCatalog();
