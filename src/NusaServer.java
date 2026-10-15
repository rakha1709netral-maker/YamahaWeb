import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.channels.*;
import java.security.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/** Local Java web application. No Maven, application server, or IDE required. */
public final class NusaServer {
    private final Path root, web, file;
    private Map<String,Object> db;
    private final Map<String,Session> sessions = new ConcurrentHashMap<>();
    private final int port;
    private record Session(long id, String kind, Instant expires) {}
    private static final Set<String> PUBLIC = Set.of("nusa_kendaraan","nusa_kategori","nusa_diskon","nusa_pengaturan");
    private static final Set<String> OWNER = Set.of("nusa_users","nusa_pengaturan","nusa_login_logs");
    private static final Set<String> MANAGER = Set.of("nusa_kendaraan","nusa_kategori","nusa_supplier","nusa_diskon","nusa_stok","nusa_karyawan");
    private static final Set<String> OWNER_PAGES = Set.of("users","pengaturan","riwayat-login","backup","laporan-laba");
    private static final Set<String> MANAGER_PAGES = Set.of("produk","kategori","supplier","stok","diskon","karyawan","laporan-penjualan");
    @SuppressWarnings("unchecked") static Map<String,Object> map(Object o) { if (!(o instanceof Map)) throw new IllegalArgumentException("Expected object"); return (Map<String,Object>)o; }
    @SuppressWarnings("unchecked") static List<Object> list(Object o) { if (!(o instanceof List)) throw new IllegalArgumentException("Expected array"); return (List<Object>)o; }
    static String str(Object o) { return o == null ? "" : o.toString(); }
    static long num(Object o) { return o == null || str(o).isBlank() ? 0 : Math.round(Double.parseDouble(str(o))); }
    static Map<String,Object> obj(Object... values) { Map<String,Object> m = new LinkedHashMap<>(); for(int i=0;i<values.length;i+=2)m.put(str(values[i]),values[i+1]); return m; }
    List<Object> rows(String key) { return list(db.getOrDefault(key,new ArrayList<>())); }
    Map<String,Object> find(String key,long id) { return rows(key).stream().map(NusaServer::map).filter(r->num(r.get("id"))==id).findFirst().orElse(null); }
    long next(String key) { return rows(key).stream().map(NusaServer::map).mapToLong(r->num(r.get("id"))).max().orElse(0)+1; }
    NusaServer(Path root,int port) throws Exception {
        this.root=root; this.web=root.resolve("web"); this.file=root.resolve("data/store.json"); this.port=port;
        Files.createDirectories(file.getParent());
        db=map(Json.parse(Files.readString(Files.exists(file)?file:root.resolve("seed.json"))));
        for(String key:List.of("nusa_users","nusa_pelanggan")) for(Object v:rows(key)) { Map<String,Object> r=map(v); if(r.containsKey("password")) { r.put("password_hash",hash(str(r.remove("password")))); } }
        save();
    }
    void save() throws IOException {
        Path temp=file.resolveSibling("store.tmp"); Files.writeString(temp,Json.stringify(db),StandardCharsets.UTF_8);
        if(Files.exists(file)) Files.copy(file,file.resolveSibling("store.previous.json"),StandardCopyOption.REPLACE_EXISTING);
        try { Files.move(temp,file,StandardCopyOption.ATOMIC_MOVE,StandardCopyOption.REPLACE_EXISTING); }
        catch(AtomicMoveNotSupportedException e){ Files.move(temp,file,StandardCopyOption.REPLACE_EXISTING); }
    }
    static String hash(String password) throws Exception {
        byte[] salt=new byte[16]; new SecureRandom().nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt)+":"+Base64.getEncoder().encodeToString(derive(password,salt));
    }
    static byte[] derive(String password,byte[] salt) throws Exception { return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(new PBEKeySpec(password.toCharArray(),salt,120000,256)).getEncoded(); }
    static boolean verify(String password,String stored) throws Exception { String[] parts=stored.split(":"); return parts.length==2 && MessageDigest.isEqual(Base64.getDecoder().decode(parts[1]),derive(password,Base64.getDecoder().decode(parts[0]))); }
    void revokeSession(HttpExchange x,String kind) {
        revokeSession(x,kind,true);
    }
    void revokeSession(HttpExchange x,String kind,boolean clearCookie) {
        String cookie=x.getRequestHeaders().getFirst("Cookie");
        if(cookie!=null) for(String part:cookie.split(";")) {
            String[] pair=part.trim().split("=",2);
            if(pair.length==2 && pair[0].equals("nusa_"+kind)) sessions.remove(pair[1]);
        }
        if(clearCookie)x.getResponseHeaders().add("Set-Cookie","nusa_"+kind+"=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0");
    }
    Session session(HttpExchange x,String kind) {
        String cookie=x.getRequestHeaders().getFirst("Cookie"); if(cookie==null)return null;
        for(String part:cookie.split(";")) { String[] pair=part.trim().split("=",2); if(pair.length==2 && pair[0].equals("nusa_"+kind)) { Session s=sessions.get(pair[1]); if(s!=null && s.kind.equals(kind) && s.expires.isAfter(Instant.now()))return s; } } return null;
    }
    Map<String,Object> user(HttpExchange x,String kind) { Session s=session(x,kind); if(s==null)return null; Map<String,Object> u=find(kind.equals("staff")?"nusa_users":"nusa_pelanggan",s.id); return u!=null && !"Nonaktif".equals(u.get("status"))?u:null; }
    String role(HttpExchange x) { Map<String,Object> u=user(x,"staff"); return u==null?"":str(u.get("role")); }
    Map<String,Object> clean(Map<String,Object> row) { Map<String,Object> m=new LinkedHashMap<>(row); m.remove("password"); m.remove("password_hash"); return m; }
    Object cleanValue(Object value) { if(value instanceof List<?> a)return a.stream().map(v->v instanceof Map<?,?>?clean(map(v)):v).toList(); return value; }
    Map<String,Object> snapshot(HttpExchange x) {
        Map<String,Object> out=new LinkedHashMap<>(); String role=role(x); Map<String,Object> member=user(x,"member");
        for(var e:db.entrySet()) { String k=e.getKey(); Object v=e.getValue();
            if(!role.isEmpty()) { if(k.equals("nusa_users") && !role.equals("owner")) v=List.of(user(x,"staff")); out.put(k,cleanValue(v)); }
            else if(PUBLIC.contains(k)) { if(k.equals("nusa_kendaraan")) v=list(v).stream().filter(r->!"Nonaktif".equals(map(r).get("status"))).toList(); out.put(k,v); }
        }
        if(role.isEmpty() && member!=null) { out.put("nusa_pelanggan",List.of(clean(member))); out.put("nusa_transaksi",rows("nusa_transaksi").stream().filter(r->num(map(r).get("pelanggan_id"))==num(member.get("id"))).toList()); out.put("nusa_favorit",rows("nusa_favorit").stream().filter(r->r instanceof Map && num(map(r).get("pelanggan_id"))==num(member.get("id"))).toList()); }
        out.put("nusa_staff_session",user(x,"staff")==null?null:clean(user(x,"staff")));
        out.put("nusa_member_session",member==null?null:clean(member)); return out;
    }
    Object body(HttpExchange x) throws IOException { byte[] bytes=x.getRequestBody().readNBytes(32*1024*1024+1); if(bytes.length>32*1024*1024)throw new IllegalArgumentException("Data maksimal 32 MB"); return Json.parse(new String(bytes,StandardCharsets.UTF_8)); }
    void respond(HttpExchange x,int status,Object value) throws IOException { byte[] bytes=Json.stringify(value).getBytes(StandardCharsets.UTF_8); x.getResponseHeaders().set("Content-Type","application/json; charset=utf-8"); x.getResponseHeaders().set("Cache-Control","no-store"); x.sendResponseHeaders(status,bytes.length); x.getResponseBody().write(bytes); }
    void require(boolean condition,String message) { if(!condition)throw new SecurityException(message); }
    synchronized void api(HttpExchange x) throws Exception {
        String path=x.getRequestURI().getPath(),method=x.getRequestMethod(),role=role(x);
        if(method.equals("GET") && path.equals("/api/health")){respond(x,200,obj("status","ok","runtime","Java "+System.getProperty("java.version")));return;}
        if(method.equals("GET") && path.equals("/api/store")){respond(x,200,snapshot(x));return;}
        if(method.equals("GET") && path.equals("/api/backup")){require(role.equals("owner"),"Hanya owner");respond(x,200,db);return;}
        require(method.equals("POST"),"Metode tidak diizinkan");
        String origin=x.getRequestHeaders().getFirst("Origin"); require(origin==null || origin.equals("http://localhost:"+port) || origin.equals("http://127.0.0.1:"+port),"Origin ditolak");
        require(str(x.getRequestHeaders().getFirst("Content-Type")).startsWith("application/json"),"Content-Type harus JSON");
        Map<String,Object> input=map(body(x));
        if(path.equals("/api/restore")){
            require(role.equals("owner"),"Hanya owner");Map<String,Object> restored=map(input.get("data"));
            require(restored.keySet().containsAll(db.keySet()),"Backup tidak lengkap");
            Map<String,Object> candidate=new LinkedHashMap<>();
            for(String key:db.keySet()){Object value=restored.get(key);if(key.equals("nusa_pengaturan"))map(value);else list(value);candidate.put(key,value);}
            for(String key:List.of("nusa_users","nusa_pelanggan"))for(Object v:list(candidate.get(key))){Map<String,Object> r=map(v);if(r.containsKey("password"))r.put("password_hash",hash(str(r.remove("password"))));require(r.containsKey("password_hash"),"Backup akun harus memiliki password/hash");}
            validateSettings(map(candidate.get("nusa_pengaturan")));db=candidate;save();respond(x,200,snapshot(x));return;
        }
        if(path.equals("/api/login")) {
            String kind=str(input.get("kind")); require(Set.of("staff","member").contains(kind),"Jenis akun salah");
            String key=kind.equals("staff")?"nusa_users":"nusa_pelanggan",field=kind.equals("staff")?"username":"email";
            Map<String,Object> found=rows(key).stream().map(NusaServer::map).filter(r->str(r.get(field)).equalsIgnoreCase(str(input.get("username")))).findFirst().orElse(null);
            require(found!=null && !"Nonaktif".equals(found.get("status")) && verify(str(input.get("password")),str(found.get("password_hash"))),"Username/email atau password tidak sesuai");
            revokeSession(x,kind,false);
            String token=UUID.randomUUID().toString()+UUID.randomUUID(); sessions.put(token,new Session(num(found.get("id")),kind,Instant.now().plusSeconds(28800)));
            x.getResponseHeaders().add("Set-Cookie","nusa_"+kind+"="+token+"; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800");
            if(kind.equals("staff")){rows("nusa_login_logs").add(obj("id",System.currentTimeMillis(),"user_id",found.get("id"),"nama",found.get("nama"),"username",found.get("username"),"role",found.get("role"),"waktu",Instant.now().toString()));save();}
            respond(x,200,clean(found));return;
        }
        if(path.equals("/api/logout")) { String kind=str(input.get("kind"));require(Set.of("staff","member").contains(kind),"Jenis akun salah");revokeSession(x,kind);respond(x,200,obj("ok",true));return; }
        if(path.equals("/api/register")) { String email=str(input.get("email")).trim().toLowerCase(),password=str(input.get("password"));require(email.contains("@") && password.length()>=6 && !str(input.get("nama")).isBlank(),"Isi nama, email dan password minimal 6 karakter");require(rows("nusa_pelanggan").stream().noneMatch(r->email.equalsIgnoreCase(str(map(r).get("email")))),"Email sudah terdaftar");rows("nusa_pelanggan").add(obj("id",next("nusa_pelanggan"),"nama",input.get("nama"),"email",email,"telepon",input.get("telepon"),"password_hash",hash(password),"alamat","","tier","Bronze","poin",0,"status","Aktif","bergabung",LocalDate.now().toString()));save();respond(x,200,obj("ok",true));return; }
        if(path.equals("/api/lead")){require(find("nusa_kendaraan",num(input.get("kendaraan_id")))!=null && !str(input.get("nama")).isBlank() && !str(input.get("telepon")).isBlank(),"Data prospek tidak lengkap");input.put("id",next("nusa_leads"));input.put("status","Baru");rows("nusa_leads").add(input);save();respond(x,200,obj("ok",true));return;}
        if(path.equals("/api/checkout")){require(!role.isEmpty(),"Login staff diperlukan"); checkout(input,user(x,"staff"));save();respond(x,200,snapshot(x));return;}
        if(path.equals("/api/reset")){require(role.equals("owner"),"Hanya owner");Map<String,Object> restored=map(Json.parse(Files.readString(root.resolve("seed.json"))));for(String key:List.of("nusa_users","nusa_pelanggan"))for(Object v:list(restored.get(key))){Map<String,Object> r=map(v);r.put("password_hash",hash(str(r.remove("password"))));}db=restored;save();respond(x,200,snapshot(x));return;}
        if(path.equals("/api/write")){
            String key=str(input.get("key"));Object value=input.get("value");require(db.containsKey(key),"Data tidak dikenal");
            if(key.equals("nusa_favorit") && user(x,"member")!=null && role.isEmpty()){long id=num(user(x,"member").get("id"));List<Object> merged=new ArrayList<>(rows(key).stream().filter(r->r instanceof Map && num(map(r).get("pelanggan_id"))!=id).toList());for(Object v:list(value)){Map<String,Object> r=map(v);require(num(r.get("pelanggan_id"))==id,"Favorit milik member lain");require(find("nusa_kendaraan",num(r.get("kendaraan_id")))!=null,"Kendaraan tidak ada");merged.add(r);}value=merged;}
            else {
                require(!role.isEmpty(),"Login staff diperlukan");
                if(OWNER.contains(key))require(role.equals("owner") || key.equals("nusa_users"),"Hanya owner");
                if(MANAGER.contains(key))require(role.equals("owner")||role.equals("manajer"),"Hanya owner/manajer");
                if(key.equals("nusa_users")||key.equals("nusa_pelanggan")){
                    List<Object> incoming=new ArrayList<>(list(value));
                    if(key.equals("nusa_users")&&!role.equals("owner")){Map<String,Object> own=user(x,"staff");require(incoming.size()==1 && num(map(incoming.getFirst()).get("id"))==num(own.get("id")),"Hanya profil sendiri");map(incoming.getFirst()).put("role",own.get("role"));List<Object> merged=new ArrayList<>(rows(key).stream().filter(r->num(map(r).get("id"))!=num(own.get("id"))).toList());merged.addAll(incoming);incoming=merged;}
                    for(Object v:incoming){Map<String,Object> r=map(v),old=find(key,num(r.get("id")));String password=str(r.remove("password"));r.put("password_hash",!password.isBlank()?hash(password):old==null?hash(UUID.randomUUID().toString()):old.get("password_hash"));}
                    value=incoming;
                }
            }
            if(key.equals("nusa_pengaturan"))validateSettings(map(value));else list(value);
            db.put(key,value);save();respond(x,200,obj("ok",true));return;
        }
        respond(x,404,obj("error","Endpoint tidak ditemukan"));
    }
    void validateSettings(Map<String,Object> settings) {
        require(!str(settings.get("nama_dealer")).isBlank(),"Nama dealer wajib diisi");
        for(String key:List.of("maps_url","instagram_url")) {
            String url=str(settings.get(key));
            if(!url.isBlank()){URI uri=URI.create(url);require(Set.of("http","https").contains(str(uri.getScheme()).toLowerCase())&&uri.getHost()!=null,"Tautan harus berupa alamat http/https yang valid");}
        }
        if(settings.containsKey("warna_utama"))require(str(settings.get("warna_utama")).matches("#[a-fA-F0-9]{6}"),"Warna tidak valid");
        Set<String> blocks=Set.of("hero","kategori","unggulan","layanan","member");
        if(settings.containsKey("home_order")){List<Object> order=list(settings.get("home_order"));require(order.size()==5&&new HashSet<>(order).equals(blocks),"Urutan beranda harus memuat setiap bagian tepat sekali");}
        if(settings.containsKey("home_hidden")){List<Object> hidden=list(settings.get("home_hidden"));require(hidden.size()<5&&blocks.containsAll(hidden)&&new HashSet<>(hidden).size()==hidden.size(),"Minimal satu bagian beranda harus tampil");}
        for(Object v:settings.values())if(v instanceof String s)require(s.length()<=2000,"Teks pengaturan maksimal 2000 karakter");
        require(num(settings.get("rupiah_per_poin"))>0,"Rupiah per poin harus lebih dari nol");
    }
    void checkout(Map<String,Object> input,Map<String,Object> staff) {
        List<Object> items=list(input.get("items"));require(!items.isEmpty(),"Keranjang kosong");
        Map<String,Object> member=find("nusa_pelanggan",num(input.get("memberId"))),settings=map(db.get("nusa_pengaturan"));
        long subtotal=0,discount=0; List<Object> details=new ArrayList<>();Set<Long> seen=new HashSet<>();List<String> promos=new ArrayList<>();long id=next("nusa_transaksi");String code="INV-"+System.currentTimeMillis();
        for(Object v:items){Map<String,Object> item=map(v);long vehicleId=num(item.get("vehicleId")),qty=num(item.get("qty"));Map<String,Object> vehicle=find("nusa_kendaraan",vehicleId);require(seen.add(vehicleId)&&vehicle!=null&&qty>0&&qty<=num(vehicle.get("stok"))&&"Tersedia".equals(vehicle.get("status")),"Stok tidak mencukupi atau unit tidak tersedia");long gross=Math.multiplyExact(num(vehicle.get("harga")),qty),cut=0;String promoName="";
            for(Object p:rows("nusa_diskon")){Map<String,Object> promo=map(p);String date=LocalDate.now().toString(),promoCode=str(promo.get("kode")),scope=str(promo.get("cakupan")),target=str(promo.get("target_nilai"));if(!"Aktif".equals(promo.get("status"))||date.compareTo(str(promo.get("mulai")))<0||date.compareTo(str(promo.get("selesai")))>0||gross<num(promo.get("minimal_transaksi"))||(!promoCode.isBlank()&&!promoCode.equalsIgnoreCase(str(input.get("promoCode")))))continue;
                boolean match=switch(scope){case "Semua"->true;case "Produk"->list(promo.get("target_ids")).stream().anyMatch(t->num(t)==vehicleId);case "Jenis"->target.equals(vehicle.get("jenis"));case "Merek"->target.equals(vehicle.get("merek"));case "Member"->member!=null&&target.equals(member.get("tier"));default->false;};
                if(match){long max=num(promo.get("maksimal_diskon"));long amount=Math.min(gross,Math.min(Math.round(gross*Double.parseDouble(str(promo.get("persen")))/100),max>0?max:Long.MAX_VALUE));if(amount>cut){cut=amount;promoName=str(promo.get("nama"));}}
            }
            subtotal+=gross;discount+=cut;if(!promoName.isEmpty())promos.add(promoName);details.add(obj("id",next("nusa_detail_transaksi")+details.size(),"transaksi_id",id,"kendaraan_id",vehicleId,"kendaraan",vehicle.get("nama"),"qty",qty,"harga",vehicle.get("harga"),"diskon",cut,"subtotal",gross-cut));
        }
        long tax=Math.round((subtotal-discount)*Double.parseDouble(str(settings.get("pajak_persen")))/100),total=subtotal-discount+tax,points=member==null?0:total/Math.max(1,num(settings.get("rupiah_per_poin")));
        rows("nusa_transaksi").add(obj("id",id,"kode",code,"tanggal",LocalDate.now().toString(),"pelanggan",member==null?"Pelanggan Umum":member.get("nama"),"pelanggan_id",member==null?null:member.get("id"),"kasir",staff.get("nama"),"subtotal",subtotal,"diskon",discount,"pajak",tax,"total",total,"metode",input.get("method"),"promo",String.join(", ",new LinkedHashSet<>(promos)),"poin_didapat",points,"status","Selesai"));
        for(Object d:details){Map<String,Object> line=map(d),vehicle=find("nusa_kendaraan",num(line.get("kendaraan_id")));long stock=num(vehicle.get("stok"))-num(line.get("qty"));vehicle.put("stok",stock);if(stock==0)vehicle.put("status","Terjual");rows("nusa_stok").add(obj("id",next("nusa_stok"),"tanggal",LocalDate.now().toString(),"kendaraan",vehicle.get("nama"),"tipe","Keluar","jumlah",line.get("qty"),"keterangan","Penjualan "+code));}rows("nusa_detail_transaksi").addAll(details);
        if(member!=null){long balance=num(member.get("poin"))+points;member.put("poin",balance);member.put("tier",balance>=8000?"Platinum":balance>=4000?"Gold":balance>=1500?"Silver":"Bronze");}
    }
    void handle(HttpExchange x) throws IOException {
        try {
            String host=str(x.getRequestHeaders().getFirst("Host"));require(host.equals("localhost:"+port)||host.equals("127.0.0.1:"+port),"Host ditolak");
            x.getResponseHeaders().set("X-Content-Type-Options","nosniff");x.getResponseHeaders().set("X-Frame-Options","DENY");
            x.getResponseHeaders().set("Cache-Control","no-store");
            String path=x.getRequestURI().getPath();if(path.startsWith("/api/")){api(x);return;}
            if(x.getRequestMethod().equals("GET") && (path.equals("/")||path.equals("/index.html"))) {
                revokeSession(x,"staff");revokeSession(x,"member");
            }
            if(path.equals("/member.html") && user(x,"member")==null){x.getResponseHeaders().set("Location","/member-login.html");x.sendResponseHeaders(302,-1);return;}
            if(path.startsWith("/pages/")){String r=role(x);if(r.isEmpty()){x.getResponseHeaders().set("Location","/staff-login.html");x.sendResponseHeaders(302,-1);return;}String page=path.substring(7).replace(".html","");require(!OWNER_PAGES.contains(page)||r.equals("owner"),"Hanya owner");require(!MANAGER_PAGES.contains(page)||!r.equals("karyawan"),"Hanya manajer/owner");}
            require(x.getRequestMethod().equals("GET")||x.getRequestMethod().equals("HEAD"),"Metode ditolak");
            Path target=web.resolve(path.equals("/")?"index.html":path.substring(1)).normalize();require(target.startsWith(web),"Path ditolak");
            if(!Files.isRegularFile(target)){respond(x,404,obj("error","Halaman tidak ditemukan"));return;}
            String name=target.toString();String type=name.endsWith(".html")?"text/html":name.endsWith(".js")?"application/javascript":name.endsWith(".css")?"text/css":"application/octet-stream";
            x.getResponseHeaders().set("Content-Type",type+"; charset=utf-8");x.getResponseHeaders().set("Cache-Control","no-store");
            if(x.getRequestMethod().equals("HEAD")){x.sendResponseHeaders(200,-1);return;}x.sendResponseHeaders(200,Files.size(target));Files.copy(target,x.getResponseBody());
        }catch(SecurityException e){respond(x,403,obj("error",e.getMessage()));}catch(IllegalArgumentException e){respond(x,400,obj("error",e.getMessage()));}catch(Exception e){e.printStackTrace();respond(x,500,obj("error","Server gagal memproses permintaan. Lihat terminal."));}finally{x.close();}
    }
    public static void main(String[] args) throws Exception {
        int port=args.length>0?Integer.parseInt(args[0]):8080;Path root=Path.of("").toAbsolutePath().normalize();
        Files.createDirectories(root.resolve("data"));
        FileChannel lockChannel=FileChannel.open(root.resolve("data/server.lock"),StandardOpenOption.CREATE,StandardOpenOption.WRITE);
        FileLock lock=lockChannel.tryLock();if(lock==null){System.err.println("Nusa Motors sudah berjalan. Buka http://localhost:"+port+" atau jalankan stop.bat dahulu.");lockChannel.close();return;}
        NusaServer app=new NusaServer(root,port);
        HttpServer server=HttpServer.create(new InetSocketAddress("127.0.0.1",port),0);server.createContext("/",app::handle);server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());server.start();
        Path pidFile=root.resolve("data/server.pid");Files.writeString(pidFile,Long.toString(ProcessHandle.current().pid()));
        Runtime.getRuntime().addShutdownHook(new Thread(()->{server.stop(1);try{Files.deleteIfExists(pidFile);lock.release();lockChannel.close();}catch(IOException ignored){}}));
        System.out.println("Nusa Motors Java berjalan: http://localhost:"+port+"\nData: "+app.file+"\nTekan Ctrl+C untuk berhenti.");
    }
}
