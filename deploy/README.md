# Glix production deployment

Bu klasör, Glix PWA'sını Ubuntu VDS üzerinde ayrı bir Docker Compose projesi
olarak çalıştırmak için hazırlanmıştır. Mevcut repo sözleşmesine göre:

- `@glix/shared` önce TypeScript ile derlenir.
- Client Vite üretim build'i olarak `/usr/share/nginx/html` içine alınır.
- Server Node.js olarak `0.0.0.0:8787` üzerinde çalışır.
- Server'ın HTTP health endpoint'i `/health`, gerçek zamanlı WebSocket yolu
  `/ws`'dir.
- Vite'ın geliştirme portu `5173`'dür; production container'da kullanılmaz.

## Dosyalar

- `client.Dockerfile`: shared + client build aşaması ve Nginx runtime imajı.
- `server.Dockerfile`: shared + server build aşaması ve yalnızca runtime
  bağımlılıklarını içeren Node imajı.
- `nginx.conf`: SPA fallback, `/health` proxy'si ve `/ws` WebSocket upgrade'i.
- `docker-compose.yml`: iki servis, iç ağ, healthcheck, restart, loopback
  yayınlama, log rotasyonu ve operasyonel Nginx cache volume'ü.
- `.env.example`: VDS için kopyalanacak örnek Compose değerleri.

## Alan adı ve mevcut servis izolasyonu

Glix dağıtımı mevcut oyunların alan adlarına veya servislerine dokunmaz:

- `api.lynrax.com` değiştirilmez.
- `game.lynrax.com` değiştirilmez.
- Glix için gerçek alan adı ve SSL sertifikası henüz kesinleşmedi.

`nginx.conf` içindeki `server_name glix.example.invalid;` yalnızca
placeholder'dır. Gerçek Glix alan adı belli olduğunda bu satır, host üzerindeki
TLS reverse proxy yapılandırması ve DNS kaydı birlikte güncellenmelidir.
Compose içindeki Nginx HTTP konuşur; varsayılan olarak yalnızca
`127.0.0.1:18080` yayınlanır. SSL'in host seviyesinde sonlandırılması önerilir.
Bu düzenlemede tarayıcı yine tek bir HTTPS origin üzerinden `/ws` bağlantısı
kuracağı için WebSocket adresi ayrıca başka bir alan adına taşınmaz.

## Ubuntu VDS'te ilk çalıştırma

Komutları repo kökünden çalıştırın:

```bash
cd /opt/glix
cp deploy/.env.example deploy/.env
nano deploy/.env

docker compose \
  --env-file deploy/.env \
  -f deploy/docker-compose.yml \
  config

docker compose \
  --env-file deploy/.env \
  -f deploy/docker-compose.yml \
  up -d --build

curl --fail http://127.0.0.1:18080/health
docker compose --env-file deploy/.env -f deploy/docker-compose.yml ps
```

`config` adımı, gerçek container başlatmadan Compose interpolasyonunu ve
mount'ları kontrol eder. `curl` cevabında `ok: true` ve `service:
glix-server` görülmelidir. PWA'yı dışarı açmadan önce host reverse proxy ile
`127.0.0.1:18080` hedefine yönlendirme yapılmalıdır.

Repo VDS'te GitHub kimlik doğrulamasıyla clone edilmişse güncelleme için:

```bash
git pull --ff-only
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d --build
docker compose --env-file deploy/.env -f deploy/docker-compose.yml logs --tail=100
```

Bu projede `/opt/glix` ilk pilot sırasında GitHub kimlik doğrulaması olmayan
sunucuya commit arşivi olarak aktarılmıştır. Aynı yöntemi kullanarak Windows
çalışma makinesinden güncelleme:

```powershell
git archive --format=tar HEAD | ssh root@VDS_ADRESI "tar -xf - -C /opt/glix"
ssh root@VDS_ADRESI "docker compose --env-file /opt/glix/deploy/.env -f /opt/glix/deploy/docker-compose.yml up -d --build"
```

`/opt/glix/deploy/.env` sunucuda korunur; arşiv aktarımı örnek environment
dosyasını overwrite etmemelidir.

Durdurmak için:

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml down
```

## Host seviyesinde TLS reverse proxy notu

Alan adı kesinleştiğinde host Nginx/Caddy/Traefik üzerinde SSL sertifikası
alınabilir. Host proxy; HTTP ve WebSocket başlıklarını koruyarak
`http://127.0.0.1:18080` hedefine göndermelidir. Nginx kullanan bir host için
iskelet yönlendirme şöyledir; alan adı ve sertifika yolları bilerek
placeholder bırakılmıştır:

```nginx
server {
    listen 443 ssl;
    server_name glix.example.invalid;

    ssl_certificate     /etc/letsencrypt/live/glix.example.invalid/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/glix.example.invalid/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:18080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 1h;
    }
}
```

Bu örnek mevcut `api.lynrax.com` veya `game.lynrax.com` server bloklarına
eklenmemeli; Glix için ayrı bir host adı ve ayrı bir server/proxy bloğu
kullanılmalıdır.

## İzolasyon, veri ve işletim notları

- Compose proje adı varsayılan olarak `glix-party`'dir; mevcut Compose
  projelerinden ayırmak için `GLIX_COMPOSE_PROJECT_NAME` ile değiştirilebilir.
- `glix-server` yalnızca `glix-internal` ağına açılır ve host portu yayınlamaz.
- `glix-client`, `glix-edge` (loopback yayın) ve `glix-internal`
  (server proxy) ağlarına birlikte bağlıdır; `glix-server:8787` adresine proxy
  yapar.
- Dışarıya yalnızca loopback üzerindeki client portu yayınlanır; host reverse
  proxy bunu alır.
- Oyun odaları ve maç verileri mevcut ürün kararına uygun olarak bellektedir.
  Server container'ı yeniden başlarsa aktif odalar/maçlar geri gelmez; kalıcı
  veritabanı veya oyun verisi volume'ü bu nedenle eklenmedi.
- Nginx için yalnızca operasyonel cache volume'ü vardır. Gerekirse güvenle
  `docker volume rm glix-party-nginx-cache` ile yeniden oluşturulabilir; aktif
  oyun verisi içermez.
- Her iki serviste Docker `json-file` log rotasyonu `10m × 5` olarak ayarlı.
  Uzun süreli işletimde host log toplama sistemi ayrıca kurulabilir.
- `restart: unless-stopped`, container çökmesi veya VDS yeniden başlatılması
  sonrasında servisin geri gelmesini sağlar. Compose healthcheck'leri trafiğe
  hazır olmayı ayrıca doğrular.

## Önemli varsayımlar

1. VDS'te Docker Engine ve Docker Compose Plugin kurulu, repo ise örneğin
   `/opt/glix` altında clone edilmiş durumdadır.
2. Gerçek Glix domain'i ve SSL terminasyonu bu teslimatta bilinmiyor; örnek
   domain/certificate yolları değiştirilmeden public trafik açılmamalıdır.
3. Root seviyedeki `.dockerignore`, yerel `node_modules`, `dist`, log ve
   coverage çıktılarını Docker build context'inden çıkarır. `deploy/.env`
   dosyası da image içine gönderilmez.
4. Host firewall ve dış Nginx/Caddy ayarları Compose'un sorumluluğunda değildir.
   `18080` loopback'e bağlı olduğu için doğrudan internetten erişilebilir
   değildir.
5. Client build-time `VITE_WS_URL` verilmezse aynı-origin `/ws` sözleşmesi
   hedeflenmektedir; bu deploy tasarımının doğru çalışması için
   `deploy/nginx.conf` içindeki backend adı korunmalıdır.

## Güvenlik ve sıkılaştırma (Server Hardening)

Glix sunucusu, açık internete maruz kalma durumunda bellek tükenmesi (OOM),
DoS, JSON payload şişirme ve sahte replay saldırılarına karşı aşağıdaki
katmanlarla korunmaktadır:

### Ortam değişkenleri

| Değişken | Varsayılan | Açıklama |
| --- | --- | --- |
| `ALLOWED_ORIGINS` / `GLIX_ALLOWED_ORIGINS` | Boş (dev'de her yer serbest) | İzin verilen Origin listesi (virgülle ayrılmış, örn. `https://glix.example.com`). Production'da boş bırakılırsa origin uyuşmazlığı durumunda WebSocket bağlantısı 403 ile reddedilir. |
| `ALLOW_NO_ORIGIN` / `GLIX_ALLOW_NO_ORIGIN` | `false` (prod), `true` (dev) | Origin başlığı bulunmayan bağlantılara (örn. curl, CLI scriptleri) izin verilip verilmeyeceği. Public prod'da `false` önerilir. |
| `TRUSTED_PROXY_HOPS` / `GLIX_TRUSTED_PROXY_HOPS` | `1` (Compose), `0` (doğrudan Node) | Güvenilen ters vekil sayısı. İstemci IP'si, `X-Forwarded-For` listesinin sağdan `trustedProxyHops` kadar önceki elemanından alınır; bu sayede istemcinin gönderdiği sahte XFF başlıkları yok sayılır. |
| `MAX_PAYLOAD_BYTES` / `GLIX_MAX_PAYLOAD_BYTES` | `2097152` (2 MiB) | İzin verilen en büyük WebSocket mesaj boyutu (byte). Karalama Defteri oyunundaki ölçülen en ağır yasal çizim (~1.21 MiB) dikkate alınarak ayarlanmıştır. |

### Ters vekil (Reverse Proxy) ve `TRUSTED_PROXY_HOPS` seçimi

- **Doğrudan Node çalıştırılıyorsa (`npm run dev:server` vb.)**: `TRUSTED_PROXY_HOPS=0`. İstemci IP'si doğrudan socket adresinden okunur.
- **Yalnızca Compose Nginx varsa**: `GLIX_TRUSTED_PROXY_HOPS=1`. Nginx istemcinin IP'sini `X-Forwarded-For`'a ekler; sağdaki son eleman güvenilir istemci IP'sidir.
- **Host üzerinde ikinci bir vekil (Caddy / Host Nginx) + Compose Nginx varsa**: `GLIX_TRUSTED_PROXY_HOPS=2`. Zincir: `İstemci -> Host Proxy -> Compose Nginx -> Node`. Sağdan 2. atlama gerçek istemci IP'sini verir.

### Güvenlik bütçeleri ve hız limitleri

1. **WebSocket taşıma bütçesi**: ws seviyesinde `maxPayload: 2097152` (2 MiB). 2 MiB üzeri paketler Node belleğine alınmadan ws tarafından `1009 (Message Too Big)` koduyla sonlandırılır.
2. **JSON AST karmaşıklık bütçesi**: JSON.parse sonrası nesne ağacı taranır:
   - Maksimum 120.000 düğüm (legal en yoğun çizim 76.330 düğümdür; %57 tolerans).
   - Maksimum 1.000 karakter dize uzunluğu (en uzun yasal actionScope ~240 karakterdir).
   - Dizi boyutu sınırı: 300 eleman (çizim strokeleri en fazla 180'dir).
   - Nesne anahtar sayısı: En fazla 32 anahtar.
   - Derinlik sınırı: En fazla 8 katman.
3. **Replay Action Fence**: Oyuncu başına 2.048 işlem kimliği (`actionId`) sınırıyla sınırlandırılmış Ring/LRU çit. Yalnızca başarıyla kabul edilen hamleler saklanır; geçersiz/reddedilen hamleler hafızayı dolduramaz. Yeni oyun başladığında veya oyuncu ayrıldığında temizlenir.
4. **Hız sınırlamaları (Token Bucket)**:
   - IP başına bağlantı: 100 burst, saniyede 2 yenileme (aynı NAT arkasında 8 oyuncunun eşzamanlı bağlanmasını destekler).
   - IP başına oda açma: 10 burst, 6 saniyede 1 yenileme.
   - IP başına odaya katılma: 40 burst, saniyede 1 yenileme.
   - Socket toplam mesaj: 250 burst, saniyede 60 yenileme (yüksek tempolu mini oyunları destekler).
   - Socket oyun hamlesi (submit): 150 burst, saniyede 35 yenileme (Aşırı Yükleme ve Butona Bas oyunlarında 100 tıklamaya kadar yasal seri tıklamaları destekler).
   - Hatalı/malformed mesaj seli: 5 hatalı mesaj gönderen socket `1008 (Policy Violation)` ile kapatılır.

### Public yayına çıkış kontrol listesi (Production Checklist)

1. [ ] Host üzerinde TLS sertifikası tanımlandı ve SSL `listen 443 ssl` ile sonlandırıldı.
2. [ ] `deploy/.env` dosyası oluşturuldu (`cp deploy/.env.example deploy/.env`).
3. [ ] `GLIX_ALLOWED_ORIGINS` gerçek prod alan adına (`https://glix.ornekdomain.com`) ayarlandı.
4. [ ] `GLIX_ALLOW_NO_ORIGIN` değeri `false` olarak bırakıldı.
5. [ ] `GLIX_TRUSTED_PROXY_HOPS` vekil zincirine göre (Host Proxy + Compose ise `2`, yalnızca Compose ise `1`) ayarlandı.
6. [ ] `docker compose -f deploy/docker-compose.yml config` ile sözdizimi doğrulandı.
7. [ ] `curl --fail http://127.0.0.1:18080/health` ile servis sağlığı doğrulandı.
8. [ ] `npm run smoke:realtime` veya WebSocket testi ile gerçek zamanlı akış doğrulandı.

## Operasyonel sınır

Bu klasör dağıtım artefaktlarını ve operasyon komutlarını taşır. Gerçek public
domain/SSL bilgisi kesinleşmeden host Caddy yapılandırmasına route eklenmemeli;
önce `docker compose ... config`, ardından loopback healthcheck ve
HTTPS/WebSocket smoke testi yapılmalıdır. Mevcut Lynrax servisleri ayrı
kalmalıdır.

