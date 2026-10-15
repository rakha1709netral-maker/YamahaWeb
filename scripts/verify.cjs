// Integration checks against a running local server; restores the initial backup.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.NUSA_TEST_URL||'http://127.0.0.1:8080';
function client(){let cookie='';return async(route,body,status=200)=>{const response=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body),redirect:'manual'});const set=response.headers.get('set-cookie');if(set)cookie=set.split(';')[0];const text=await response.text();assert.equal(response.status,status,route+': '+text.slice(0,200));try{return JSON.parse(text)}catch{return text}};}
(async()=>{
 const guest=client(),owner=client(),sales=client(),member=client();
 assert.equal((await guest('/api/health')).status,'ok');
 const publicData=await guest('/api/store');assert.ok(!publicData.nusa_users);assert.ok(!publicData.nusa_pelanggan);
 await guest('/pages/produk.html',undefined,302);
 await guest('/api/write',{key:'nusa_kendaraan',value:[]},403);
 await owner('/api/login',{kind:'staff',username:'owner',password:'wrong'},403);
 await owner('/api/login',{kind:'staff',username:'owner',password:'owner123'});
 await sales('/api/login',{kind:'staff',username:'sales',password:'sales123'});
 await sales('/pages/produk.html',undefined,403);
 await sales('/api/write',{key:'nusa_kendaraan',value:[]},403);
 const backup=await owner('/api/backup');
 try {
   const state=await owner('/api/store');assert.ok(!JSON.stringify(state.nusa_users).includes('password_hash'));
   for(const file of fs.readdirSync(path.join(__dirname,'../web')).filter(f=>f.endsWith('.html')))await guest('/'+file,undefined,file==='member.html'?302:200);
   for(const file of fs.readdirSync(path.join(__dirname,'../web/pages')).filter(f=>f.endsWith('.html')))await owner('/pages/'+file);
   const vehicles=structuredClone(state.nusa_kendaraan);vehicles[0].thumbnail='data:image/png;base64,iVBORw0KGgo=';vehicles[0].stok=1;
   await owner('/api/write',{key:'nusa_kendaraan',value:vehicles});
   assert.equal((await guest('/api/store')).nusa_kendaraan[0].thumbnail,vehicles[0].thumbnail);
   const promo={id:9999,nama:'Integration fixture',kode:'VERIFY',persen:10,cakupan:'Produk',target_ids:[vehicles[0].id],target_nilai:'',minimal_transaksi:0,maksimal_diskon:100000000,mulai:'2000-01-01',selesai:'2099-12-31',status:'Aktif'};
   await owner('/api/write',{key:'nusa_diskon',value:[promo]});
   const order={items:[{vehicleId:vehicles[0].id,qty:1}],memberId:1,promoCode:'VERIFY',method:'Transfer'};
   const purchased=await sales('/api/checkout',order);const trx=purchased.nusa_transaksi.at(-1);
   assert.equal(trx.diskon,Math.round(vehicles[0].harga*.1));assert.equal(purchased.nusa_kendaraan[0].stok,0);
   assert.equal(purchased.nusa_pelanggan[0].poin,state.nusa_pelanggan[0].poin+Math.floor(trx.total/state.nusa_pengaturan.rupiah_per_poin));
   await sales('/api/checkout',order,403);
   await member('/api/login',{kind:'member',username:'dewi@mail.com',password:'member123'});
   assert.equal((await member('/api/store')).nusa_pelanggan.length,1);
   await member('/api/write',{key:'nusa_favorit',value:[{pelanggan_id:2,kendaraan_id:1}]},403);
   await member('/api/write',{key:'nusa_favorit',value:[{pelanggan_id:1,kendaraan_id:1}]});
   await guest('/api/lead',{kendaraan_id:1,kendaraan:vehicles[0].nama,nama:'Integration fixture',telepon:'0000',tipe:'Penawaran',tanggal:'2026-10-08'});
   assert.equal((await owner('/api/store')).nusa_leads.at(-1).nama,'Integration fixture');
   console.log('PASS: 29 routes, authentication, role protection, thumbnail storage, targeted promo, stock, points, member isolation, favorites, and leads.');
 } finally {await owner('/api/restore',{data:backup});}
})().catch(e=>{console.error(e);process.exitCode=1;});
