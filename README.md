# GLIX

Türkçe, telefon odaklı, gerçek zamanlı neon arcade kaos parti oyunları.

Bu depo eski `C:\Users\Xpike\Desktop\glix` projesinden bağımsız yeni sürümdür.
Kural sözleşmesi ve kalıcı proje kararları için:

- `GLIX-PROJE-HAFIZASI.md`
- `GLIX-MINIOYUN-KURALLARI-FORMU.md`

## Yapı

```text
apps/
  client/       React + Vite PWA istemcisi
  server/       Node.js + WebSocket sunucusu
packages/
  shared/       İstemci/sunucu ortak tipleri ve mini oyun kataloğu
docs/
  ASAMA-02-TEKNIK-TEMEL.md
  ASAMA-03-ODA-VE-REALTIME.md
  ASAMA-04-MOTOR-VE-PUAN.md
  ASAMA-06-GERCEK-MINIGAME-DILIMI.md
  ASAMA-07-OYUN-PAKETI-A.md
  ASAMA-08-OYUN-PAKETI-B.md
  ASAMA-09-KALAN-OYUNLAR.md
  ASSET-PIPELINE-NEON-TOYBOX.md
```

## Yerel geliştirme

Node.js 20 veya üzeri gerekir.

```powershell
npm install
npm run typecheck
npm run build
```

İki ayrı terminalde:

```powershell
npm run dev:server
npm run dev:client
```

İstemci `http://localhost:5173`, sağlık kontrolü
`http://localhost:8787/health`, WebSocket ise
`ws://localhost:8787/ws` üzerinden çalışır.

## Durum

Aşama 10 teslim kapısı tamamlandı: Katalogdaki 24 oyunun tamamı gerçek sunucu
adapter'ı ve telefon kontrol yüzeyiyle çalışır. Production dağıtım artefaktları
`deploy/` altında, canlı bağlantı smoke testi `npm run smoke:realtime` komutuyla
çalışır. VDS'e gerçek public yayın için alan adı ve host proxy bilgileri
`deploy/README.md` içindeki placeholder'larla tamamlanmalıdır.
