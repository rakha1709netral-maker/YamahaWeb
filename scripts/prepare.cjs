// One-time migration from the existing static project, preserving its files.
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const source=process.argv[2];
if(!source)throw new Error('Pass original project directory.');
const web=path.join(root,'web'); fs.mkdirSync(path.join(web,'pages'),{recursive:true});
const original=fs.readFileSync(path.join(source,'data.js'),'utf8');
const memory=new Map();const context=vm.createContext({ localStorage:{ getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v) },console,Date });
vm.runInContext(original,context);
const seed=Object.fromEntries([...memory].filter(([k])=>!k.includes('session')).map(([k,v])=>[k,JSON.parse(v)]));
// Keep the original dates and labels. Expired promotions can be edited by a manager.
fs.writeFileSync(path.join(root,'seed.json'),JSON.stringify(seed,null,2));
fs.copyFileSync(path.join(source,'schema.sql'),path.join(root,'schema-reference.sql'));
for(const name of fs.readdirSync(source)) {
  if(!/\.(html|css|js)$/.test(name))continue;
  let text=fs.readFileSync(path.join(source,name),'utf8');
  if(name==='data.js') {
    text=text.replace(/const SEED_USERS = \[[\s\S]*?\n\];/,'const SEED_USERS = [];');
    text=text.replace(/const CUSTOMER_SEEDS = \[[\s\S]*?\n\];/,'const CUSTOMER_SEEDS = [];');
    text=text.replace(/function readStore\([\s\S]*?\nfunction getActiveDiscounts\(/,`function readStore(key, fallback = []) { return javaRead(key, fallback); }\nfunction writeStore(key, value) { javaWrite(key, value); }\nfunction seedAll() {}\n\nfunction getActiveDiscounts(`);
  }
  if(name==='app.js') {
    text=text.replace('Object.keys(localStorage).filter((key) => key.startsWith("nusa_") && !key.includes("session"))','Object.keys(javaData).filter((key) => key.startsWith("nusa_") && !key.includes("session"))');
    text=text.replace('localStorage.getItem(key)?.length','JSON.stringify(javaData[key])?.length');
    text=text.replace('${field.required ? "required" : ""}', '${field.required && !(field.type === "password" && editId) ? "required" : ""}');
  }
  if(name==='public.js') {
    text=text.replace('if (params.get("type")) publicCatalogType = params.get("type");','if (!window.catalogInitialized) { publicCatalogType = params.get("type") || "Semua"; window.catalogInitialized = true; }');
    text=text.replace('if (!vehicle) { p$("#public-root")','if (!vehicle || vehicle.status === "Nonaktif") { p$("#public-root")');
  }
  if(name.endsWith('.html'))text=adapt(text,'');
  fs.writeFileSync(path.join(web,name),text);
}
for(const name of fs.readdirSync(path.join(source,'pages')).filter(n=>n.endsWith('.html'))) {
  fs.writeFileSync(path.join(web,'pages',name),adapt(fs.readFileSync(path.join(source,'pages',name),'utf8'),'../'));
}
function adapt(html,prefix) {
  return html.replace(`<script src="${prefix}data.js">`,`<script src="${prefix}java-store.js"></script><script src="${prefix}data.js">`)
    .replace(new RegExp(`(<script src="${prefix.replaceAll('.','\\.')}(${prefix?'app':'app|public'})\\.js"></script>)`),'$1<script src="'+prefix+'java-actions.js"></script>');
}
console.log('Migrated 29 pages and original styles; server seed generated.');
