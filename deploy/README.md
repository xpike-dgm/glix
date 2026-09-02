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

## Operasyonel sınır

Bu klasör dağıtım artefaktlarını ve operasyon komutlarını taşır. Gerçek public
domain/SSL bilgisi kesinleşmeden host Caddy yapılandırmasına route eklenmemeli;
önce `docker compose ... config`, ardından loopback healthcheck ve
HTTPS/WebSocket smoke testi yapılmalıdır. Mevcut Lynrax servisleri ayrı
kalmalıdır.
