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

Aşama 9 tamamlandı: Katalogdaki 24 oyunun tamamı gerçek sunucu adapter'ı ve
telefon kontrol yüzeyiyle çalışır. Son eklenen `rus-ruleti` ve `son-kisi` için
uygulama kaydı `docs/ASAMA-09-KALAN-OYUNLAR.md` dosyasındadır. Sıradaki adım;
tam rota, mobil UX/performance, yeniden bağlanma ve VDS dağıtım kalite kapısıdır.
