# Aşama 2 — Ürün akışı, temiz repo ve teknik temel

## Karar

- Monorepo: npm workspaces.
- İstemci: React, Vite ve TypeScript.
- Sunucu: Node.js, TypeScript ve WebSocket (`ws`).
- Ortak sözleşme: `packages/shared`.
- Mini oyun sahneleri ilerleyen aşamada WebGL katmanına bağlanacak; bu aşamada
  HTML/CSS uygulama kabuğu ve bağlantı göstergesi hazırlanır.
- PWA manifesti ve service worker üretim derlemesinde devreye girer.
- Sunucu portu varsayılan olarak `8787`, VDS'te çevre değişkeniyle değiştirilebilir.

## Katman sınırları

```text
React ekranları
  ├─ lobi / oda / tutorial / skor / bağlantı durumu
  └─ mini oyun ekranı kabı

WebGL sahne katmanı (Aşama 5)
  ├─ 2.5D arka plan ve parallax
  ├─ karakterler ve efektler
  └─ oyun objeleri

@glix/shared
  ├─ oyun kimlikleri ve katalog metadatası
  ├─ ortak faz ve oda tipleri
  └─ istemci/sunucu mesaj sözleşmesi

Node + WebSocket
  └─ şu an yalnızca bağlantı/health iskeleti; oda otoritesi Aşama 3'te
```

## Kabul ölçütleri

- İstemci ve sunucu ayrı workspace'lerde derlenir.
- Ortak tipler tek kaynaktan tüketilir.
- İstemci üretim modunda manifest ve service worker kaydeder.
- Sunucu `/health` üzerinden JSON sağlık cevabı verir.
- İstemci WebSocket'e bağlanıp sunucu hazır mesajını gösterebilir.
- Eski Glix klasörüne ve mevcut `api.lynrax.com` / `game.lynrax.com` servislerine
  dokunulmaz.
