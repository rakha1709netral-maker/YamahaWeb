const assert = require('node:assert/strict');
const base = 'http://127.0.0.1:8080';
function browser() {
  const jar = new Map();
  return {
    cookies: () => [...jar].map(([k,v]) => `${k}=${v}`).join('; '),
    async request(route, body, replay) {
      const response = await fetch(base+route, {
        method: body === undefined ? 'GET' : 'POST', redirect: 'manual',
        headers: { Cookie: replay ?? this.cookies(), ...(body === undefined ? {} : {'Content-Type':'application/json'}) },
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      if (replay === undefined) for(const cookie of response.headers.getSetCookie()) {
        const pair=cookie.split(';')[0], separator=pair.indexOf('=');
        jar.set(pair.slice(0,separator),pair.slice(separator+1));
      }
      const text=await response.text(); let data; try{data=JSON.parse(text);}catch{data=text;}
      return {status:response.status,data,headers:response.headers};
    }
  };
}
async function login(b,kind) {
  const credentials=kind==='staff'?{username:'owner',password:'owner123'}:{username:'dewi@mail.com',password:'member123'};
  assert.equal((await b.request('/api/login',{kind,...credentials})).status,200);
}
(async()=>{
  const a=browser(),other=browser(); await login(other,'staff');
  for(const home of ['/','/index.html']) {
    await login(a,'staff');await login(a,'member');
    assert.equal((await a.request('/pages/dashboard.html')).status,200);
    assert.equal((await a.request('/member.html')).status,200);
    const old=a.cookies();const result=await a.request(home);
    assert.equal(result.status,200);assert.equal(result.headers.getSetCookie().length,2);
    const state=(await a.request('/api/store')).data;
    assert.equal(state.nusa_staff_session,null);assert.equal(state.nusa_member_session,null);
    assert.equal((await a.request('/pages/dashboard.html')).status,302);
    assert.equal((await a.request('/member.html')).status,302);
    assert.equal((await a.request('/api/store',undefined,old)).data.nusa_staff_session,null);
    assert.equal((await a.request('/api/store',undefined,old)).data.nusa_member_session,null);
    assert.equal((await a.request('/staff-login.html')).status,200);
    assert.equal((await a.request('/member-login.html')).status,200);
    assert.equal((await other.request('/pages/dashboard.html')).status,200);
  }
  await login(a,'staff');const previous=a.cookies();await login(a,'staff');
  assert.equal((await a.request('/api/store',undefined,previous)).data.nusa_staff_session,null);
  assert.equal((await a.request('/pages/dashboard.html')).status,200);
  await a.request('/api/logout',{kind:'staff'});await other.request('/api/logout',{kind:'staff'});
  console.log('PASS: home revokes both sessions, replay rejected, portal navigation preserved, other browsers unaffected, login rotates token.');
})().catch(error=>{console.error(error);process.exitCode=1;});
