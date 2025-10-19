# ShoppingIZ - 통합 가격비교 & 쿠폰 거래 플랫폼

쇼핑Iz는 여러 쇼핑몰의 실시간 가격 비교, 쿠폰 수집 및 P2P 쿠폰 거래를 제공하는 통합 쇼핑 플랫폼입니다.

## 주요 기능

### 1. 실시간 가격 비교
- 쿠팡, 네이버, 11번가, G마켓 등 주요 쇼핑몰 가격 통합 비교
- 최저가 자동 찾기
- 가격 히스토리 추적

### 2. AI 구매 추천 시스템
- **지금 살지 말지 결정하는 AI 추천**
- 과거 가격 데이터 분석
- 구매 시점 추천 (0-100점 스코어)
- 가격 예측 및 트렌드 분석

### 3. P2P 쿠폰 거래소
- 안전한 에스크로 시스템
- 쿠폰 1:1 교환
- 포인트 차액 정산
- 신뢰도 기반 거래

### 4. 포인트 시스템
- 현금 거래 없음 (사업자등록 불필요)
- 활동 기반 포인트 획득
  - 일일 출석: 10P
  - 쿠폰 등록: 50P
  - 거래 완료: 30P
  - 첫 거래: 200P

## 기술 스택

### Backend
- Node.js + Express
- MySQL 8.0
- JWT 인증
- bcrypt 암호화

### Frontend
- React
- Axios
- CSS Modules

### Infrastructure
- AWS EC2 (Ubuntu 22.04)
- Nginx (리버스 프록시)
- PM2 (프로세스 관리)

## 설치 및 실행

### 백엔드

```bash
cd backend
npm install
cp .env.example .env
# .env 파일 수정 (DB 정보, JWT 시크릿 등)
npm start
```

### 데이터베이스 설정

```bash
mysql -u root -p < database/schema.sql
```

### 프론트엔드

```bash
cd frontend
npm install
npm start
```

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인

### 상품
- `GET /api/products/search?q=검색어` - 상품 검색
- `GET /api/products/:id` - 상품 상세

### 가격
- `GET /api/prices/compare/:productId` - 가격 비교
- `GET /api/prices/history/:productId` - 가격 히스토리

### AI 추천
- `GET /api/ai/recommendation/:productId` - AI 구매 추천 분석

### 쿠폰
- `GET /api/coupons` - 쿠폰 목록
- `GET /api/coupons/my/:userId` - 내 쿠폰

### 쿠폰 교환
- `POST /api/exchanges/propose` - 교환 제안
- `PUT /api/exchanges/:id/accept` - 교환 수락

## 배포 (EC2)

### 서버 주소
- **고정 IP**: http://13.125.150.235/

### 배포 스크립트

```bash
# EC2 접속
ssh -i shoppingiz.pem ubuntu@13.125.150.235

# 프로젝트 클론
git clone https://github.com/junhuhan99/ShoppingIZ.git
cd ShoppingIZ

# 백엔드 배포
cd backend
npm install
pm2 start src/app.js --name shoppingiz-api
pm2 save
pm2 startup
```

## 라이센스

MIT License

## 작성자

ShoppingIZ Team
