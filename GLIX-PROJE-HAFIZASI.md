# GLIX — Kalıcı Proje Hafızası

> Bu dosya, Glix projesinin tek kalıcı karar ve ilerleme kaynağıdır.
> Her aşamaya başlamadan önce okunacak, aşama sonunda güncellenecektir.
>
> Son güncelleme: 2026-09-02
> Çalışma klasörü: `C:\Users\Xpike\Desktop\oyun`
> GitHub: `https://github.com/xpike-dgm/glix`

## 1. Projenin özeti

Glix; arkadaş grubuyla aynı ortamda, herkesin kendi telefonundan katıldığı,
katılım kodu üzerinden oynanan, Türkçe bir **kaos parti mini oyunları PWA'sı**
olacak.

Hedef hisler mini oyuna göre değişecek:

- kahkaha
- rekabet
- kaos
- strateji
- gerilim

Amaç; eski Glix projesindeki bütün mini oyunları, daha profesyonel görünen,
animasyonlu, yüksek kaliteli 2.5D görsel yapıya ve düzgün çalışan gerçek zamanlı
oynanışa sahip yeni bir sürümde yeniden kurmaktır.

## 2. Kesinleşen ürün kararları

### Oyuncu ve erişim

- Oyun yalnızca Türkçe olacak.
- Oyun kitlesi arkadaş grubu olacak; herkese açık sosyal özellikler
  planlanmıyor.
- Bir odada genel olarak 2–8 oyuncu bulunabilecek.
- Bazı mini oyunlar 2 kişiyle oynanamayabilir. Her mini oyunun kendi minimum
  oyuncu sayısı olacak.
- Hesap, e-posta veya kalıcı profil olmayacak.
- Oyuncular yalnızca takma ad ile katılacak.
- Oyuncular odaya katılım koduyla girecek.
- Botlar tamamen kaldırılacak.

### Oda ve maç akışı

- Oda, VDS üzerindeki Glix sunucusunda çalışacak.
- Odayı kuran oyuncu oda yöneticisi olacak.
- Oda yöneticisi mini oyunları seçebilecek, çıkarabilecek ve maç listesini
  belirleyebilecek.
- Rastgele seçim seçeneği olacak; yönetici kaç mini oyun oynanacağını
  belirleyecek.
- Aynı maçta aynı mini oyun tekrar etmeyecek.
- Her mini oyun başlamadan önce görsel ve animasyonlu yaklaşık 10 saniyelik
  öğretici ekran gösterilecek.
- Maçın toplam süresi sabit olmayacak; seçilen mini oyunlara göre değişecek.
- Maç tamamlandıktan sonra verilerin kalıcı olarak saklanması gerekmiyor.

### Puanlama

- Her mini oyunun kendi puanlama sistemi olacak.
- Mini oyunun kazananları genel puan tablosuna puan aktaracak.
- Genel maç sonucu, seçilen mini oyunların sonuçlarından oluşacak.
- Puanlama, beraberlik ve final bonusları 24 oyunluk katalog için incelenip
  kilitlendi; uygulama formundaki her oyunun özel kuralı esas alınacak.

### Görsel hedef

- Tema: neon arcade.
- Yüksek kaliteli 2.5D sahneler.
- En fazla 8 oyuncu için 8 farklı karakter.
- Karakter tepkileri ve birkaç komik jest bulunabilir.
- Oyun içi sohbet bulunmayacak; oyuncular gerçek hayatta yan yana olacak.
- Arayüz ve animasyonlar, daha önce oluşturulan Glix hedef görsellerinin
  görsel dilini temel alacak.
- Asset, arka plan, karakter, ikon, efekt ve diğer görsel üretimleri bu proje
  için asistan tarafından hazırlanacak. Kullanılabilir üretim dosyaları ve
  varyasyonlar proje içinde düzenli tutulacak.
- `Neon Toybox 2.5D` projenin ana sanat yönü olarak seçildi ve kilitlendi.
- `Dark Arcade Carnival` ve `Comic Book 3D` yalnızca karşılaştırma/referans
  görselleri olarak tutulacak; Aşama 5'te ana asset pipeline Neon Toybox'a göre
  kurulacak.
- Panel oyununun değişmez ekran kuralı: oyuncuya yalnızca kendi paneli,
  kendi kablo kesme butonları ve başka bir oyuncunun panelini tarif eden gizli
  ipucu gösterilir. Diğer paneller, hedef/ilişki bilgisi ve sohbet/balon
  gösterilmez.

### Cihaz ve yön

- Hedef cihaz yalnızca telefon.
- Lobi, oda kurma ve basit bilgilendirme ekranları dikey ekranda da rahat
  çalışacak.
- Geniş 2.5D mini oyun sahneleri için ana tasarım yatay ekran olacak.
- Yatay gerektiren mini oyunlarda anlaşılır bir ekran döndürme uyarısı
  gösterilecek.
- Dikey oynanabilen mini oyunlar gereksiz yere yataya zorlanmayacak.

## 3. 2.5D animasyon yaklaşımı

Tam 3D model ağırlıklı bir yapı yerine, telefonlarda akıcı çalışacak katmanlı
WebGL sahneleri kullanılacak.

Bir sahne kabaca şu katmanlardan oluşacak:

```text
uzak arka plan
→ neon atmosfer ve parallax katmanları
→ zemin / platform
→ sahne objeleri
→ oyuncu karakterleri
→ ön plan parçaları
→ ışık, parçacık ve vurgu efektleri
→ HTML/CSS arayüzü
```

Uygulanacak teknikler:

- Karakterleri parçalı görseller veya sprite atlaslarla animasyonlandırma.
- Aynı karakter iskeletini farklı renk, yüz, kıyafet ve aksesuarlarla 8 oyuncuya
  uyarlama.
- Oyuncunun sahnedeki konumuna göre ölçek, gölge ve öne/arkaya geçiş efekti.
- Kamera yakınlaşması, uzaklaşması, pan ve kontrollü kamera sarsıntısı.
- Neon glow, ışık huzmesi, kıvılcım, duman, patlama ve parçacık efektleri.
- Ortak animasyon durumları: bekleme, hazırlanma, hamle, tepki, kazanma,
  kaybetme ve tur geçişi.
- Mini oyun kurallarına göre ayrıca gereken hareket veya efektler.
- Ağ üzerinden kare kare animasyon göndermek yerine olay ve zaman bilgisi
  gönderip animasyonu telefonda akıcı oynatma.

Görsel kalite yalnızca kodla oluşmayacağı için üretim assetleri hazırlanırken
katmanlara ayrılacak, aynı ışık yönü, renk paleti, perspektif ve karakter
oranları korunacak.

## 4. Teknik yönelim

Bu bölüm, ilk prototip performans testleriyle doğrulanacak önerilen mimaridir.

### İstemci

- Telefon odaklı PWA.
- TypeScript tabanlı yapı.
- 2.5D mini oyun sahneleri için WebGL tabanlı oyun render katmanı.
- Menü, lobi, skor ve öğretici ekranları için HTML/CSS arayüz katmanı.
- Mini oyunların ortak kullanacağı sahne, kamera, karakter, ses, geçiş ve efekt
  bileşenleri.

### Sunucu

- Ubuntu VDS üzerinde çalışan ayrı Glix servisi.
- Gerçek zamanlı oda iletişimi için WebSocket tabanlı yapı.
- Sunucu; oda durumu, oyuncular, tur başlangıç zamanları, hamle olayları,
  sonuçlar ve skor akışında otorite olacak.
- Bu otorite, arkadaş grubu kullanımında güvenlik projesi yapmak için değil,
  telefonlar arasında zamanlama ve sonuç tutarlılığı sağlamak için kullanılacak.
- Maç verileri başlangıçta bellekte tutulacak; maç bitince silinebilecek.
- Kalıcı veritabanı ilk sürüm için zorunlu değil.

### VDS izolasyonu

Mevcut başka oyunun kullandığı alanlara dokunulmayacak:

- `api.lynrax.com`
- `game.lynrax.com`

Glix için ayrı servis, ayrı Docker Compose/proje adı, ayrı dahili portlar ve
ayrı Nginx yönlendirmesi kullanılacak. Glix alan adları henüz kesinleşmedi;
aday yapı `glix.lynrax.com` ve ayrı bir API/WebSocket alt alanıdır.

VDS bilgisi:

- Ubuntu
- 6 çekirdek
- yaklaşık 16 GB RAM
- 160 GB disk
- SSH erişimi

## 5. Mini oyunlar için çalışma kuralı

Mini oyunların kuralları asistan tarafından varsayılmayacak.

Her mini oyun için önce yalnızca şu başlıklarda mevcut anlayış yazılacak:

- amaç
- oyuncunun yaptığı ana hareket
- oyun aşamaları
- süre ve zamanlama
- minimum / maksimum oyuncu sayısı
- kazanma ve kaybetme koşulu
- mini oyun puanlaması
- beraberlik durumu
- turun bitişi
- genel skora aktarım
- tutorial akışı
- gerekli görsel ve animasyonlar

Kullanıcı düzeltip onaylamadan o mini oyunun kuralı kesinleşmiş sayılmayacak ve
oynanış koduna dönüştürülmeyecek.

### Butona Bas notu

Eski projede Butona Bas için bulunan açıklama ve uygulama davranışı yalnızca
incelenecek kaynak kabul edilir; yeni sürümün kesin kuralı aşağıdaki kullanıcı
onayıyla kilitlenmiştir.

### Eski oyun kataloğu

- Eski Glix klasörü: `C:\Users\Xpike\Desktop\glix`
- Katalogda bulunan bütün mini oyunlar yeni sürümde değerlendirilecek.
- Motor içinde bulunup katalogda görünmeyen parçalar (ör. `kusursuz-denge`)
  katalog kapsamına alınmayacak; bu oyun yeni sürümden çıkarıldı.
- Eski demodaki bot davranışları yeni sürüme taşınmayacak.

### Eski katalog envanteri — kaynak özeti

Aşağıdaki liste yalnızca eski `data/games.js` dosyasından çıkarılmış envanterdir.
İsim, açıklama, eski fazlar ve süreler yeni oyunun kesin kuralı değildir.
Minimum oyuncu sayısı eski katalogda tanımlı değildir; her oyun için ayrıca
belirlenecek.

| # | Kimlik | Eski ad | Eski ana fikir özeti | Eski fazlar / süre |
|---:|---|---|---|---|
| 1 | `yazi-yaz` | Yazı Yaz | Bir oyuncu gizli gerçek kelimeyi yazar, diğerleri “masum” yazar; sonra kelime ve yazar tahmin edilir. | Gizli görev 55 sn → Tartışma 40 sn → Tahmin 35 sn |
| 2 | `kendim` | Kendim | Herkes kendisini tek kelimeyle tanımlar; kelimeler oyuncularla eşleştirilir. | Kelime 22 sn → Eşleştirme 34 sn |
| 3 | `sizma` | Sızma | Oyuncuların çoğu ortak, bir oyuncunun farklı olabilen kelimesi vardır; ipucu ve oylama yapılır. | İpucu 24 sn → Oylama 22 sn |
| 4 | `sozluk-blofu` | Sözlük Blöfü | Garip bir kelime için sahte tanımlar yazılır; gerçek anlam bulunmaya çalışılır. | Sahte anlam 28 sn → Gerçeği bul 24 sn |
| 5 | `cagrisim-agi` | Çağrışım Ağı | Ortak kelimeye verilen aynı çağrışımlar gruplanır. | Çağrışım 20 sn |
| 6 | `butona-bas` | Butona Bas | Ortak kırmızı butona aynı zaman penceresinde basma fikri. | Basış penceresi 15 sn |
| 7 | `rus-ruleti` | Rus Ruleti | Silahı tutan oyuncu hedef seçer; patlama/eliminasyon ve hayatta kalma akışı vardır. | Sıra 18 sn; tur tekrarlı |
| 8 | `gizli-hirsiz` | Gizli Hırsız | Oyuncular ortak kasayı gizli bir zamanda çalmaya çalışır. | Kasa hamlesi 15 sn |
| 9 | `kor-kronometre` | Kör Kronometre | Görünmeyen sayaçta hedeflenen 10. saniyeye en yakın zamanda basılır. | Kör sayaç 18 sn |
| 10 | `kor-bomba` | Kör Bomba | Bomba bir oyuncudadır; taşıyan kişi gerçek patlama süresini görmez ve pas akışı vardır. | Bomba el değiştiriyor 16 sn |
| 11 | `rusvet-darbe` | Rüşvet ve Darbe | Gizli oylamayla başkan seçilir; başkan puan dağıtır. | Başkan seçimi 20 sn → Puan dağıtımı 24 sn |
| 12 | `acgozluluk-limiti` | Açgözlülük Limiti | Oyuncular sayı seçer; toplam takım limiti aşılmazsa seçilen miktarlar puan olur. | Sayı seçimi 18 sn |
| 13 | `ortalamanin-yarisi` | Ortalamaya En Yakın | 0–100 arasında sayı seçilir; tur ortalamasına en yakın seçimler değerlendirilir. | Sayı seçimi 18 sn |
| 14 | `mayin-tarlasi` | Mayın Tarlası | Gizli 4×4 alanda aynı kareye çakışmadan seçim yapılır. | Kare seçimi 18 sn |
| 15 | `karalama-defteri` | Karalama Defteri | Çoğu oyuncu kelimeyi bilir, bir oyuncu bilmeden çizimlere uyum sağlamaya çalışır; sonra oylama yapılır. | Çizim 26 sn → Oylama 20 sn |
| 16 | `ittifak` | İttifak | Oyuncular ikna süresinden sonra gizli oy verir; alınan oylar puana dönüşür. | İttifak 60 sn → Oylama 22 sn |
| 17 | `son-kisi` | Son Kişi | Gizli bitişten önce kaçış butonuna basılır; son basan ve basmayanlar farklı değerlendirilir. | Doğru anı bekle 24 sn |
| 18 | `cizgiyi-gecme` | Çizgiyi Geçme | 0–100 arasında risk seçilir; aynı onluk bölgeye yığılma sonucu etkiler. | Risk seçimi 22 sn |
| 19 | `gizli-alisveris` | Gizli Alışveriş | Sınırlı bütçeyle marketten ürün seçilir; ürün değeri alan kişi sayısına göre değişir. | Sepet kurma 34 sn |
| 20 | `asiri-yukleme` | Aşırı Yükleme | Ortak enerji barı tıklamalarla dolar; kapasite aşılırsa son tıklama patlar. | Barı doldur 18 sn |
| 21 | `kontrol-paneli-kaosu` | Kontrol Paneli Kaosu | Farklı renk panelleri ve sözel tarif üzerinden doğru panel/rengin bulunması hedeflenir. | Kaosu çöz 45 sn |
| 22 | `zehirli-kadeh` | Zehirli Kadeh | Bazı kadehler zehirlidir; oyuncular tek takas hakkıyla zehri elinden çıkarmaya çalışır. | Kadehi dolaştır 30 sn |
| 23 | `capraz-ates` | Çapraz Ateş | Her oyuncu gizlice hedef seçer; karşılıklı hedeflemeler ayrıca değerlendirilir. | Hedef seçimi 20 sn |
| 24 | `zaman-bombasi-hafizasi` | Zaman Bombası Hafızası | Renk dizisi tekrar edilir; doğru yanıttan sonra sıra başka oyuncuya geçer ve dizi uzar. | Diziyi tekrar et 22 sn |

#### Katalog dışı eski motor dalı

- `kusursuz-denge`: Eski `engine.js` içinde sonuçlandırma ve bot dalı görülen,
  fakat `data/games.js` kataloğunda bulunmayan oyun. Kullanıcı kararıyla yeni
  sürüme dahil edilmeyecek.

Bu envanter tamamlandı. Bundan sonraki iş, listedeki oyunları sırayla ele alıp
her biri için “eski dosyadan benim anladığım” kural metnini hazırlamaktır.

### İlk kural inceleme kaydı — `yazi-yaz`

Durum: **Kural seti kullanıcı tarafından onaylandı ve kilitlendi.**

Kullanıcının kesinleştirdiği yeni sürüm kararları:

- Turda tek değil, tam **iki yazan** oyuncu olacak.
- İki yazan oyuncunun her biri kendi gizli kelimesini yazacak.
- Diğer oyuncular giriş alanına `masum` yazacak. Bu metin telefonda otomatik
  büyük harfe çevrilecek; küçük/büyük harf farkı oynanışı etkilemeyecek.
- Yazan oyuncular da tahmin aşamasına katılabilecek.
- Her yazan oyuncu diğer yazanın kim olduğunu ve onun kelimesini bulmaya
  çalışacak.
- Masum oyuncu yalnızca bir yazan oyuncu ve o yazanın bir kelimesi için tahmin
  gönderecek.
- Doğru kelime tahmini genel skora **+1** yazacak.
- Doğru yazan oyuncu tahmini genel skora **+1** yazacak.
- Yazan oyuncu, diğer yazanın kişisini ve kelimesini doğru bilirse aynı +1/+1
  mantığıyla puan alabilecek.
- Faz süreleri **30 saniye yazma → 60 saniye tartışma → 30 saniye tahmin**
  olacak.
- Tahmin göndermeyen oyuncu eksi puan almayacak; yalnızca alabileceği artı
  puanları alamayacak.
- Ayrı bir beraberlik/final bonusu uygulanmayacak; puanlar genel skora doğrudan
  eklenecek.
- Kelimeler oyuncuların kendi yazdığı kelimeler olacak.
- İki yazanın aynı kelimeyi yazmasına izin verilecek.
- Oyunun minimum oyuncu sayısı **3** olacak.

Kural açısından açık madde kalmadı. `yazi-yaz` yeni ortak oyun altyapısı
kurulduktan sonra kodlanacak; sıradaki kural incelemesi `kendim` olacak.

### İkinci kural inceleme kaydı — `kendim`

Durum: **Kural seti kullanıcı tarafından onaylandı ve kilitlendi.**

Eski `data/games.js`, `scripts/engine.js`, `scripts/app.js` ve `scripts/ui.js`
dosyalarından görülen akış:

- Her oyuncu kendisini anlatan tek bir kelime giriyor.
- Yazma fazı bitince her oyuncunun kelimesinden bir kart oluşturuluyor.
- Kartlar karıştırılıyor; kartın üzerinde kelime görünüyor fakat sahibinin adı
  doğrudan gösterilmiyor.
- Eşleştirme fazında her oyuncu listedeki her kelime kartını bir oyuncuyla
  eşleştirmeye çalışıyor.
- Eski arayüzde oyuncu, kendi kelimesini kendisiyle eşleştirebiliyor; yeni
  sürümde bunun korunup korunmayacağı kullanıcı kararıdır.
- Eski faz süreleri: **22 saniye kelime yazma → 34 saniye eşleştirme**.
- Eski kodda yazma ve eşleştirme için bütün oyuncuların gönderimi bekleniyor.

Eski kodda görülen puanlama yalnızca kaynak davranış notudur:

- Her doğru eşleştirme 1 puan sayılıyor, fakat oyuncunun kendi tur puanı doğru
  eşleştirme sayısında en fazla 3 ile sınırlandırılıyor.
- En az bir oyuncu bir kişinin kelimesini doğru sahibine eşleştirdiyse, o kelime
  sahibine +1 ekleniyor.
- En yüksek doğru eşleştirme sayısına ulaşan her oyuncuya +1 ekleniyor.
- Bu üç katkının yeni sürümde kullanılıp kullanılmayacağı onaylanmadı.

Kullanıcının yeni sürüm için kesinleştirdiği kararlar:

- Oyuncuların kendilerini anlatan kelimeler yazması korunacak; kelime sahibi
  kendiyle ilgisiz bir kelime seçerek sistemin amacını bozmayacak.
- Bir kelimeyi **yalnızca bir oyuncu** doğru sahibine eşleştirirse, o kelimenin
  sahibi mini oyun puanında **+1 bonus** alacak.
- Bir kelimeyi iki veya daha fazla oyuncu doğru eşleştirirse, kelime sahibi bu
  bonusu alamayacak.
- Hiç kimse kelimeyi doğru eşleştiremezse, kelime sahibi bonus alamayacak.
- Tüm kelime kartlarını eşleştirmek zorunlu olmayacak; oyuncu bütün kartları
  çözmek zorunda kalmadan tahminlerini gönderebilecek.
- Yanlış tahminler mini oyun turu içinde negatif puan doğuracak.
- `Kendim` mini oyunu bittiğinde mini oyun puanı en yüksek olan oyuncu genel
  skorda **+1** alacak.
- Mini oyun puanı en yüksek iki veya daha fazla oyuncu eşitse, bu oyuncuların
  her biri genel skorda **+1** alabilecek.

Kullanıcının son puanlama kararları:

- Tahmin/eşleştirme yapmak zorunlu değil; oyuncu hiç kart seçmeden de
  gönderebilecek.
- Eşleştirilmeyen veya boş bırakılan kart **0 puan** olacak.
- Her doğru eşleştirme mini oyun puanına **+1** ekleyecek.
- Her yanlış eşleştirme mini oyun puanından ayrı ayrı **-1** düşürecek.
- Böylece oyuncu yalnızca emin olduğu kartları seçerek risk yönetebilecek.

Son akış kararları:

- Fazlar **30 saniye kelime yazma → 30 saniye eşleştirme** olacak.
- Minimum oyuncu sayısı **3** olacak.
- Kelime uzunluğu için sınır olmayacak.
- Oyuncu kendi kelimesini kendisiyle eşleştiremeyecek.
- Aynı kelimeyi birden fazla oyuncu yazabilecek.
- Hiç tahmin göndermeyen oyuncu **0** mini oyun puanı alacak; eksi veya artı
  puan almayacak.

`kendim` için kural açısından açık madde kalmadı. Oyun yeni ortak altyapı
kurulduktan sonra kodlanacak; sıradaki kural incelemesi `sizma` olacak.

#### `Kendim` tasarım riski — açık kelime yazma teşviki

Kelime sahibine, başka bir oyuncu onu doğru bulduğu için doğrudan ekstra puan
verilirse oyuncunun en açık ve kolay tahmin edilen kelimeyi yazması rasyonel
stratejiye dönüşür. Bu da eşleştirme/çıkarım bölümünü gereğinden fazla
kolaylaştırır. Bu tespit kullanıcı tarafından yapıldı ve final kural değildir.

Değerlendirilecek çözüm yönleri:

1. Kelime sahibine verilen bonusu kaldırmak; yalnızca doğru eşleştiren oyuncuya
   puan vermek.
2. Sahip bonusunu yalnızca kelimeyi tam olarak bir oyuncu doğru bulduğunda
   vermek; çok bariz kelimelerde bonus vermemek.
3. Kelime yazmadan önce herkese sistemin belirlediği bir kategori/çerçeve
   vermek; serbest ama aşırı bariz cevapları azaltmak.
4. Her oyuncudan gerçek kelime ve blöf kelimesi almak, sunulacak kelimeyi
   sunucu tarafında rastgele seçmek; daha karmaşık ama daha fazla belirsizlik
   üretmek.

Kullanıcı 2. seçeneği tercih etti: sahip bonusu yalnızca tek doğru
eşleştirmede verilecek. Bu tercih, doğru eşleştirme +1, yanlış eşleştirme
başına -1 ve boş kart 0 kararlarıyla birlikte `kendim` kural setine işlendi.

Puanlama ve oyun akışı onayı tamamlandı; `kendim` kural seti kilitlendi.

### Üçüncü kural inceleme kaydı — `sizma`

Durum: **Kural seti kullanıcı tarafından onaylandı ve kilitlendi.**

Eski `data/games.js`, `scripts/engine.js`, `scripts/app.js` ve `scripts/ui.js`
dosyalarından görülen akış:

- Tur başında oyunculardan biri rastgele sızma/outsider rolünü alıyor.
- Sistem bir ortak kelime ve ona yakın ama farklı bir sızma kelimesi seçiyor.
- Sızma oyuncusu farklı kelimeyi, diğer oyuncular ortak kelimeyi kendi
  telefonunda gizlice görüyor.
- `clue` fazında herkes kelimesini açıkça söylemeden kısa bir ipucu yazıyor.
- Eski arayüz ipucunu en fazla 30 karakterlik kısa metin olarak istiyor.
- İpucu fazı bitince tüm oyuncuların ipuçları herkesin ekranında açılıyor.
- `vote` fazında herkes sızma olduğunu düşündüğü oyuncuyu seçiyor.
- Eski kodda oylar içinden tek başına en çok oyu alan kişi seçiliyor; en yüksek
  oy eşitliği varsa sonuç doğrudan belirlenmiyor.
- Eski faz süreleri: **24 saniye ipucu → 22 saniye oylama**.
- Eski kodda ipucu ve oy gönderimleri bütün oyuncular için bekleniyor; boş veya
  süresi geçen gönderim davranışının yeni sürüm karşılığı ayrıca belirlenecek.

Eski kodda görülen puanlama yalnızca kaynak davranış notudur:

- Sızma oyuncusu tek başına en yüksek oyla bulunursa, sızma dışındaki her
  oyuncu +1 alıyor; sızma oyuncusu 0 alıyor.
- Sızma oyuncusu bulunamazsa veya oylar eşitse, sızma oyuncusu +2 alıyor; diğer
  oyuncular 0 alıyor.
- Eski kodda negatif puan uygulanmıyor.

Kullanıcının yeni sürüm için kesinleştirdiği kararlar:

- Tek sızma oyuncusu ve iki farklı kelime yapısı korunacak.
- Ortak ve sızma kelimeleri geniş bir sistem kelime havuzundan seçilecek.
- İpuçları yazılmayacak; aynı ortamda bulunan oyuncular ipuçlarını sırayla
  **sesli** söyleyecek.
- İpucu vermek zorunlu olacak.
- Her oyuncu toplam **2 ipucu** verecek; birinci turda herkes bir kez, ikinci
  turda herkes bir kez ipucu söyleyecek.
- İpucu verme aşaması süreyle sınırlı olmayacak; sıranın ilerlemesiyle
  tamamlanacak.
- İkinci ipucu turu bitince ekrandaki **“Oylamaya geç”** düğmesine herkes
  basacak. Herkes bastıktan sonra oylama başlayacak.
- Oylama süresi **30 saniye** olacak.
- Her oyuncu raunt sonunda yalnızca bir kişiye oy verecek.
- Oyuncu kendisini oylayabilecek.
- Sızma bulunursa normal oyuncuların tamamı **+1** alacak; sızma oyuncusu
  **0** alacak.
- Sızma bulunamazsa sızma oyuncusu **+2** alacak.
- Yanlış oy için eksi puan olmayacak.
- Eşit oyda sızma kazanacak: eşit adaylardan biri sızmaysa sızma kazanır;
  eşit adayların tamamı normal oyuncuysa da sızma bulunamamış sayılır ve yine
  sızma kazanır.
- Minimum oyuncu sayısı **3** olacak.

Eksik katılım için özel ceza veya alternatif kural eklenmeyecek. Oyun arkadaş
grubunda oynanacağı için herkesin iki ipucunu verip “Oylamaya geç” düğmesine
basması bekleniyor; yeni sürümde bu akış varsayılan kabul edilecek.

`sizma` için kural açısından açık madde kalmadı. Oyun yeni ortak altyapı
kurulduktan sonra kodlanacak; sıradaki kural incelemesi `sozluk-blofu` olacak.

### Dördüncü kural inceleme kaydı — `sozluk-blofu`

Durum: **Kural seti kullanıcı tarafından onaylandı ve kilitlendi.**

Eski `data/games.js`, `scripts/engine.js`, `scripts/app.js` ve `scripts/ui.js`
dosyalarından görülen akış:

- Sistem kelime havuzundan garip/nadir bir kelime ve onun gerçek tanımını
  seçiyor.
- `bluff` fazında herkes bu kelime için gerçekmiş gibi görünen sahte bir tanım
  yazıyor.
- Yazma süresi bitince gerçek tanım ve her oyuncunun sahte tanımı seçeneklere
  dönüştürülüyor.
- Seçenekler karıştırılıyor; gerçek tanımın hangisi olduğu doğrudan
  belirtilmiyor.
- `choose` fazında her oyuncu seçeneklerden doğru olduğuna inandığı bir tanımı
  seçiyor.
- Eski kaynakta bir oyuncu sahte tanım göndermezse sistem yedek bir tanım
  kullanabiliyor.
- Eski faz süreleri: **28 saniye sahte tanım → 24 saniye gerçeği bulma**.

Eski kodda görülen puanlama yalnızca kaynak davranış notudur:

- Gerçek tanımı seçen oyuncu +1 alıyor.
- Bir oyuncu başka bir oyuncunun sahte tanımını seçerse sahte tanımın sahibi
  +1 alıyor.
- Yanlış seçen oyuncuya eski kodda eksi puan verilmiyor.
- Eski kodda ayrıca genel mini oyun birincisi bonusu bulunmuyor; yeni Glix'in
  genel maç puanlama kararı ayrı uygulanacak.

Kullanıcının yeni sürüm için kesinleştirdiği kararlar:

- Garip kelime ve gerçek tanım için bu oyuna özel geniş bir kelime havuzu
  oluşturulacak.
- Her oyuncu bir sahte tanım yazacak.
- Sahte tanım yazmak zorunlu olacak.
- Tanımlar serbest metin olacak.
- Tanım başına **100 karakter** sınırı kullanılacak. Bu sınır telefon ekranında
  okunabilirlik ve kısa blöf temposu için belirlendi.
- Gerçek tanım ve tüm sahte tanımlar tamamen karışık seçenekler olarak
  gösterilecek.
- Her oyuncu yalnızca bir tanım seçecek.
- Gerçek tanımı doğru seçen oyuncu **+1 mini oyun puanı** alacak.
- Yanlış seçimde eksi puan olmayacak.
- Bir oyuncunun blöfünü seçen her kişi, blöf sahibine **+1 mini oyun puanı**
  kazandıracak.
- Aynı blöfü birden fazla kişi seçerse sahibi her seçim için ayrı ayrı +1
  alacak.
- Oyuncu kendi yazdığı blöfü seçemeyecek.
- Minimum oyuncu sayısı **3** olacak.
- Faz süreleri **50 saniye sahte tanım yazma → 30 saniye doğru tanımı seçme**
  olacak.
- Boş/eksik katılım için arkadaş grubunda özel ceza kuralı eklenmeyecek;
  tanım ve seçim aşamaları zorunlu kabul edilecek.

`sozluk-blofu` için kural açısından açık madde kalmadı. Oyun yeni ortak
altyapı kurulduktan sonra kodlanacak; sıradaki kural incelemesi
`cagrisim-agi` olacak.

### Beşinci kural inceleme kaydı — `cagrisim-agi`

Durum: **Kural seti kullanıcı tarafından onaylandı ve kilitlendi.**

Eski `data/games.js`, `scripts/engine.js`, `scripts/app.js` ve `scripts/ui.js`
dosyalarından görülen akış:

- Sistem bir ana kelime seçiyor ve tüm oyuncular aynı ana kelimeyi görüyor.
- Her oyuncu aklına gelen tek bir çağrışımı yazıyor.
- Eski arayüz çağrışım için en fazla 22 karakterlik giriş alanı kullanıyor.
- Cevaplar oyunculara göre gruplanıyor; Türkçe küçük/büyük harf farkı ve boşluk
  tekrarları normalizasyonla eşit kabul ediliyor.
- Aynı cevabı en az iki kişi verdiyse o cevap bir grup oluşturuyor.
- Grup üyelerinin her biri, o cevabı veren kişi sayısı kadar puan alıyor.
- Tek kalan cevaplar puan getirmiyor.
- Eski kaynakta tek faz var ve süresi **20 saniye**.
- Eski kodda boş cevaplar puanlamaya dahil edilmiyor.

Eski kodda görülen puanlama yalnızca kaynak davranış notudur:

- Grup büyüklüğü `n` ise, o gruptaki her oyuncu +`n` alıyor.
- Tek kalan cevap 0 puan.
- Negatif puan, final bonusu veya özel beraberlik kuralı bulunmuyor.

Kullanıcının yeni sürüm için kesinleştirdiği kararlar:

- Ana kelime bu oyuna özel geniş bir kelime havuzundan seçilecek.
- Her oyuncu yalnızca **1 çağrışım** yazacak.
- Çağrışım yazmak zorunlu olacak.
- Çağrışım serbest metin olacak.
- Karakter sınırı olmayacak.
- En az 2 kişinin aynı cevabı vermesi grup oluşturma koşulu olarak korunacak.
- Aynı cevabı veren her oyuncu, grubun oyuncu sayısı kadar mini oyun puanı
  alacak.
- Tek kalan cevap **0** puan olacak.
- Yanlış cevap diye ayrı bir durum olmayacak; negatif puan uygulanmayacak.
- Bir oyuncu birden fazla çağrışım gönderemeyecek.
- Faz süresi **30 saniye** olacak.
- Minimum oyuncu sayısı **2** olacak.
- Eski sistemdeki Türkçe küçük/büyük harf ve fazla boşluk normalizasyonu,
  aynı cevabın adil biçimde gruplanması için teknik davranış olarak korunacak.

`cagrisim-agi` için kural açısından açık madde kalmadı. Oyun yeni ortak
altyapı kurulduktan sonra kodlanacak; sıradaki kural incelemesi `butona-bas`
olacak.

### Altıncı kural inceleme kaydı — `butona-bas`

Durum: **Kural seti kullanıcı tarafından onaylandı ve kilitlendi.**

Kullanıcının daha önce verdiği ana kural:

- Tüm oyuncuların ekranında aynı büyük kırmızı buton olacak.
- Oyun süresi boyunca basışlar zaman pencerelerine göre değerlendirilecek.
- Aynı zaman penceresinde birden fazla oyuncu basarsa, o penceredeki basan
  oyuncuların her biri **+1 mini oyun puanı** alacak.
- Bir zaman penceresinde yalnızca tek oyuncu basarsa, yalnızca o oyuncu **-1
  mini oyun puanı** alacak.
- Hiç kimse basmazsa puan değişmeyecek.
- Bu puanlama oyun süresi bitene kadar birden fazla pencere boyunca devam edecek.
- Süre bittiğinde mini oyun puanı en yüksek oyuncu ve sonraki sıralama genel
  skora aktarılacak.

Yeni sürüm için kullanıcı tarafından kesinleştirilen kurallar:

- Toplam oyun süresi **45 saniye** olacak.
- Zaman penceresi, turun başlangıcından itibaren sabit **0,3 saniye** olacak.
- Aynı oyuncunun aynı pencere içindeki birden fazla basışı o pencere için tek
  oyuncu olarak sayılacak.
- Minimum oyuncu sayısı **2** olacak.
- Mini oyun puanı sıralamasında tek bir en yüksek oyuncu varsa, bu oyuncu genel
  skorda **+2** alacak; sonraki sıradaki oyuncu genel skorda **+1** alacak.
- En yüksek mini oyun puanı iki veya daha fazla oyuncuda eşitse, en yüksek
  puanı paylaşan oyuncuların tamamı genel skorda **+1** alacak; bu durumda
  liderlere **+2 verilmeyecek**. Örneğin dört oyuncunun da puanı 5 ise dördü
  de genel skorda +1 alacak.

Eski `data/games.js`, `scripts/engine.js`, `scripts/app.js` ve `scripts/ui.js`
dosyalarından görülen uygulama ayrıntıları:

- Eski toplam süre **15 saniye**.
- Basışlar, turun başlangıcından itibaren sabit **1,2 saniyelik** pencerelere
  bölünüyor.
- Aynı oyuncunun aynı pencere içindeki birden fazla basışı o pencere için tek
  oyuncu olarak sayılıyor.
- Eski arayüz aynı oyuncunun süre içinde birden fazla kez basmasına izin
  veriyor.
- Eski sonuçlandırma kodu en yüksek puanlı üst yarıya +1 veriyor; bu davranış
  yeni sürüm kuralı değildir.

`butona-bas` için kural açısından açık madde kalmadı. Oyun yeni ortak altyapı
kurulduktan sonra kodlanacak; sıradaki kural incelemesi `rus-ruleti` olacak.

### Yedinci kural inceleme kaydı — `rus-ruleti`

Durum: **Kural seti kullanıcı tarafından onaylandı ve kilitlendi.**

Eski `data/games.js`, `scripts/engine.js`, `scripts/app.js` ve `scripts/ui.js`
dosyalarından benim anladığım akış:

- Tur başında bütün oyuncular hayatta kabul ediliyor.
- Silah rastgele bir oyuncunun elinde başlıyor.
- Silahı tutan oyuncunun ekranında patlama ihtimali ve hayatta kalan oyuncu
  sayısı gösteriliyor; yalnızca o oyuncu hedef seçip ateş edebiliyor.
- Hedef, hayatta olan oyunculardan seçilebiliyor. Eski arayüz oyuncunun kendisini
  de hedef olarak seçmesine izin veriyor.
- Her atışta mevcut risk yüzdesine göre rastgele patlama kontrolü yapılıyor.
- Atış patlamazsa silah hedef oyuncuya geçiyor. Oyuncu kendisini hedeflediyse
  silah aynı kişide kalıyor.
- Patlamayan her atıştan sonra risk **10 puan** artıyor; başlangıç riski **16**,
  eski üst sınır **76**.
- Atış patlarsa hedef oyuncu eleniyor, risk tekrar **16** oluyor ve elenen kişi
  hayatta kalanlar listesinden çıkarılıyor.
- Patlamadan sonra hâlâ oyun devam ediyorsa silah rastgele bir hayatta kalan
  oyuncuya veriliyor.
- Hayatta kalan oyuncu sayısı, başlangıçtaki toplam oyuncu sayısının yarısına
  veya altına düştüğünde tur bitiyor. Eski kodda bu eşik
  `ceil(toplam oyuncu / 2)` biçiminde uygulanıyor.
- Eski kaynakta sonuçta yalnızca hayatta kalan oyuncuların her birine **+1**
  veriliyor; elenen oyunculara puan verilmiyor.
- Oyun için sabit tur sayısı yok; elenme eşiğine ulaşana kadar atışlar devam
  ediyor.
- Bir karar süresi **18 saniye**. Silahı tutan kişi süre içinde ateş etmezse
  eski sunucu akışında rastgele bir hayatta oyuncu otomatik hedef seçiliyor ve
  atış yapılıyor; mümkünse silahı tutan kişi otomatik hedeflenmiyor.

Yeni sürüm için kullanıcı tarafından kesinleştirilen kararlar:

- Minimum oyuncu sayısı **2** olacak.
- Silahın ilk sahibi rastgele seçilecek.
- Silahı tutan oyuncu kendisini veya hayatta olan başka bir oyuncuyu hedef
  seçebilecek.
- Atış patlamazsa silah doğrudan hedefe geçecek; oyuncu kendisini hedeflediyse
  silah aynı kişide kalacak.
- Risk **%16** ile başlayacak; her patlamayan atışta **10** artacak ve en fazla
  **%76** olacak.
- Atış patlarsa hedef elenecek, risk **%16** değerine dönecek ve oyun devam
  ediyorsa silah rastgele bir hayatta kalana verilecek.
- Hayatta kalan sayısı başlangıç oyuncu sayısının yarısına veya altına inince
  oyun bitecek.
- Oyun sonunda hayatta kalan oyuncuların her biri genel skorda **+1** alacak;
  elenen oyuncular **0** alacak.
- Her karar süresi **18 saniye** olacak. Sürede hamle gelmezse sistem mümkünse
  silah sahibini hedeflemeyen rastgele bir hayatta oyuncuya otomatik ateş edecek.
- Elenen oyuncular mini oyun bitene kadar yalnızca izleyici olacak.

İlk yedi oyunun kural kaydı tamamlandı. Toplu form incelemesiyle birlikte
katalogdaki 24 oyunun kural seti kilitlendi; `kusursuz-denge` kapsam dışıdır.
Oyunlar yeni ortak altyapı kurulduktan sonra kodlanacak.

### Toplu mini oyun kural formu kilitleme kaydı

Kullanıcı, `C:\Users\Xpike\Desktop\oyun\GLIX-MINIOYUN-KURALLARI-FORMU.md`
dosyasındaki kalan oyunların cevap alanlarını doldurdu. Asistan, kullanıcının
karar vermeyi bıraktığı tutorial, görsel ve teknik alanları tamamladı; aşağıdaki
özetler artık **kilitli uygulama kurallarıdır**. Ayrıntılı kaynak dosya formdur.

Kilitlenen yeni sürüm kararları:

- `gizli-hirsiz`: 2–8 oyuncu, 30 saniye, herkesin gizli tek bir “Çal” hamlesi;
  tek hamle yapan +1, birden fazla hamle yapanların her biri -1, hamle yapmayan
  0; puanlar doğrudan genel skora gider.
- `kor-kronometre`: 2–8 oyuncu, tamamen gizli 10. saniyeye tek basış; toplam
  süre 18 saniye, basmayanın zamanı 18 saniye kabul edilir; en yakın +2,
  ikinci en yakın +1 ve doğrudan genel skora aktarılır.
- `kor-bomba`: 2–8 oyuncu, bomba rastgele başlar; ilk patlama süresi 15–20
  saniye aralığındadır. Taşıyıcı patlama zamanını ve sayacı göremez, diğerleri
  görür. Bomba başka hayatta bir oyuncuya sınırsız kez aktarılabilir; her pas
  kalan süreye rastgele 1–4 saniye ekler. Bomba kimde patlarsa -1, diğerleri 0
  alır; patlama ile aynı ana gelen pas sunucu sırasına göre değerlendirilir.
- `rusvet-darbe`: 3–8 oyuncu; 20 saniye başkanlık seçimi, 25 saniye puan
  dağıtımı; herkes kendisi dışında bir adaya oy verir; başkan aldığı oy kadar
  puanı kişi başına en fazla 2 olacak şekilde dağıtır ve +1 alır. Eksik oy
  rastgele rakibe gider, eksik dağıtılan puan süre sonunda rastgele dağıtılır.
  Eşitlikte üç kişilik taş-kâğıt-makas mantığı kullanılır; sonuç çıkmazsa el
  tekrarlanır.
- `acgozluluk-limiti`: 3–8 oyuncu, 20 saniye gizli sayı seçimi, seçim aralığı
  0–oyuncu sayısı. Ortak limit tablosu `3:6, 4:11, 5:17, 6:24, 7:33, 8:43`.
  Toplam limit aşılmazsa herkes seçtiği sayı kadar genel skor alır; aşılırsa
  herkes 0 alır.
- `ortalamanin-yarisi`: 3–8 oyuncu, gizli 20 saniyelik 0–100 tam sayı seçimi;
  hedef sayıların ortalamasının yarısıdır; cevap vermeyene rastgele 0–100 sayı
  atanır; en yakın +2, ikinci yakın +1 doğrudan genel skora gider; en yakınlar
  eşitse hepsi +1 alır ve ikinci bonusu uygulanmaz.
- `gizli-kareler` (eski kod adı `mayin-tarlasi`): 2–4 oyuncuda 3×3, 5–8
  oyuncuda 4×4 alan; mayın yok; iki aşama ve her biri 20 saniye. Her oyuncu
  gizli tek kare seçer; aynı kareyi seçenler mini oyundan elenir; her aşamada
  tek kalan hayatta oyuncu +1 genel skor alır. İlk aşamada herkes aynı kareye
  düşerse oyun hemen biter; ilk aşamadan sonra tek kişi kalırsa ikinci aşama
  otomatik +1 ile kapanır.
- `karalama-defteri`: 3–8 oyuncu; rastgele bir kişi ana kelimeyi değil ona yakın
  bir kelimeyi görür; özel kelime havuzu kullanılır; 75 saniye çizim, kalem,
  altı renk ve silgi; herkes tek çizimini süre sonuna kadar düzenleyebilir;
  ardından 20 saniye, kişi başı tek oy; bilgisiz bulunursa diğer oyuncular +1,
  bulunamazsa bilgisiz +1; yanlış veya eksik oyda eksi yok; eşit oyda bilgisiz
  kazanır; puanlar doğrudan genel skora gider.
- `ittifak`: 3–8 oyuncu; 60 saniye sesli pazarlık ve 15 saniye oylama; herkes
  kendisi dışında bir kişiye tek oy verir; söz verme/bozma cezası yok; oy
  vermeyen oyuncunun oyu rastgele rakibe atanır; alınan oylar doğrudan genel
  skora gider. Uygulamada ittifak nesnesi tutulmaz.
- `son-kisi`: 2–8 oyuncu; sistem 10–20 saniye arasında gizli bitiş seçer;
  herkes istediği anda bir kez kaçar; bitişten önce basanlar içinde son basan
  veya aynı son zaman damgasını paylaşanlar +1, erken basıp son olmayanlar 0,
  hiç basmayanlar -1 alır; doğrudan genel skora gider.
- `cizgiyi-gecme`: 2–8 oyuncu; gizli 30 saniyelik 0–100 tam sayı seçimi;
  aynı onluk bölgeye düşenler pasif kalır ve ceza almaz; tek kalanlar içinde
  en yüksek +2, ikinci +1 alır; boş seçim pasif olur; doğrudan genel skora gider.
- `gizli-alisveris`: 3–8 oyuncu; 60 kredi bütçe ve 12 ürünlük sabit havuz
  (fiyatlar: 8, 10, 12, 15, 18, 20, 22, 24, 26, 28, 32, 36); 30 saniye gizli
  sepet kurma; bütçe dahilinde her üründen en fazla bir tane. Ürün değeri,
  fiyatın o ürünü seçen kişi sayısına bölünmesidir. En yüksek sepet +1, eşit
  en yükseklerin tamamı +1; boş sepet 0 değer alır.
- `asiri-yukleme`: 2–8 oyuncu; ortak kapasite 100, her tık +1; tıklar tur
  sonuna kadar gizli; bar 100’e ulaştıktan sonra oyunculara görünmeyen 3 saniye
  daha vardır; bu aralıkta 100’ü aşan tık turu bitirir ve tıklayan -1 alır;
  patlamayanlar içinde en çok tıklayan +2, ikinci +1; en yüksek tıklama eşitse
  bu oyuncular +1 alır; puanlar doğrudan genel skora gider.
- `kontrol-paneli-kaosu`: 2–8 oyuncu; herkesin panelinde dört farklı renk
  kablo, oyuncuya özel sıra ve başka bir oyuncunun panelini tarif eden gizli
  ipucu bulunur. İpucu başka oyuncunun panelinde hangi kablonun kesileceğini
  belirler; panel sahibi kendi ipucunun kimde olduğunu bilmez ve oyuncular
  sözlü tartışarak çözmeye çalışır. Herkes tek kablo keser; doğru kesen +1,
  o panelin ipucunu taşıyan +1 alır; süre 60 saniyedir.
- `zehirli-kadeh`: 2–8 oyuncu; 2–3 oyuncuda 1, 4–5 oyuncuda 2, 6–8 oyuncuda
  3 zehirli kadeh; oyuncu kendi kadehinin durumunu göremez; bir takas hakkı,
  takas anlık ve kendisi dışındaki oyuncularla; 20 saniye başlangıç süresi,
  her takasta +5 saniye; süre sonunda temiz kadeh sahipleri +1, zehirliler 0;
  takas zorunlu değil; doğrudan genel skora gider.
- `capraz-ates`: 3–8 oyuncu; 25 saniye gizli hedef seçimi; kendini hedeflemek
  yasak, tek hedef; hedefine ateş edip hedeflenmeyen +1, hedeflenen -1,
  karşılıklı hedefleşme 0, birden fazla kişi tarafından hedeflenme -1; boş
  seçim boşa ateş sayılır; puanlar doğrudan genel skora gider.
- `zaman-bombasi-hafizasi`: 2–8 oyuncu, dört renk, ilk dizi uzunluğu 2;
  oyuncu sırası bir kez karıştırılıp aynı çevrimde tekrarlanır. Her doğru
  cevapta dizi bir renk uzar; sıra başına süre dizi uzunluğu × 3 saniyedir.
  Yanlış veya cevapsız oyuncu elenir ve -1, o andaki diğer aktif oyuncular +1
  alır; dizi uzunluğu 2'ye sıfırlanır; başlangıç oyuncularının yarısı elenince
  oyun biter.
- `kusursuz-denge` kullanıcı tarafından forma “bu oyun eklenmeyecek” şeklinde
  işaretlendi; yeni sürüme dahil edilmeyecek.

Asistan tarafından tamamlanan alanlar:

- Tutorial metinleri, sahne tasarımları, karakter/ışık/efekt/animasyon fikirleri
  ve açık bırakılan özel durumlar.
- `acgozluluk-limiti` için oyuncu sayısına göre dengeli ortak limit tablosu.
- `gizli-alisveris` için bütçe, ürün havuzu, fiyatlar ve kombinasyon dengesi.
- Mayın içermeyen oyunun son adı `Gizli Kareler` ve kimliği `gizli-kareler`.
- `gizli-alisveris` bütçesi 60 kredi, ürün havuzu ve fiyatları.
- Tutorialların üç adımı, 2.5D sahne/animasyon konseptleri ve teknik kenar
  durumları form dosyasına işlendi.

Kural kilitleme sonucunda açık soru kalmadı. Form ve bu hafıza dosyası birlikte
uygulama sözleşmesidir; yeni bir değişiklik olursa ilgili oyun maddesi ayrıca
güncellenecektir.

## 6. Baştan düzenlenmiş 10 aşamalı geliştirme planı

Bu plan, 24 mini oyunun kural sözleşmesi kilitlendikten sonra yeniden
oluşturuldu. Oyunları tek tek eklemek yerine önce gerçek zamanlı çekirdek,
ortak faz/puan sistemi ve 2.5D görsel temel kurulacak; ardından iki farklı
oyun paketi aynı altyapı üzerinden geliştirilecek.

### Aşama 1 — Kapsam, katalog ve kural sözleşmesi

- Eski Glix kataloğunu ve kaynak davranışlarını çıkarmak.
- 24 oyunun minimum oyuncu sayısı, fazları, süreleri, hamleleri, puanları,
  bitiş koşulları ve özel durumlarını kilitlemek.
- Her oyun için tutorial ve görsel/animasyon yönünü belirlemek.
- `kusursuz-denge` oyununu kapsam dışında bırakmak.

**Durum: TAMAMLANDI.** Ayrıntılı kural sözleşmesi
`GLIX-MINIOYUN-KURALLARI-FORMU.md` dosyasında, özet karar kaydı bu hafızada.

### Aşama 2 — Ürün akışı, temiz repo ve teknik temel

- Yeni projeyi eski `C:\Users\Xpike\Desktop\glix` kodundan bağımsız kurmak.
- Frontend, backend ve ortak tipleri ayrıştıran temiz TypeScript yapısını
  oluşturmak.
- Telefon PWA kabuğu, geliştirme/test/production ortamlarını ve temel komutları
  hazırlamak.
- Lobi, oda, tutorial, mini oyun, sonuç ve genel skor ekranlarının akışını
  wireframe düzeyinde kesinleştirmek.
- Canvas/WebGL 2.5D sahne katmanı ile HTML/CSS arayüz katmanının sınırını
  belirlemek.

**Çıkış ölçütü:** Temiz klasörde istemci ve sunucu yerelde birlikte açılır;
ortak tipler derlenir ve boş bir PWA telefonda görüntülenir.

**Durum: TAMAMLANDI.** npm workspace monorepo, React/Vite PWA kabuğu, Node/
WebSocket başlangıç sunucusu, ortak tip/katalog paketi, manifest/service worker
ve temel teknik dokümantasyon oluşturuldu. Tip kontrolü, production build,
HTTP health ve WebSocket smoke testleri geçti.

### Aşama 3 — Oda ve gerçek zamanlı bağlantı çekirdeği

- VDS üzerinde çalışacak WebSocket tabanlı oda sunucusunu kurmak.
- Katılım kodu, takma ad, oda yöneticisi ve oyuncu varlık durumunu yapmak.
- Oda yöneticisinin oyun ekleme/çıkarma, manuel seçim ve rastgele oyun sayısı
  belirleme akışını kurmak.
- Mini oyunun minimum oyuncu şartına uymayan seçimleri lobi seviyesinde
  göstermek veya engellemek.
- Yeniden bağlanma, aynı oyuncunun tekrar bağlanması, oda kapanması ve boş oda
  temizliği için temel akışı yapmak.
- Maç verisini RAM'de tutmak; maç bitince oda/maç durumunu temizlemek.

**Çıkış ölçütü:** 2–8 telefon aynı odaya katılır, host oyun listesini değiştirir
ve bütün istemciler aynı oyuncu/oda durumunu gecikmesiz görür.

**Durum: TAMAMLANDI.** RAM tabanlı WebSocket oda çekirdeği, host oyun seçimi,
oyuncu varlık durumu, yeniden bağlanma ve oda temizliği çalışır hâle getirildi.
Detaylı uygulama kaydı `docs/ASAMA-03-ODA-VE-REALTIME.md` dosyasındadır.

### Aşama 4 — Ortak mini oyun motoru ve puan sözleşmesi

- Her oyunu kayıt edilebilir bir `GameDefinition` olarak tanımlamak.
- Sunucu otoriteli faz makinesi: tutorial, hazırlanma, oynama, sonuç ve geçiş.
- Sunucu saatine göre süre, geri sayım, zaman damgası ve aynı anda gelen
  hamlelerin deterministik işlenmesini yapmak.
- Gizli hamlelerin yalnızca ilgili oyuncuya gönderilmesini sağlamak.
- Tek seferlik hamle, tekrar hamle, geç hamle, boş seçim, elenme ve izleyici
  durumlarını ortak sözleşmeye bağlamak.
- Mini oyun puanı ile genel skor aktarımını, beraberlikleri ve eşitlikleri
  ortak ama oyun tarafından özelleştirilebilir hâle getirmek.
- Rastgele seçimleri sunucu tarafında üretmek ve aynı maçta oyun tekrarını
  engellemek.

**Çıkış ölçütü:** Gerçek bir oyun yazmadan sahte bir mini oyun simülasyonu;
faz geçişi, süre, gizli bilgi, input kilidi ve puan sonucu testlerden geçer.

### Aşama 5 — Neon arcade görsel sistemi ve 2.5D asset pipeline

- Üretilen hedef görsellere dayalı renk, ışık, tipografi, kart, buton ve panel
  tasarım tokenlarını oluşturmak.
- Sekiz farklı karakteri aynı stil, kamera açısı ve animasyon mantığıyla
  hazırlamak.
- Katmanlı 2.5D sahne sistemi: arka plan, orta plan, karakter, UI, gölge,
  parallax, glow, parçacık ve kamera geçişleri.
- Ortak karakter durumlarını yapmak: bekleme, hazırlanma, hamle, doğru, yanlış,
  kazanma, kaybetme, şaşırma ve komik tepkiler.
- Her oyunun tutorial görseli, arka planı, ikonları, efektleri ve ses gereksinimi
  için düzenli asset klasör/pipeline yapısını kurmak.
- Telefon GPU'suna uygun texture boyutu, lazy loading ve sahne kaynak yönetimini
  belirlemek.

**Çıkış ölçütü:** En az bir örnek sahne gerçek telefonda akıcı çalışır; karakter,
ışık, kamera ve UI aynı görsel sistemin parçası gibi görünür.

### Aşama 6 — Dikey dilim: üç farklı oyun tipini uçtan uca bitirme

- `butona-bas`: sık zaman pencereli ortak input ve sıralı mini oyun puanı.
- `sizma`: gizli rol, sözlü ipucu, herkes hazır olunca oylama ve sonuç.
- `zaman-bombasi-hafizasi`: dinamik dizi, oyuncu sırası, hata ile elenme ve
  başlangıç uzunluğuna sıfırlama.
- Bu üç oyunda gerçek server akışı, telefon inputu, 10 saniyelik tutorial,
  2.5D sahne, animasyon, sonuç kartı ve genel skor ekranını tamamlamak.
- Bu aşamada ortak motorun eksiklerini düzeltmek; placeholder yerine üretim
  kalitesine yakın ilk görsel standardı yakalamak.

**Çıkış ölçütü:** Oda kurmadan sonuç ekranına kadar 2–8 oyunculu tam maç,
yerelde ve staging VDS'te baştan sona oynanır.

### Aşama 7 — Oyun Paketi A: zaman, sayı ve gizli hamle oyunları

Aşağıdaki oyunlar aynı yüksek tempolu seçim/zaman/puan altyapısı ailesi içinde
eklenecek:

- `gizli-hirsiz`
- `kor-kronometre`
- `kor-bomba`
- `acgozluluk-limiti`
- `ortalamanin-yarisi`
- `gizli-kareler`
- `cizgiyi-gecme`
- `gizli-alisveris`
- `asiri-yukleme`
- `capraz-ates`

Her oyun için kendi kuralları, gizli bilgi görünümü, tutorialı, sahnesi,
animasyonu ve puan testi ayrı tamamlanacak; ortak altyapı kopyalanmayacak.

**Çıkış ölçütü:** Paket A'daki 10 oyun host seçimi, minimum oyuncu filtresi,
maç sırası ve genel skorla birlikte oynanabilir.

### Aşama 8 — Oyun Paketi B: sosyal, stratejik ve etkileşimli oyunlar

Aşağıdaki oyunlar sosyal çıkarım, eşleştirme, oylama, risk ve fiziksel tartışma
akışlarıyla eklenecek:

- `yazi-yaz`
- `kendim`
- `sozluk-blofu`
- `cagrisim-agi`
- `rusvet-darbe`
- `karalama-defteri`
- `ittifak`
- `kontrol-paneli-kaosu`
- `zehirli-kadeh`

Sesli iletişim sistem içine eklenmeyecek; uygulama yalnızca sırayı, gizli
bilgiyi, hazır/oylama butonlarını ve görsel tepkileri yönetecek.

**Çıkış ölçütü:** Paket B'deki 9 oyun farklı oyuncu sayılarında doğru faz,
puan ve sonuç davranışıyla çalışır; hiçbirinde bot veya kalıcı veri kalmaz.

### Aşama 9 — Tam maç entegrasyonu, UX ve performans kalite kapısı

- 24 oyunun lobi seçiminden maç sonuna kadar tek akışta birleşmesini sağlamak.
- Aynı oyunun tekrar etmemesi, rastgele oyun sayısı, oyun sırası ve minimum
  oyuncu filtrelerini tüm katalogda doğrulamak.
- Dikey lobi ve yatay öncelikli oyun ekranını; küçük/büyük telefonlarda,
  çentik ve safe-area durumlarında test etmek.
- Dokunma alanları, okunabilirlik, geri bildirim, loading, bağlantı kopması ve
  yeniden bağlanma UX'ini düzeltmek.
- 2–8 oyuncu, her oyunun minimum oyuncu sınırı, hızlı ardışık hamle, gecikme,
  eşzamanlılık ve yanlış faz input testlerini yapmak.
- FPS, bellek, asset yükleme, WebSocket gecikmesi ve düşük cihaz davranışını
  ölçüp optimize etmek.

**Çıkış ölçütü:** Tüm katalog gerçek telefon test matrisinden geçer; kullanıcı
  oyun sırasında hangi aşamada olduğunu ve aldığı puanı karıştırmaz.

### Aşama 10 — İzole VDS yayını, arkadaş grubu pilotu ve teslim

- Glix frontend/backend servislerini mevcut `api.lynrax.com` ve
  `game.lynrax.com` projelerine dokunmadan ayrı servis/alan adı düzenine almak.
- Nginx reverse proxy, process/container çalıştırma, health check, log ve
  yeniden başlatma akışını kurmak.
- Production build, asset cache, PWA güncelleme ve geçici oda temizliği yapmak.
- VDS üzerinde 2–8 gerçek telefonla uçtan uca pilot maçlar oynamak.
- Pilotta çıkan kural, UX, performans ve bağlantı hatalarını düzeltip ilk sürüm
  kabul listesini tamamlamak.

**Çıkış ölçütü:** Arkadaş grubu yeni Glix adresine girip oda oluşturur, seçilen
  oyunları oynar, genel skor ekranını görür ve maç bitince geçici veriler
  temizlenir.

## 7. Aşama çalışma protokolü

Her aşamada şu sıra izlenecek:

1. Bu dosya okunacak ve mevcut durum tazelenecek.
2. Aşamanın amacı ve kabul ölçütleri netleştirilecek.
3. Gerekli dosyalar incelenecek.
4. Değişiklikler uygulanacak.
5. Uygun testler gerçek cihaz/simülasyon üzerinde yapılacak.
6. Yapılan dosyalar, test sonucu, açık konular ve sonraki adım bu dosyaya
   yazılacak.

Bir aşama tamamlanmış kabul edilmeden sonraki aşamaya geçilmeyecek. Mini oyun
kuralları için ayrıca kullanıcı onayı alınacak.

## 8. İlk durum kaydı

### Tamamlananlar

- Glix'in Liars Bar olmadığı ve projenin Glix'in yeniden yapımı olduğu netleşti.
- Kaos parti oyunu, Türkçe, telefon odaklı ürün kapsamı netleşti.
- 2–8 oyuncu, takma ad, katılım kodu, botsuz yapı ve oda yöneticisi kararları
  alındı.
- Rastgele / manuel mini oyun seçimi ve aynı oyunu tekrar etmeme kararı alındı.
- Neon arcade, yüksek kaliteli 2.5D ve 8 karakterli görsel hedef belirlendi.
- Yatay öncelikli mini oyun sahnesi ve responsive lobi yaklaşımı belirlendi.
- VDS, WebSocket, geçici oda verisi ve mevcut oyundan izolasyon yönelimi
  belirlendi.
- Aşama 2 temiz proje iskeleti oluşturuldu: `apps/client`, `apps/server` ve
  `packages/shared` workspace'leri ayrıldı.
- React/Vite telefon PWA kabuğu, manifest, service worker ve temel neon arcade
  giriş ekranı eklendi.
- Ortak mini oyun kataloğu, faz/oda tipleri ve istemci-sunucu protokol tipleri
  tek pakete alındı.
- Node/WebSocket sunucusunda `/health` ve `/ws` başlangıç uçları çalışır hâle
  getirildi.
- Aşama 3 oda ve gerçek zamanlı çekirdeği tamamlandı: oda kodu, host, oyuncu
  varlığı, manuel/rastgele oyun seçimi, minimum oyuncu uyarıları, yeniden
  bağlanma, host aktarımı ve RAM oda temizliği eklendi.
- Aşama 4 ortak mini oyun motoru tamamlandı: sunucu saatli faz makinesi,
  hazırlanma/hazır olma akışı, tekil/tekrarlı/boş/geç hamle sözleşmesi, gizli
  hamle görünürlüğü, seyirci durumu ve sıralı puan yardımcıları eklendi.
- Aşama 5 Neon Toybox görsel sistemi tamamlandı: ortak asset manifesti,
  kritik/lazy görsel yükleme cache'i, katmanlı sahne vitrini, prosedürel 8
  karakter varyantı, parallax ızgara, ışık/reaktör/parçacık efektleri ve
  `prefers-reduced-motion` desteği eklendi.
- İlk ortak Neon Toybox sahne arka planı ve 8 karakter roster referansı
  `apps/client/public/assets` altında proje içine alındı; PWA shell cache'i
  kritik arka plan asseti için v2'ye yükseltildi.
- Hedef görsel prototipleri oluşturuldu.
- GitHub deposu çalışma klasörüne klonlandı; depo başlangıçta boştu.
- Bu kalıcı proje hafızası oluşturuldu.
- Tüm mini oyunların cevaplanabilir kural formu oluşturuldu, dolduruldu ve
  kilitlendi:
  `C:\Users\Xpike\Desktop\oyun\GLIX-MINIOYUN-KURALLARI-FORMU.md`.

### Henüz yapılmayanlar

- Aşama 6 dikey dilimindeki gerçek mini oyun adapter'ları ve özel puanlama.
- Kalan oyunlar için özel puanlama uygulamaları.
- Oyunlara özel üretim assetlerinin katmanlı dosyalara dönüştürülmesi.
- Mini oyunlara özel animasyon ve sahne davranışları.
- Mini oyunların yeni sürüme aktarılması.
- Telefon ve VDS testleri.

### Şu anki aşama

**Aşama 6 — Dikey dilim: Butona Bas, Sızma ve Zaman Bombası Hafızası.**

Eski katalog çıkarıldı. 24 katalog oyununun kural, puan, süre, tutorial, görsel
ve teknik kenar durumları forma işlendi ve kilitlendi. `kusursuz-denge` kapsam
dışıdır. Aşama 1, Aşama 2, Aşama 3, Aşama 4 ve Aşama 5 tamamlandı. Sıradaki
çalışma; Neon Toybox sahnesinin üç gerçek mini oyun adapter'ı ile uçtan uca
birleştirilmesidir.

## 9. Değişiklik günlüğü

### 2026-09-01 — İlk kayıt

- Proje hafızası oluşturuldu.
- Kullanıcının 50 planlama cevabı kararlar bölümüne işlendi.
- Asset, background, karakter ve efekt üretiminin asistan tarafından yapılacağı
  kaydedildi.
- 10 aşamalı geliştirme planı kaydedildi.
- `C:\Users\Xpike\Desktop\oyun` yeni Glix çalışma alanı olarak belirlendi.
- GitHub deposunun boş olduğu kaydedildi.
- Eski `C:\Users\Xpike\Desktop\glix` klasörünün korunacağı kaydedildi.

### 2026-09-01 — Eski mini oyun kataloğu çıkarıldı

- Eski `data/games.js` dosyasından 24 mini oyun envantere alındı.
- Katalog dışı `kusursuz-denge` motor dalı ayrıca not edildi.
- Eski açıklama ve sürelerin yeni sürüm kuralı olmadığı açıkça işaretlendi.

### 2026-09-01 — İlk mini oyun taslağı hazırlandı

- `yazi-yaz` oyununun eski dosyalardaki akışı incelendi.
- Kaynak davranış ile yeni sürümde onaylanmış kural birbirinden ayrıldı.
- Kural belirsizlikleri onay bekleyen maddeler olarak kaydedildi.

### 2026-09-01 — `Yazı Yaz` çekirdek kuralları güncellendi

- Tek yazan yerine iki yazan kuralı kesinleştirildi.
- Yazanların da diğer yazanı ve kelimesini tahmin ederek puan alacağı kaydedildi.
- Puanlama +1 kelime, +1 yazan ve 0 puan tahmin göndermeme olarak güncellendi.
- Faz süreleri 30 / 60 / 30 saniye olarak güncellendi.
- Kelimelerin oyuncular tarafından yazılacağı ve girişlerin büyük harfe
  normalize edileceği kaydedildi.

### 2026-09-01 — `Yazı Yaz` kural seti kilitlendi

- Masum oyuncuların yalnızca bir yazan ve bir kelime tahmin edeceği kesinleştirildi.
- Yazanların yalnızca diğer yazanı ve onun kelimesini tahmin edeceği kesinleştirildi.
- Aynı kelimenin iki yazan tarafından da kullanılabileceği kaydedildi.
- Minimum oyuncu sayısı 3 olarak belirlendi.
- `yazi-yaz` için kural onayı tamamlandı; yeni altyapı aşamasında kodlanacak.

### 2026-09-01 — `Kendim` kaynak davranış taslağı hazırlandı

- Her oyuncunun tek kelime yazdığı ve kelimelerin kart olarak karıştırıldığı
  eski akış kaydedildi.
- Her kartın sahibine eşleştirilmesi ve eski puanlama davranışı incelendi.
- `kendim` için yeni sürüm kuralları kullanıcı onayına bırakıldı.

### 2026-09-01 — `Kendim` puanlama yönü güncellendi

- Kelime sahibi bonusunun yalnızca tek doğru eşleştirmede verileceği belirlendi.
- İki veya daha fazla doğru eşleştirmede ya da hiç doğru eşleştirmede sahip
  bonusu olmayacağı belirlendi.
- İlk taslakta eşleştirmenin zorunlu olacağı yazıldı; bu karar sonraki
  düzeltmede kaldırıldı. Yanlış tahminlerin mini oyun içinde negatif puan
  doğuracağı kaydedildi.
- Mini oyun sonunda en yüksek puanlı oyuncuların genel skorda +1 alacağı,
  eşitlikte tüm eşit oyuncuların +1 alacağı belirlendi.

### 2026-09-01 — `Kendim` eşleştirme zorunluluğu düzeltildi

- Oyuncuların tüm kelime kartlarını eşleştirmek zorunda olmayacağı kesinleştirildi.
- Seçilmeyen kartların puan etkisi ve minimum tahmin sayısı açık madde olarak
  bırakıldı; varsayım yapılmayacak.

### 2026-09-01 — `Kendim` puanlama yönü kesinleştirildi

- Tahmin yapmanın zorunlu olmadığı kesinleştirildi.
- Boş bırakılan kartların 0 puan olacağı kesinleştirildi.
- Doğru eşleştirmenin +1, her yanlış eşleştirmenin ayrı ayrı -1 olacağı
  kesinleştirildi.
- Kelime sahibinin yalnızca tek oyuncu tarafından doğru bulunursa +1 bonus
  alacağı kesinleştirildi.
- Mini oyun sonunda en yüksek puanlı oyuncuların genel skorda +1 alacağı,
  eşitlikte tüm eşit oyuncuların +1 alacağı kesinleştirildi.
- `kendim` puanlamasının çekirdeği onaylandı; süre, minimum oyuncu, kelime
  uzunluğu, kendi kelimesini eşleştirme, aynı kelime ve eksik gönderim kararları
  da kesinleştirildi.

### 2026-09-01 — `Kendim` kural seti kilitlendi

- Faz süreleri 30 / 30 saniye olarak belirlendi.
- Minimum oyuncu sayısı 3 olarak belirlendi.
- Kelime uzunluğu sınırının olmayacağı belirlendi.
- Oyuncunun kendi kelimesini kendisiyle eşleştiremeyeceği belirlendi.
- Aynı kelimenin birden fazla oyuncu tarafından kullanılabileceği belirlendi.
- Hiç tahmin göndermeyen oyuncunun 0 puan alacağı belirlendi.
- `kendim` için kural incelemesi tamamlandı; yeni altyapı aşamasında kodlanacak.

### 2026-09-01 — `Sızma` kaynak davranış taslağı hazırlandı

- Tek sızma oyuncusu, ortak/sızma kelime çifti, ipucu ve oylama akışı incelendi.
- Eski +1 / +2 puan davranışı ve eşit oy durumundaki kaynak davranış not edildi.
- `sizma` için yeni sürüm kuralları kullanıcı onayına bırakıldı.

### 2026-09-01 — `Sızma` ana akışı güncellendi

- Tek sızma, sistem kelime havuzu ve iki farklı kelime yapısı onaylandı.
- Yazılı ipucu yerine, herkesin sırayla iki kez sesli ipucu vereceği belirlendi.
- İpucu aşamasının zamanlayıcısız olacağı ve herkesin “Oylamaya geç” düğmesine
  bastıktan sonra 30 saniyelik oylamanın başlayacağı belirlendi.
- Tek oy, kendini oylama, eşitlikte sızmanın kazanması ve minimum 3 oyuncu
  kararları kaydedildi.
- Sızma yakalandığında normal oyuncuların +1, yakalanmadığında sızmanın +2
  alacağı kaydedildi; sızmanın yakalandığı durumdaki puanı açık bırakıldı.

### 2026-09-01 — `Sızma` kural seti kilitlendi

- Sızma yakalandığında sızmanın 0 puan alacağı kesinleştirildi.
- Arkadaş grubunda herkesin iki ipucunu verip geçiş düğmesine basacağı kabul
  edildi; eksik katılım için ek ceza veya alternatif akış eklenmeyecek.
- `sizma` için kural incelemesi tamamlandı; yeni altyapı aşamasında kodlanacak.

### 2026-09-01 — `Sözlük Blöfü` kaynak davranış taslağı hazırlandı

- Sistem kelimesi, gerçek tanım, oyuncu blöfleri ve karışık seçenek akışı
  incelendi.
- Doğru seçen oyuncu ve blöfü seçilen oyuncu için eski puan davranışı not edildi.
- `sozluk-blofu` için yeni sürüm kuralları kullanıcı onayına bırakıldı.

### 2026-09-01 — `Sözlük Blöfü` kural seti kilitlendi

- Geniş kelime havuzu, zorunlu sahte tanım ve karışık seçenek akışı belirlendi.
- Tanım uzunluğu 100 karakter olarak belirlendi.
- Doğru seçim +1, blöf sahibine seçim başına +1 ve yanlış seçimde 0 kararı
  kesinleştirildi.
- Kendi blöfünü seçememe, 50 / 30 saniye süre ve minimum 3 oyuncu kararları
  kaydedildi.
- `sozluk-blofu` için kural incelemesi tamamlandı; yeni altyapı aşamasında
  kodlanacak.

### 2026-09-01 — `Çağrışım Ağı` kaynak davranış taslağı hazırlandı

- Ortak ana kelime, tek çağrışım, cevap gruplama ve tekrar sayısına göre puan
  akışı incelendi.
- Tek kalan ve boş cevapların eski davranışı not edildi.
- `cagrisim-agi` için yeni sürüm kuralları kullanıcı onayına bırakıldı.

### 2026-09-01 — `Çağrışım Ağı` kural seti kilitlendi

- Oyuna özel geniş kelime havuzu, zorunlu tek çağrışım ve serbest metin kararı
  alındı.
- Karakter sınırı kaldırıldı; 30 saniye süre ve minimum 2 oyuncu belirlendi.
- En az iki kişilik gruplarda grup büyüklüğü kadar puan, tek cevapta 0 puan ve
  negatif puan olmaması kesinleştirildi.
- `cagrisim-agi` için kural incelemesi tamamlandı; yeni altyapı aşamasında
  kodlanacak.

### 2026-09-01 — `Butona Bas` kaynak davranış taslağı hazırlandı

- Tek/çoklu basış penceresi, 1,2 saniyelik eski pencere mantığı ve süre içi
  puan birikimi incelendi.
- Kullanıcının çoklu basışta +1, tek basışta -1 ana kuralı hafızaya alındı.
- Eski üst yarı bonusunun yeni sürüme taşınmayacağı not edildi.

### 2026-09-01 — `Butona Bas` kural seti kilitlendi

- Toplam süre 45 saniye, zaman penceresi 0,3 saniye ve minimum oyuncu sayısı 2
  olarak belirlendi.
- Aynı oyuncunun bir pencere içindeki tekrar basışları tek oyuncu sayılacak.
- Tek basışta -1, aynı pencerede iki veya daha fazla farklı oyuncu basışında
  basanların her birine +1 mini oyun puanı verilecek.
- Tek lider genel skorda +2, sonraki oyuncu +1 alacak; liderlik eşitse en yüksek
  puanı paylaşanların tamamı +1 alacak ve +2 uygulanmayacak.
- `butona-bas` kural incelemesi tamamlandı; sıradaki oyun `rus-ruleti`.

### 2026-09-01 — `Rus Ruleti` kaynak davranış taslağı hazırlandı

- Rastgele başlangıç sahibi, hedef seçimi, yüzde bazlı patlama riski, güvenli
  atışta silahın hedefe geçmesi ve patlamada hedefin elenmesi incelendi.
- Eski riskin 16’dan başlayıp güvenli atışlarda +10 artarak 76’da sınırlanması,
  patlamada 16’ya dönmesi kaydedildi.
- Oyunun hayatta kalanlar başlangıç sayısının yarısına düşünce bitmesi ve eski
  kaynakta hayatta kalanlara +1 verilmesi not edildi.
- 18 saniyelik karar süresi ve hamle gelmezse otomatik rastgele atış davranışı
  kaydedildi.

### 2026-09-01 — `Rus Ruleti` kural seti kilitlendi

- Minimum oyuncu sayısı 2, rastgele başlangıç sahibi ve kendini hedefleyebilme
  kararları kesinleştirildi.
- Güvenli atışta silahın hedefe geçmesi; riskin %16’dan başlayıp +10 artarak
  %76’da sınırlanması onaylandı.
- Patlamada hedefin elenmesi, riskin %16’ya dönmesi ve yeni sahibin rastgele
  seçilmesi onaylandı.
- Hayatta kalanlar başlangıç sayısının yarısına düşünce oyunun biteceği; hayatta
  kalanların +1, elenenlerin 0 alacağı kesinleştirildi.
- 18 saniyelik karar süresi, otomatik rastgele atış ve elenenlerin izleyici
  olması onaylandı.
- `rus-ruleti` kural incelemesi tamamlandı; sıradaki oyun `gizli-hirsiz`.

### 2026-09-01 — Tüm mini oyunlar için kural formu hazırlandı

- Kilitli ilk yedi oyunun onaylı kararları tek dosyada toplandı.
- Kalan 17 katalog oyunu için eski kaynak özeti ve doldurulacak kural alanları
  eklendi.
- Katalog dışında bulunan `kusursuz-denge` için dahil edilme ve kural alanları
  ayrıca eklendi.
- Kullanıcının formu doldurup geri göndermesi bekleniyor; cevaplar incelendikten
  sonra eksik ve çelişkili noktalar sorulacak.

### 2026-09-01 — Toplu mini oyun formu incelendi ve kurallar kilitlendi

- `gizli-hirsiz` ile `zaman-bombasi-hafizasi` arasındaki kalan oyunların yeni
  sürüm cevapları formdan okundu.
- Kullanıcının tutorial, görsel/animasyon, limit tablosu, market içeriği ve
  teknik kenar durumlarını asistanın tasarlamasına bıraktığı kaydedildi.
- `kusursuz-denge` oyununun yeni sürüme alınmayacağı kesinleştirildi.
- Kör Bomba bilgi görünümü, Açgözlülük Limiti aşımı, Kontrol Paneli ipucu yönü,
  Rüşvet ve Darbe eşitlik çözümü, Gizli Kareler erken elenme durumu ve Zaman
  Bombası başlangıç/reset akışı kullanıcı cevaplarıyla netleştirildi.
- Tüm oyunların tutorial, sahne, animasyon ve teknik kenar durumları forma
  işlendi; açık kural maddesi kalmadı.
- Aşama 1 tamamlandı; sıradaki çalışma Aşama 2 temiz proje iskeleti ve ortak
  gerçek zamanlı mimaridir.

### 2026-09-01 — Kural setine göre geliştirme planı yeniden düzenlendi

- İlk genel 10 aşamalı plan, 24 oyunun kesin kurallarına göre baştan yazıldı.
- Ortak WebSocket oda çekirdeği, faz/puan motoru ve 2.5D görsel sistem ayrı
  aşamalara bölündü.
- Dikey dilim için `butona-bas`, `sizma` ve `zaman-bombasi-hafizasi` seçildi;
  böylece zaman penceresi, gizli rol/oylama ve dinamik hafıza akışları erken
  test edilecek.
- Kalan oyunlar Paket A (zaman/sayı/gizli hamle) ve Paket B
  (sosyal/stratejik/etkileşimli) olarak ayrıldı.

### 2026-09-01 — Aşama 2 teknik temel tamamlandı

- npm workspace monorepo ve `apps/client`, `apps/server`, `packages/shared`
  klasörleri oluşturuldu.
- React/Vite PWA kabuğu, manifest, service worker ve neon arcade başlangıç
  ekranı eklendi.
- 24 oyunluk ortak katalog ile temel faz, oda, oyuncu ve protokol tipleri
  ortak pakete alındı.
- Node/WebSocket sunucusuna `/health` ve `/ws` başlangıç uçları eklendi.
- `npm run typecheck`, `npm run build`, HTTP health ve WebSocket smoke testleri
  başarıyla tamamlandı.
- Aşama 2 tamamlandı; sıradaki çalışma Aşama 3 oda ve gerçek zamanlı bağlantı
  çekirdeğidir.

### 2026-09-02 — Aşama 3 oda ve gerçek zamanlı çekirdek tamamlandı

- `packages/shared/src/index.ts` içinde oda seçim modu, reconnect ve oda yaşam
  döngüsü için ortak istemci-sunucu mesajları tanımlandı.
- `apps/server/src/index.ts` içinde RAM tabanlı oda kaydı, 5 karakterli oda kodu,
  host yönetimi, 8 oyuncu kapasitesi, manuel/rastgele oyun seçimi ve minimum
  oyuncu doğrulaması uygulandı.
- Bağlantı kopması sonrası 120 saniyelik yeniden bağlanma penceresi, aynı
  oyuncunun oturumunu sürdürmesi, host aktarımı ve boş oda temizliği eklendi.
- `apps/client/src/App.tsx` ve `styles.css` ile oda oluşturma/katılma, oyuncu
  varlık göstergesi, host oyun yönetimi, oda kodu kopyalama ve responsive neon
  lobi tamamlandı.
- Tek oyunculu odada manuel oyun listesinin güncellenmesini engelleyen doğrulama
  hatası düzeltildi; rastgele seçim üst sınırı yalnızca rastgele modda uygulandı.
- `docs/ASAMA-03-ODA-VE-REALTIME.md` uygulama ve kabul kaydı olarak eklendi.
- `npm run typecheck`, `npm run build`, iki istemcili WebSocket smoke testi ve
  iki tarayıcı sekmeli UI senkronizasyon testi başarıyla tamamlandı.
- Aşama 3 tamamlandı; sıradaki çalışma Aşama 4 ortak mini oyun motorudur.

### 2026-09-02 — Aşama 4 ortak mini oyun motoru tamamlandı

- `packages/shared/src/engine.ts` içinde kayıt edilebilir mini oyun tanımı,
  ortak `tutorial → preparing → playing → results → transition → finished`
  faz makinesi ve sunucu zamanı temelli geçişler oluşturuldu.
- Tekil, tekrarlı ve hamlesiz input politikaları; boş, geç, tekrar ve faz kilidi
  sonuçları; oyuncu eliminasyonu ve seyirci durumu ortak sözleşmeye bağlandı.
- Özel hamlelerin yalnızca sahibine görünmesi, sunucu alım sırası ve aynı zaman
  damgasındaki deterministik işlem davranışı test edildi.
- `rankScores`, `createRankAwards`, `applyScoreDeltas` ve delta dönüşümleri ile
  mini oyun puanı/genel skor ayrımı ve lider eşitliği yardımcıları eklendi.
- `client:room:start`, `client:game:ready`, `client:game:submit` ve prova
  sonuç mesajları sunucuya bağlandı; rastgele oyun rotası maç başında sunucuda
  bir kez ve tekrarsız çözülüyor.
- Lobiye gerçek oyun kuralları yerine açıkça motoru gösteren Aşama 4 “Motor
  Provası” akışı eklendi; 10 saniye tutorial, hazırlık, 12 saniye oynama,
  sonuç ve geçiş ekranları çalışıyor.
- `packages/shared/src/engine.test.ts` ile beş otomatik motor testi ve
  `docs/ASAMA-04-MOTOR-VE-PUAN.md` uygulama kaydı eklendi.
- `npm test`, `npm run typecheck`, `npm run build`, iki istemcili WebSocket
  faz/input/gizlilik testi ve iki tarayıcı sekmeli UI testi başarıyla tamamlandı.
- Aşama 4 tamamlandı; sıradaki çalışma Aşama 5 Neon Toybox 2.5D görsel sistemi.

### 2026-09-02 — Aşama 5 Neon Toybox görsel sistemi tamamlandı

- `apps/client/src/visuals/assetManifest.ts` ile ortak asset yolları, kritik ve
  lazy yükleme seviyeleri, texture kenar bütçesi ve 8 karakter varyantı tek
  yerde tanımlandı.
- `apps/client/src/visuals/NeonToyboxScene.tsx` ile arka plan, atmosfer,
  parallax ızgara, sahne platformu, reaktör, karakterler ve foreground efektleri
  katmanlı canlı vitrine bağlandı.
- Sahne; tutorial, hazırlık, oynama, sonuç ve bitiş fazlarına göre reaktör,
  ışık, aura, progress ve karakter durumlarını telefonda CSS animasyonlarıyla
  oynatıyor. Ağ üzerinden kare kare animasyon gönderilmiyor.
- `apps/client/public/assets/stage/neon-toybox-arcade-deck-v1.png` ortak sahne
  arka planı, `apps/client/public/assets/characters/neon-toybox-roster-v1.png`
  ise 8 karakter stil referansı olarak eklendi.
- Service worker shell cache'i `glix-shell-v2` olarak güncellendi ve kritik
  sahne arka planı shell listesine alındı.
- `docs/ASSET-PIPELINE-NEON-TOYBOX.md` asset üretim, katman, yükleme ve mobil
  performans sözleşmesini belgeliyor; README durumu Aşama 5'e taşındı.
- `npm run typecheck`, `npm test` (5 test), `npm run build` ve iki oyunculu
  tarayıcı canlı sahne/faz testi başarılı.
- Aşama 5 tamamlandı; sıradaki çalışma Aşama 6 gerçek mini oyun dikey dilimidir.

### 2026-09-01 — Kontrol Paneli Kaosu hedef görseli üretildi

- `Kontrol Paneli Kaosu` için yatay telefon oyun ekranı konsepti oluşturuldu.
- Görselin atmosfer/moodboard dili: yüksek kaliteli 2.5D neon arcade; dört renk
  kablo, gizli ipucu kartı, bağlantı çizgileri, 8 avatar ve büyük dokunmatik
  renk butonları.
- Görsel referans dosyası:
  `C:\Users\Xpike\Desktop\oyun\docs\concepts\kontrol-paneli-kaosu-hedef-gorsel-v1.png`.
- V1'de diğer oyuncu panellerinin aynı ekranda gösterilmesi gerçek oynanış
  kuralına uygun değildir; bu nedenle V1 yalnızca atmosfer ve stil referansıdır.
- V1'de ipucu kartının görsel olarak kendi panelini tarif ediyor gibi görünmesi
  de hatalıdır. Doğru ilişkide kartın bulunduğu oyuncunun kendi kablo sırası ile
  ipucundaki koşul farklıdır; kart her zaman başka bir oyuncunun panelindeki
  doğru kabloyu belirler.
- Gerçek oyuncu ekranında yalnızca o oyuncunun dört kablolu paneli, kendi özel
  ipucu kartı ve kendi kesme butonları bulunacak. Diğer paneller, ipucunun sahibi
  ve hedef ilişkisi oynama sırasında gösterilmeyecek; oyun içi sohbet/balon da
  bulunmayacak. Bu arayüz için yeni bir V2 konsepti üretilecek.

### 2026-09-01 — Panel oyunu için üç sanat yönü karşılaştırması üretildi

- Aynı tek-panel oyun yerleşimi korunarak üç ayrı görsel yön hazırlandı:
  `Neon Toybox 2.5D`, `Dark Arcade Carnival` ve `Comic Book 3D`.
- Karşılaştırma dosyaları:
  - `C:\Users\Xpike\Desktop\oyun\docs\concepts\kontrol-paneli-kaosu-neon-toybox-v1.png`
  - `C:\Users\Xpike\Desktop\oyun\docs\concepts\kontrol-paneli-kaosu-dark-arcade-carnival-v1.png`
  - `C:\Users\Xpike\Desktop\oyun\docs\concepts\kontrol-paneli-kaosu-comic-book-3d-v1.png`
- Üç varyantta da diğer oyuncular yalnızca küçük avatar/durum göstergeleri
  olarak temsil edilir; başka panel veya ipucu-hedef bağlantısı bulunmaz.
- Kullanıcı `Neon Toybox 2.5D` yönünü seçti; bu yön Aşama 5'te tüm oyunlara ve
  asset pipeline'a uygulanacak. Diğer iki varyant karşılaştırma referansı olarak
  tutulacak.

### 2026-09-01 — Neon Toybox 2.5D ana stil olarak kilitlendi

- Ana görsel dil: parlak renkli oyuncak-plastik objeler, yuvarlatılmış bevel
  formlar, yumuşak neon ışık, okunaklı dokunmatik kontroller ve yüksek kaliteli
  2.5D katmanlı sahneler.
- Stil seçiminde öncelik; telefon performansı, okunabilirlik, animasyonların
  uygulanabilirliği ve asset tutarlılığı oldu.

### 2026-09-01 — Neon Toybox ana sayfa konsepti üretildi

- Ana sayfa/lobi için dikey telefon PWA konsepti hazırlandı.
- Görsel hiyerarşi: GLIX başlığı, oyuncak arcade portalı, karakter evreni,
  `ODA KUR`, `KATIL` ve `NASIL OYNANIR` aksiyonları.
- Referans dosyası:
  `C:\Users\Xpike\Desktop\oyun\docs\concepts\glix-ana-sayfa-neon-toybox-v1.png`.
- Bu dosya ilk konsept/referans olarak tutulacak; gerçek üretim arayüzünün
  kesin hedefi değildir. Gerçek butonlar ve metinler uygulamada HTML/CSS olarak
  oluşturulacak.

### 2026-09-01 — Ana sayfa görsel yönü revize edildi

- Ana sayfa V1'i fazla çocukça bulundu; V1 üretim hedefi olarak kabul edilmiyor.
- Neon Toybox ana stil olarak korunacak, ancak ana menüde premium/genç-yetişkin
  arcade alt yönü kullanılacak.
- Yeni ana sayfa yönü: daha az konfeti ve sevimli maskot, chibi hayvan yerine
  stilize cyber-arcade karakter/avatar dili, daha koyu arka plan, daha kontrollü
  neon renk paleti, daha keskin ve kaliteli arayüz panelleri.
- Parlak oyuncak-plastik malzeme, bevel ve dokunmatik buton hissi korunacak;
  ancak genel kompozisyon çocuk oyunu gibi değil, profesyonel parti arcade oyunu
  gibi görünecek.
- Ana sayfa için yeni V2 konsepti hazırlanacak; V1 yalnızca önceki deneme
  olarak saklanacak.

### 2026-09-02 — Aşama 6 gerçek mini oyun dikey dilimi tamamlandı

- `packages/shared/src/games.ts` içinde `butona-bas`, `sizma` ve
  `zaman-bombasi-hafizasi` için sunucu otoriteli gerçek adapter'lar oluşturuldu.
- Butona Bas: 45 saniye, 150 adet 0,3 saniyelik pencere, aynı pencere içinde
  oyuncu tekrarlarının tek sayılması, çoklu basışta `+1`, tek basışta `-1` ve
  kilitli genel sıralama ödülleri uygulandı.
- Sızma: rastgele sızma, gizli kelime/rol, iki tur zorunlu sözlü ipucu, herkes
  hazır bariyeri, 30 saniye oylama, eşitlikte sızmanın kazanması ve `+1`/`+2`
  genel skor aktarımı uygulandı. Kelime ve rol yalnızca ilgili oyuncunun
  `ownGameState` alanında gönderiliyor.
- Zaman Bombası Hafızası: dört renk, iki renk başlangıç dizisi, sabit karışık
  oyuncu sırası, doğru cevapta uzayan dizi, dizi uzunluğunun üç katı giriş süresi,
  hatada elenme ve `-1`/`+1` puan dağıtımı uygulandı.
- `server:match-state` içine public `gameState` ve oyuncuya özel
  `ownGameState` alanları eklendi; istemci telefon kontrolleri gerçek submit
  mesajlarını gönderiyor.
- Üç Neon Toybox oyun görseli üretildi ve
  `apps/client/public/assets/games/` altına alındı. Service worker shell cache'i
  `glix-shell-v3` olarak güncellendi.
- Aşama kabul kaydı `docs/ASAMA-06-GERCEK-MINIGAME-DILIMI.md` dosyasına eklendi.
- `npm test` (8 test), `npm run typecheck`, `npm run build` ve iki istemcili
  WebSocket gerçek oyun smoke testi başarılı oldu.
- Aşama 6 tamamlandı; sıradaki çalışma Aşama 7'de kalan katalog oyunlarının
  gerçek adapter'larını paketler hâlinde eklemek.

### 2026-09-02 — Aşama 7 Oyun Paketi A tamamlandı

- `packages/shared/src/games-stage7.ts` içinde 10 gerçek sunucu adapter'ı
  eklendi: `gizli-hirsiz`, `kor-kronometre`, `kor-bomba`,
  `acgozluluk-limiti`, `ortalamanin-yarisi`, `gizli-kareler`,
  `cizgiyi-gecme`, `gizli-alisveris`, `asiri-yukleme`, `capraz-ates`.
- Gizli Hırsız, Kör Kronometre ve sayı/risk oyunlarında seçimler sonuç fazına
  kadar gizli tutuluyor; eksik cevap davranışları kural formuna göre ayrı ayrı
  uygulandı.
- Kör Bomba'da taşıyıcıya patlama zamanı verilmez; diğer oyuncular kendi özel
  state'lerinde kalan süreyi görür. Paslar sunucu sırasıyla işlenir ve 1–4
  saniye ekler.
- Gizli Kareler'de 3×3/4×4 alan, çakışma eliminasyonu, ikinci raunt ve erken
  bitiş durumları; Aşırı Yükleme'de 100 enerji + gizli 3 saniye taşma akışı
  eklendi.
- Gizli Alışveriş'te 60 kredilik tekil ürün sepeti, alıcı sayısına bölünen ürün
  değeri ve en değerli sepet bonusu; Çapraz Ateş'te tek hedef, karşılıklı atış
  ve hedeflenme puanları eklendi.
- `Stage7GameControls.tsx` ile tüm Paket A oyunları için telefon dokunmatik
  kontrolleri ve Neon Toybox uyumlu CSS kontrol yüzeyleri hazırlandı.
- Ortak faz motoru Paket A'nın süreli ve adapter tarafından biten oyunlarını
  aynı `tutorial → preparing → playing → results → transition` akışına bağladı.
- `npm test` artık **18 test** çalıştırıyor; tüm testler, typecheck ve üretim
  build'i geçti. Canlı WebSocket smoke testinde Aşırı Yükleme'nin taşma ve
  sonuç fazı doğrulandı.
- Aşama 7 tamamlandı; sıradaki çalışma Aşama 8 sosyal/stratejik Paket B'dir.
- Yeni istemci kontrol yüzeylerinin eski PWA kabuğunda kalmaması için service
  worker cache'i `glix-shell-v4` olarak yükseltildi.

### 2026-09-02 — Aşama 8 Oyun Paketi B tamamlandı

- `packages/shared/src/games-stage8.ts` içinde kuralları formda kilitli dokuz
  gerçek sunucu adapter'ı eklendi: `yazi-yaz`, `kendim`, `sozluk-blofu`,
  `cagrisim-agi`, `rusvet-darbe`, `karalama-defteri`, `ittifak`,
  `kontrol-paneli-kaosu`, `zehirli-kadeh`.
- Yazı Yaz'da iki yazan/masum girişi, 30/60/30 fazları ve kişi/kelime ayrı
  tahmin puanları uygulandı.
- Kendim'de karışık kelime kartları, isteğe bağlı eşleştirme, doğru +1/yanlış
  -1, tek doğru eşleşen sahibine bonus ve mini oyun lideri +1 genel puanı
  uygulandı; oyuncunun kendi kartını kendisiyle eşleştirmesi reddedildi.
- Sözlük Blöfü ve Çağrışım Ağı'nda özel kelime havuzları, gizli/karışık tanım
  akışı ve Türkçe cevap normalizasyonu eklendi.
- Rüşvet ve Darbe'de gizli oy, eşitlikte taş-kağıt-makas, başkan dağıtımı,
  eksik oy/dağıtım için rastgele tamamlama ve kişi başı 2 jeton sınırı bağlandı.
- Karalama Defteri'nde 75 saniye düzenlenebilir stroke tabanlı çizim, aynı anda
  sergi açılımı, 20 saniye oy ve bilgisiz oyuncu sonucu; İttifak'ta 60 saniye
  sözlü pazarlık, 15 saniye gizli oy ve eksik oy için rastgele hedef uygulandı.
- Kontrol Paneli Kaosu'nda her oyuncuya benzersiz dört kablo sırası ve başka
  paneli tarif eden hedefi gizli ipucu; Zehirli Kadeh'te gizli zehir, tek takas,
  +5 saniye uzatma ve sonuçta temiz kadehe +1 eklendi.
- `apps/client/src/games/Stage8GameControls.tsx` ile tüm Paket B oyunlarının
  telefon dokunmatik kontrolleri, textarea/select/oylama yüzeyleri, canvas
  çizim tahtası, kablo paneli ve kadeh takas ekranı eklendi.
- Stage 8 sunucu sürümü `0.6.0`, istemci sürümü `0.6.0`, PWA shell cache'i
  `glix-shell-v5` oldu.
- `packages/shared/src/games-stage8.test.ts` ile dokuz oyunun kritik kural
  akışları test edildi; toplam `npm test` kapsamı 27 başarılı teste çıktı.
- `npm test`, `npm run typecheck` ve `npm run build` başarıyla tamamlandı.
- Katalogda gerçek adapter bekleyen iki oyun kaldı: `rus-ruleti` ve
  `son-kisi`. Bunlar Aşama 9 oyun dilimiyle birlikte tam maç kalite kapısında
  ele alınacak.
