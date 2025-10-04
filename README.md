# Payu Giveaway - Dark Neon Contest Edition 🎮

Modern, mobil uyumlu blockchain giveaway platformu. Squid Game temalı "Dark Neon Contest" tasarımı ile Web3 trendlerini birleştiren etkileyici bir deneyim.

## 🎨 Özellikler

### ✨ Tasarım & Animasyonlar
- **Dark Neon Contest** teması (Siyah zemin + neon pembe, teal, mor vurgular)
- Squid Game temalı karşılama animasyonu (◯ △ ⬜ sembolleri)
- Glassmorphism + neon glow efektleri
- Slot machine ticket animasyonu
- Parçacık sistemleri ve hover efektleri
- Mobil optimizasyonlu responsive tasarım

### 🔗 Blockchain Entegrasyonu
- **Smart Contract**: BSC Mainnet'te otomatik kayıt sistemi
- **Otomatik Ödül**: Kayıt olan her kullanıcıya 250M PAYU token
- **WalletConnect**: MetaMask, Trust Wallet, Binance Chain Wallet desteği
- **Gas Fee**: Kullanıcı sadece 0.00098 BNB + gas fee öder

### 🎯 Görev Sistemi
- 3 sıralı sosyal medya görevi (Telegram, X, Instagram)
- Squid Game sembolleri ile görsel tasarım
- Animasyonlu görev tamamlama geçişleri
- Progress bar ile ilerleme takibi

### 👨💼 Admin Paneli
- Sadece admin cüzdan erişimi
- Gerçek zamanlı istatistikler
- CSV export özelliği
- Tüm katılımcı verilerini görüntüleme

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Animasyonlar**: Framer Motion
- **Blockchain**: Wagmi v2, RainbowKit, Viem
- **Veritabanı**: Vercel KV (Redis)
- **Deployment**: Vercel

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Çevre Değişkenleri
`.env.local` dosyasını oluşturun:
```bash
# Vercel KV (Redis)
KV_URL="your_kv_url"
KV_REST_API_URL="your_kv_rest_api_url"
KV_REST_API_TOKEN="your_kv_rest_api_token"
KV_REST_API_READ_ONLY_TOKEN="your_kv_rest_api_read_only_token"

# Admin Wallet
NEXT_PUBLIC_ADMIN_WALLET="0xd9C4b8436d2a235A1f7DB09E680b5928cFdA641a"

# Smart Contract
NEXT_PUBLIC_CONTRACT_ADDRESS="0x17A0D20Fc22c30a490FB6F186Cf2c31d738B5567"
NEXT_PUBLIC_PAYU_TOKEN="0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144"

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="c1814df663b82b65bb5927ad59566843"
```

### 3. Development
```bash
npm run dev
```

### 4. Build
```bash
npm run build
```

### 5. Deploy to Vercel
```bash
git add .
git commit -m "Initial commit"
git push

# Vercel Dashboard'dan import et
```

## 🎮 Sistem Akışı

### 1. Karşılama Ekranı
- Squid Game temalı animasyon (3-5 saniye)
- Geometrik şekiller döner, sayaç 0'dan 456'ya kadar sayar
- "Loading Giveaway..." yazısı ile atmosfer oluşturur

### 2. Ana Sayfa & Cüzdan Bağlama
- Neon tasarımlı ana sayfa
- "JOIN THE GIVEAWAY" butonu
- RainbowKit modal ile cüzdan seçimi
- Cüzdan bağlandığında otomatik kayıt işlemi

### 3. Smart Contract İşlemi
- 0.00098 BNB fee ile kayıt
- Otomatik 250M PAYU ödülü
- Ticket oluşturma (PAYU-XXX-XXX-XXX format)
- Backend'e kayıt bilgilerini kaydetme

### 4. Görevler Sayfası
- Ticket gösterimi (slot machine animasyonu)
- 3 sıralı sosyal medya görevi
- Squid Game sembolleri (◯ △ ⬜)
- Progress bar ile ilerleme takibi
- Görev tamamlama animasyonları

### 5. Email Toplama
- Tüm görevler tamamlandığında modal
- Email adresi toplama
- Başarı animasyonu

## 🎨 Tasarım Sistemi

### Renk Paleti
```css
/* Dark Neon Contest */
Arka Plan: #0B0F14
Neon Pembe: #FF2A6D
Teal/Yeşil: #2BB673
Mor Accent: #6A00FF
Altın Ödül: #FFD700
Başarı: #3BD671
Hata: #FF4545
Nötr Metin: #A7AAB3
```

### Bileşenler
- **Glassmorphism Kartlar**: %80 opak siyah + blur efekti
- **Neon Borderlar**: Glow efektli kenarlıklar
- **Squid Game Sembolleri**: ◯ △ ⬜ animasyonlu şekiller
- **Hover Efektleri**: Scale, glow, lift animasyonları

### Animasyonlar
- **Slot Machine**: Ticket oluşturma animasyonu
- **Parçacık Sistemleri**: Arka plan efektleri
- **Neon Glow**: Sürekli parlama efektleri
- **Micro-interactions**: Buton ve kart etkileşimleri

## 📱 Mobil Uyumluluk

- **Touch-friendly**: 44x44px minimum buton boyutları
- **Font Scaling**: iOS zoom engelleme (16px+)
- **Responsive Design**: Tüm ekran boyutları
- **WalletConnect**: Mobil cüzdan uygulamaları desteği
- **Performance**: Optimized animations ve lazy loading

## 🔐 Güvenlik

### Smart Contract Seviyesi
- EOA kontrolü (bot engelleme)
- Duplicate kayıt kontrolü
- Fee doğruluğu kontrolü
- PAYU bakiye kontrolü

### Backend Seviyesi
- Wallet duplicate kontrolü
- Admin wallet kontrolü
- Input validation
- Error handling

## 📊 Admin Paneli

### Erişim
- Sadece: `0xd9C4b8436d2a235A1f7DB09E680b5928cFdA641a`
- Cüzdan bağlantısı zorunlu
- Otomatik yetkilendirme kontrolü

### Özellikler
- **İstatistikler**: Toplam katılımcı, email'li, görev tamamlayan
- **Tablo**: Tüm kayıtları görüntüleme
- **CSV Export**: Excel uyumlu veri dışa aktarma
- **Real-time**: Anlık veri güncellemesi

## 🎯 Hedef Kitle

- **Web3 Kullanıcıları**: Blockchain deneyimi olan
- **Sosyal Medya Aktif**: Telegram, X, Instagram kullanıcıları
- **Mobil Öncelikli**: Telefon üzerinden katılım
- **Gaming Community**: Squid Game ve benzeri oyun sevenler

## 🚀 Performans

- **Loading**: 3-5 saniye animasyonlu karşılama
- **Responsive**: Tüm cihazlarda 60FPS
- **Optimized**: Lazy loading ve code splitting
- **CDN**: Vercel edge network kullanımı

## 📈 Analitik

- **Katılım Oranları**: Cüzdan bağlama vs tamamlama
- **Görev Tamamlama**: Hangi görevde drop-off oluyor
- **Cihaz Analizi**: Mobil vs desktop kullanım
- **Coğrafi Dağılım**: Hangi ülkelerden katılım

---

## 🎮 Live Demo

Proje canlıya alındığında buraya link eklenecek.

## 📞 Destek

Herhangi bir sorun için GitHub Issues kullanın.

---

**Not**: Bu proje eğitim amaçlıdır. Gerçek kullanım için güvenlik audit'i yapılması önerilir.
