// Java server is authoritative; browser storage is only used for the draft cart.
function javaRequest(path, body) {
  const request = new XMLHttpRequest();
  request.open(body === undefined ? 'GET' : 'POST', path, false);
  if (body !== undefined) request.setRequestHeader('Content-Type', 'application/json');
  request.send(body === undefined ? null : JSON.stringify(body));
  let result;
  try { result = JSON.parse(request.responseText); } catch { throw new Error('Respons server Java tidak valid.'); }
  if (request.status < 200 || request.status >= 300) throw new Error(result.error || 'Permintaan gagal.');
  return result;
}
let javaData = javaRequest('/api/store');
// Recheck server sessions when the browser restores a page through Back/Forward.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) location.reload();
});
function javaRefresh() { javaData = javaRequest('/api/store'); }
function javaRead(key, fallback) {
  return javaData[key] === undefined ? fallback : structuredClone(javaData[key]);
}
function javaWrite(key, value) {
  if (key.endsWith('_session')) { javaRefresh(); return; }
  javaRequest('/api/write', { key, value });
  javaRefresh();
}
window.addEventListener('error', (event) => {
  const message = event.error?.message;
  if (message && typeof toast === 'function') toast(message, 'error');
  else if (message && typeof publicToast === 'function') publicToast(message, 'error');
});
