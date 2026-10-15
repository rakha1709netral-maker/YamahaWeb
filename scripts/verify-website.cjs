const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const base='http://127.0.0.1:8080';
function client(){let cookie='';return async(path,body,status=200)=>{const r=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{Cookie:cookie,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});for(const c of r.headers.getSetCookie())cookie=c.split(';')[0];assert.equal(r.status,status,path);return r.json();};}
(async()=>{
 const owner=client(),sales=client(),guest=client();
 await owner('/api/login',{kind:'staff',username:'owner',password:'owner123'});
 await sales('/api/login',{kind:'staff',username:'sales',password:'sales123'});
 const previous=(await owner('/api/store')).nusa_pengaturan;
 const settings={...previous,nama_dealer:'Showroom <uji>',footer_deskripsi:'Alamat <script>contoh</script>',maps_url:'https://maps.google.com/?q=Jakarta',instagram_url:'https://instagram.com/example',warna_utama:'#123456',home_order:['member','kategori','hero','layanan','unggulan'],home_hidden:['layanan']};
 try{
   await sales('/api/write',{key:'nusa_pengaturan',value:settings},403);
   await guest('/api/write',{key:'nusa_pengaturan',value:settings},403);
   await owner('/api/write',{key:'nusa_pengaturan',value:{...settings,maps_url:'javascript:alert(1)'}},403);
   await owner('/api/write',{key:'nusa_pengaturan',value:{...settings,home_order:['hero']}},403);
   await owner('/api/write',{key:'nusa_pengaturan',value:{...settings,home_hidden:settings.home_order}},403);
   await owner('/api/write',{key:'nusa_pengaturan',value:settings});
   assert.deepEqual((await guest('/api/store')).nusa_pengaturan,settings);
   const nodes=new Map(),order=[];const selectors={hero:'.auto-hero',kategori:'.quick-explore',unggulan:'.featured-stock',layanan:'.service-band',member:'.member-cta'};
   const node=s=>{if(!nodes.has(s))nodes.set(s,{selector:s,style:{},appendChild:n=>order.push(n.selector)});return nodes.get(s);};
   const context=vm.createContext({readStore:()=>settings,renderPublicHeader(){},renderPublicHome(){},p$:node,pEsc:s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),APP:{name:'Nusa Motors'},document:{documentElement:{style:{setProperty(){}}}},Date,console});
   vm.runInContext(fs.readFileSync('web/java-actions.js','utf8'),context);
   vm.runInContext('renderPublicFooter();renderPublicHome();renderPublicHeader("home");',context);
   assert.ok(node('#public-footer').innerHTML.includes('Showroom &lt;uji&gt;'));
   assert.ok(!node('#public-footer').innerHTML.includes('<script>'));
   assert.ok(node('#public-footer').innerHTML.includes(settings.maps_url));
   assert.deepEqual(order,settings.home_order.map(k=>selectors[k]));
   assert.equal(node('.service-band').style.display,'none');
   console.log('PASS: owner-only editing, public persistence, URL/layout validation, escaped footer, section order and visibility.');
 }finally{await owner('/api/write',{key:'nusa_pengaturan',value:previous});}
})().catch(e=>{console.error(e);process.exitCode=1;});
