// Adapters keep the existing screen layout while routing mutations to Java.
const WEBSITE_DEFAULTS = {
  tagline:'Motor & Mobil Pilihan', footer_deskripsi:'Showroom motor dan mobil pilihan dengan informasi stok transparan, promo terhubung, dan layanan konsultasi personal.',
  jam_buka:'', maps_url:'', instagram_url:'', footer_credit:'Semua harga dapat berubah sesuai kebijakan dealer.', footer_layanan:'Motor • Mobil • Trade-in • Pembiayaan',
  hero_label:'MOTOR & MOBIL PILIHAN', hero_judul:'Kendaraan yang tepat untuk langkah berikutnya.', hero_deskripsi:'Bandingkan unit, lihat harga promo, hitung cicilan, dan jadwalkan test drive tanpa perlu login.',
  kategori_judul:'Pilih gaya berkendara Anda.', unggulan_judul:'Unit unggulan minggu ini.', member_judul:'Setiap perjalanan memberi Anda nilai lebih.', member_deskripsi:'Masuk hanya saat ingin mengecek poin, histori pembelian, kendaraan favorit, dan promo khusus member.',
  warna_utama:'#ef3d23', home_order:['hero','kategori','unggulan','layanan','member'], home_hidden:[]
};
const websiteSettings = () => ({...WEBSITE_DEFAULTS,...readStore('nusa_pengaturan',{})});
const HOME_BLOCKS = {hero:['Banner utama','.auto-hero'],kategori:['Kategori motor/mobil','.quick-explore'],unggulan:['Kendaraan unggulan','.featured-stock'],layanan:['Keunggulan layanan','.service-band'],member:['Ajakan member','.member-cta']};
if (typeof renderSettings === 'function') {
  const originalSettings = renderSettings;
  renderSettings = function() {
    originalSettings(); const s=websiteSettings();
    const fields = [['tagline','Tagline dealer'],['footer_deskripsi','Deskripsi footer'],['jam_buka','Jam operasional'],['maps_url','Tautan lokasi Google Maps'],['instagram_url','Tautan Instagram'],['footer_credit','Catatan / credit footer'],['footer_layanan','Daftar layanan footer'],['hero_label','Label banner'],['hero_judul','Judul banner'],['hero_deskripsi','Deskripsi banner'],['kategori_judul','Judul kategori'],['unggulan_judul','Judul kendaraan unggulan'],['member_judul','Judul ajakan member'],['member_deskripsi','Deskripsi ajakan member']];
    $('#page-root form').insertAdjacentHTML('beforeend',`<section class="card" style="grid-column:1/-1;padding:24px"><div class="card-head"><div><span class="card-kicker">WEBSITE CUSTOMER</span><h2>Konten, footer & susunan beranda</h2><p>Alamat, telepon, email dan WhatsApp mengikuti Informasi publik di atas. Gunakan tombol panah untuk mengatur susunan bagian.</p></div></div><div class="form-grid">${fields.map(([key,label])=>fieldInput('web_'+key,label,s[key],key.endsWith('_url')?'url':'text',false,'full')).join('')}${fieldInput('web_warna_utama','Warna aksen',s.warna_utama,'color')}</div><h3 style="margin:24px 0 12px">Urutan bagian beranda</h3><div id="website-blocks">${s.home_order.map(key=>`<div data-block="${key}" style="display:flex;gap:12px;align-items:center;padding:12px;border-bottom:1px solid #ddd"><label style="flex:1"><input type="checkbox" ${s.home_hidden.includes(key)?'':'checked'}> ${HOME_BLOCKS[key][0]}</label><button type="button" class="btn btn-secondary" onclick="moveHomeBlock(this,-1)" aria-label="Naikkan ${HOME_BLOCKS[key][0]}">↑</button><button type="button" class="btn btn-secondary" onclick="moveHomeBlock(this,1)" aria-label="Turunkan ${HOME_BLOCKS[key][0]}">↓</button></div>`).join('')}</div><p style="margin:12px 0">Hilangkan centang untuk menyembunyikan bagian. Minimal satu bagian harus tampil.</p><button class="btn btn-primary" type="submit">Simpan semua pengaturan</button></section>`);
  };
  window.moveHomeBlock = function(button,direction) {
    const row=button.closest('[data-block]'); const neighbor=direction<0?row.previousElementSibling:row.nextElementSibling;
    if(neighbor) direction<0?row.parentNode.insertBefore(row,neighbor):row.parentNode.insertBefore(neighbor,row);
  };
  saveSettings = function() {
    const form=$('#page-root form'); if(!form.reportValidity())return;
    const s=websiteSettings();
    for(const key of Object.keys(WEBSITE_DEFAULTS)) if(!Array.isArray(WEBSITE_DEFAULTS[key]))s[key]=valueOf('web_'+key);
    s.home_order=$$('#website-blocks [data-block]').map(row=>row.dataset.block);
    s.home_hidden=$$('#website-blocks [data-block]').filter(row=>!row.querySelector('input').checked).map(row=>row.dataset.block);
    for(const key of ['nama_dealer','telepon','whatsapp','email','alamat'])s[key]=valueOf(key);
    for(const key of ['pajak_persen','rupiah_per_poin','batas_stok_min'])s[key]=Number(valueOf(key));
    s.notif_stok_min=$('#f-notif_stok_min').checked;
    try{writeStore('nusa_pengaturan',s);toast('Informasi dan layout website berhasil disimpan.');}catch(error){toast(error.message,'error');}
  };
}
if (typeof renderPublicHeader === 'function') {
  const originalHeader=renderPublicHeader, originalHome=renderPublicHome;
  renderPublicHeader=function(active) {
    originalHeader(active); const s=websiteSettings();
    p$('#public-header .public-brand strong').textContent=s.nama_dealer||APP.name;
    p$('#public-header .public-brand small').textContent=s.tagline;
    if(/^#[0-9a-f]{6}$/i.test(s.warna_utama))document.documentElement.style.setProperty('--auto-red',s.warna_utama);
  };
  renderPublicFooter=function() {
    const s=websiteSettings();const safeLink=(url,label)=>/^https?:\/\//i.test(url)?`<a href="${pEsc(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`:'';
    p$('#public-footer').innerHTML=`<div class="footer-main"><div><a class="public-brand light" href="index.html"><span>NM</span><div><strong>${pEsc(s.nama_dealer||APP.name)}</strong><small>${pEsc(s.tagline)}</small></div></a><p>${pEsc(s.footer_deskripsi)}</p></div><div><b>Jelajahi</b><a href="catalog.html">Stok kendaraan</a><a href="promo.html">Program promo</a><a href="credit.html">Simulasi kredit</a></div><div><b>Layanan</b><a href="member-login.html">Member Nusa</a><a href="catalog.html">Jadwalkan test drive</a><a href="staff-login.html">Portal staff</a>${safeLink(s.instagram_url,'Instagram')}${s.whatsapp?`<a href="https://wa.me/${pEsc(String(s.whatsapp).replace(/\D/g,''))}" target="_blank" rel="noopener noreferrer">WhatsApp showroom</a>`:''}</div><div><b>Showroom</b><span>${pEsc(s.alamat)}</span><span>${pEsc(s.telepon)}</span><span>${pEsc(s.email)}</span><span>${pEsc(s.jam_buka)}</span>${safeLink(s.maps_url,'Lihat lokasi / denah →')}</div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${pEsc(s.nama_dealer||APP.name)}. ${pEsc(s.footer_credit)}</span><span>${pEsc(s.footer_layanan)}</span></div>`;
  };
  renderPublicHome=function() {
    originalHome();const s=websiteSettings();
    const text={'.auto-hero-copy .hero-kicker':s.hero_label,'.auto-hero-copy h1':s.hero_judul,'.auto-hero-copy > p':s.hero_deskripsi,'.quick-explore h2':s.kategori_judul,'.featured-stock h2':s.unggulan_judul,'.member-cta h2':s.member_judul,'.member-cta p':s.member_deskripsi};
    for(const [selector,value] of Object.entries(text)){const element=p$(selector);if(element)element.textContent=value;}
    for(const key of s.home_order){const element=p$(HOME_BLOCKS[key][1]);if(element){element.hidden=s.home_hidden.includes(key);if(element.hidden)element.style.display='none';p$('#public-root').appendChild(element);}}
  };
}
if (typeof login === 'function') {
  login = function(username, password) {
    try { const account = javaRequest('/api/login', { kind: 'staff', username, password }); javaRefresh(); return account; }
    catch { return null; }
  };
  logout = function() { javaRequest('/api/logout', { kind: 'staff' }); location.href = '/staff-login.html'; };
  checkout = function() {
    try {
      javaData = javaRequest('/api/checkout', { items: posCart, memberId: Number($('#checkout-member').value || 0), promoCode: posPromoCode, method: $('#checkout-method').value });
      posCart = []; posPromoCode = ''; saveCart(); renderPOS(); toast('Penjualan tersimpan. Stok dan poin diperbarui.');
    } catch (error) { toast(error.message, 'error'); }
  };
  exportBackup = function() {
    const backup = javaRequest('/api/backup');
    downloadBlob(JSON.stringify({ app: APP.name, version: 3, data: backup }, null, 2), `nusa-java-${today()}.json`, 'application/json');
  };
  importBackup = async function(event) {
    try {
      const file = event.target.files?.[0]; if (!file) return;
      const backup = JSON.parse(await file.text());
      if (backup.app !== APP.name || !backup.data) throw new Error('Backup tidak valid.');
      if (!confirm('Ganti seluruh data dengan backup ini?')) return;
      javaData = javaRequest('/api/restore', { data: backup.data }); renderBackup(); toast('Backup dipulihkan.');
    } catch(error) { toast(error.message, 'error'); }
  };
  resetDemoData = function() {
    if (!confirm('Reset data server ke data demo?')) return;
    javaData = javaRequest('/api/reset', {}); renderBackup(); toast('Data demo dipulihkan.');
  };
}
if (typeof loginMember === 'function') {
  loginMember = function() {
    try { javaRequest('/api/login', { kind:'member', username:p$('#member-email').value.trim(), password:p$('#member-password').value }); location.href = memberReturnUrl(); }
    catch(error) { publicToast(error.message, 'error'); }
  };
  registerMember = function() {
    try {
      const email=p$('#reg-email').value.trim(),password=p$('#reg-password').value;
      javaRequest('/api/register', { email, password, nama:p$('#reg-name').value.trim(), telepon:p$('#reg-phone').value.trim() });
      javaRequest('/api/login', { kind:'member', username:email, password }); location.href=memberReturnUrl();
    } catch(error) { publicToast(error.message,'error'); }
  };
  memberLogout = function() { javaRequest('/api/logout',{kind:'member'}); location.href='/index.html'; };
  submitLead = function(vehicleId,type) {
    try {
      const vehicle=readStore('nusa_kendaraan',[]).find(v=>v.id===vehicleId);
      javaRequest('/api/lead', { kendaraan_id:vehicleId, kendaraan:vehicle.nama, tipe:type, tanggal:p$('#lead-date')?.value || new Date().toISOString().slice(0,10), nama:p$('#lead-name').value.trim(), telepon:p$('#lead-phone').value.trim(), email:p$('#lead-email').value.trim(), catatan:p$('#lead-note').value.trim() });
      p$('#public-modal').remove(); publicToast('Permintaan terkirim ke tim showroom.');
    } catch(error) { publicToast(error.message,'error'); }
  };
}
