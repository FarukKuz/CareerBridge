# CareerBridge Teknik Dokümantasyon


Bu doküman, CareerBridge projesinin geliştirme süreçlerinde uyulması gereken teknik standartları, dosya yapılarını ve kodlama kurallarını içerir. Tüm ekip üyelerinin bu standartlara uyması zorunludur.

## 🚀 Hızlı Başlangıç: Git İş Akışı

Projeye dahil olma ve geliştirme süreçleri için aşağıdaki Git komutlarını takip ediniz.

### 1. Yeni Özellik Geliştirme (Feature Branch)

1. **Projeyi klonlayın:**
```bash
git clone <repo_link>
```

2. **Proje dizinine girin:**
```bash
cd <repo_name>
```

3. **Yeni branch oluşturun** (Naming: `feature/özellik-adi`):
```bash
git checkout -b feature/gemini-api
```

4. **Geliştirmeleri yapın ve tüm dosyaları ekleyin:**
```bash
git add .
```

5. **Commit oluşturun** (Mesaj standardına uygun):
```bash
git commit -m "feat: add gemini api integration"
```

6. **Branch'i uzak sunucuya gönderin:**
```bash
git push origin feature/gemini-api
```

### 2. Pull Request (PR) Onaylandıktan Sonra

1. **Main branch'e geçin:**
```bash
git checkout main
```

2. **Localdeki eski feature branch'i silin:**
```bash
git branch -d feature/gemini-api
```

### 3. Güncel Kodları Çekme ve Yeni İş

1. **Main branch'i güncelleyin:**
```bash
git pull origin main
```

2. **Yeni özellik için branch açın:**
```bash
git checkout -b feature/yeni-ozellik
```

---

## İçindekiler
- [1. Teknoloji Standartları](#1-teknoloji-standartları)
- [2. Kodlama ve İsimlendirme Kuralları (Do's & Don'ts)](#2-kodlama-ve-isimlendirme-kuralları-dos--donts)
- [3. API ve Veri Standartları](#3-api-ve-veri-standartları)
- [4. Git ve Versiyon Kontrol](#4-git-ve-versiyon-kontrol)
- [5. Test ve QA](#5-test-ve-qa)
- [6. DevOps ve Altyapı](#6-devops-ve-altyapı)

---

## 1. Teknoloji Standartları

### Frontend (Next.js/React)
*Standart dosya yapısı ve teknoloji seçimi yukarıdaki gibidir.*

---

## 2. Kodlama ve İsimlendirme Kuralları (Do's & Don'ts)

### İsimlendirme Standartları
Kod okunabilirliği için isimlendirme kurallarına katı bir şekilde uyuyoruz.

| Tür | ✅ Doğru Kullanım | ❌ Yanlış Kullanım | Sebep |
| :--- | :--- | :--- | :--- |
| **Gelişkenler (JS)** | `userAge`, `isActive` | `UserAge`, `user_age`, `u` | camelCase kullanılmalı, kısaltma yapılmamalı. |
| **Fonksiyonlar** | `getUserData()`, `isValid()` | `userData()`, `get_data`, `process` | Fiil ile başlamalı, ne yaptığı anlaşılmalı. |
| **Componentler** | `UserProfile.tsx` | `userProfile.tsx`, `profile.tsx` | PascalCase olmalı ve spesifik isim verilmeli. |
| **Boolean** | `isLoading`, `hasError` | `loading`, `error`, `flag` | Soru sorar gibi (`is`, `has`, `can`) olmalı. |
| **Sabitler** | `MAX_RETRY_COUNT` | `maxRetry`, `retryCount` | Sabit değerler UPPER_SNAKE_CASE olmalı. |

### React Anti-Patterns
Bileşen geliştirirken yapılan performans ve yapı hatalarından kaçının.

#### ✅ Doğru: Bileşenleri Parçala
```tsx
// UserCard.tsx - Küçük, yönetilebilir component
export const UserCard = ({ user }) => (
  <div className="card">
    <Avatar src={user.img} />
    <UserInfo name={user.name} />
  </div>
);
```

#### ❌ Yanlış: Tek Dosyada Dev Bileşen
```tsx
// Dashboard.tsx - Her şey tek dosyada (400 satır)
export const Dashboard = () => {
  // ...tüm auth logic
  // ...tüm fetch işlemleri
  return (
    <div>
       {/* ...header html ...sidebar html ...content html */}
    </div>
  )
}
```

---

## 3. API ve Veri Standartları

### JSON Yanıt Yapısı

#### ✅ Doğru: Standart Wrapper
```json
{
  "success": true,
  "data": { "id": 1, "name": "Ali" },
  "message": "İşlem başarılı"
}
```

#### ❌ Yanlış: Düzensiz Veri
```json
// Wrapper yok, success flag yok, tutarsız key'ler
{
  "id": 1, 
  "UserName": "Ali", // PascalCase yanlış
  "msg": "ok"        // Kısaltma yanlış
}
```

---

## 4. Git ve Versiyon Kontrol

### Commit Mesajları

| Durum | ✅ Doğru Format | ❌ Yanlış Format |
| :--- | :--- | :--- |
| **Yeni Özellik** | `feat(auth): add login page` | `login page added`, `new feature` |
| **Hata Düzeltme** | `fix(header): repair alignment issue` | `fixed bug`, `css fix` |
| **Refactor** | `refactor(api): optimize user fetch` | `cleanup`, `change code` |
| **WIP** | (Commit atılmamalı veya stash kullanılmalı) | `wip`, `...` |

---

## 5. Test ve QA

### Test İsimlendirmeleri

#### ✅ Doğru: Açıklayıcı
```javascript
it('should return 400 when email is invalid', () => { ... })
```

#### ❌ Yanlış: Belirsiz
```javascript
it('test 1', () => { ... })
it('error check', () => { ... })
```

---

## 6. DevOps ve Altyapı

### Docker

#### ✅ Doğru: Spesifik Tag ve Minimal Image
```dockerfile
FROM node:20-alpine
```

#### ❌ Yanlış: `latest` ve Büyük Image
```dockerfile
FROM node:latest 
# 'latest' production'da kararsızlığa yol açar.
# Ubuntu tabanlı imajlar gereksiz büyüktür.
```
