# Random Charm Generator

가챠 메커닉과 AI 이미지 생성을 결합한 3D 키링 디자인 생성 웹앱입니다.
야바위, 뽑기머신, 룰렛 중 랜덤으로 선택된 가챠를 통해 기본 재료를 획득하고,
포션 조합과 모양/패턴/색상을 선택하면 Stable Diffusion이 3D 키링 제품 이미지를 생성합니다.

## 스크린샷

> 추후 추가 예정

## 주요 기능

- **3종 가챠 시스템** — 야바위(셸 게임), 뽑기머신, 룰렛 중 랜덤 선택
- **포션 드래그 앤 드롭** — 솥에 포션을 드래그하여 조합 (제한 없이 투입 가능)
- **키링 커스터마이징** — 6종 모양, 6종 패턴, 8종 색상 조합
- **AI 이미지 생성** — ComfyUI + Stable Diffusion 2.1 + 3DRedmond LoRA
- **미니게임** — 생성 대기 중 2048, 뱀 게임, 지뢰찾기 플레이 가능
- **합성 효과음** — Web Audio API 기반 (외부 오디오 파일 불필요)
- **모바일 반응형** — 터치 제스처, DnD 센서 분리, 3단계 미디어 쿼리

## 아키텍처

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Frontend   │────▶│   Backend    │────▶│     ComfyUI      │
│  React+Vite  │     │   FastAPI    │     │  SD 2.1 + LoRA   │
│  nginx:8888  │     │ uvicorn:8889 │     │   CUDA:8890      │
└──────────────┘     └──────────────┘     └──────────────────┘
       │  /api/* 프록시       │  WebSocket + HTTP      │
       └──────────────────────┘                         │
              SSE 진행률 스트리밍                        │
              ◀─────────────────────────────────────────┘
```

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | React 18, TypeScript, Vite 6, Framer Motion, Zustand, @dnd-kit |
| Backend | FastAPI, uvicorn, Pydantic v2, httpx, websockets |
| AI/ML | Stable Diffusion 2.1 (FreedomRedmond v1), 3DRedmond LoRA, ComfyUI |
| Infra | Docker Compose, nginx, NVIDIA CUDA 12.1 |

## 사전 요구사항

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) + Docker Compose
- NVIDIA GPU (VRAM 6GB 이상) + [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)
- Windows의 경우 WSL2 필수

### 모델 다운로드 (수동)

ComfyUI에서 사용하는 모델 파일은 용량이 커서 Git에 포함되지 않습니다. 아래 파일을 직접 다운로드하여 지정된 경로에 배치하세요.

| 모델 | 경로 | 다운로드 |
|------|------|----------|
| FreedomRedmond v1 | `comfyui/models/checkpoints/freedomRedmond_v1.safetensors` | [CivitAI](https://civitai.com/models/296677) |
| 3DRedmond LoRA | `comfyui/models/loras/3DRedmond21V-3DRenderStyle-3DRenderAF.safetensors` | [CivitAI](https://civitai.com/models/210387) |

## 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/cau-citcwalker/random-charm-generator.git
cd random-charm-generator
```

### 2. 모델 파일 배치

위 [모델 다운로드](#모델-다운로드-수동) 섹션을 참고하여 `.safetensors` 파일을 배치합니다.

### 3. 환경 변수 설정 (선택)

`.env` 파일에서 포트 및 설정을 변경할 수 있습니다.

```env
FRONTEND_PORT=8888
BACKEND_PORT=8889
COMFYUI_PORT=8890
COMFYUI_CLI_ARGS=--listen 0.0.0.0 --port 8890 --lowvram
```

### 4. 실행

```bash
docker compose up --build
```

### 5. 접속

- 웹앱: http://localhost:8888
- API: http://localhost:8889/api/health
- ComfyUI: http://localhost:8890

## 프로젝트 구조

```
random-charm-generator/
├── frontend/
│   ├── src/
│   │   ├── screens/           # 5개 화면 (Title, Gacha, Potion, Combination, Generation)
│   │   ├── components/        # UI 컴포넌트 + 가챠 메커닉 (ShellGame, GachaMachine, Roulette)
│   │   ├── minigames/         # 미니게임 (2048, Snake, Minesweeper)
│   │   ├── stores/            # Zustand 상태 관리
│   │   ├── utils/             # 오디오, API 클라이언트
│   │   └── types/             # TypeScript 타입 정의
│   ├── nginx.conf             # 리버스 프록시 설정
│   └── Dockerfile
├── backend/
│   ├── app/
│   │   ├── routers/           # API 엔드포인트 (gacha, generate, status, images, choices)
│   │   ├── services/          # 비즈니스 로직 (gacha_logic, comfyui_client)
│   │   ├── models/            # Pydantic 스키마
│   │   └── workflows/         # ComfyUI 워크플로우 JSON
│   ├── main.py
│   └── Dockerfile
├── comfyui/
│   ├── models/
│   │   ├── checkpoints/       # SD 체크포인트 (.gitignore)
│   │   └── loras/             # LoRA 파일 (.gitignore)
│   ├── entrypoint.sh
│   └── Dockerfile
├── docker-compose.yml
└── .env
```

## API 엔드포인트

| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 서비스 상태 + ComfyUI 연결 확인 |
| POST | `/api/gacha/spin` | 가챠 스핀 (가중 랜덤, 레전더리 5%) |
| GET | `/api/choices` | 포션, 모양, 패턴, 색상 메타데이터 |
| POST | `/api/generate` | 키링 이미지 생성 요청 |
| GET | `/api/generation/{id}` | SSE 생성 진행률 스트리밍 |
| GET | `/api/images/{id}` | 생성된 이미지 다운로드 |

## 게임 흐름

```
타이틀 → 가챠 뽑기 → 포션 조합 → 모양/패턴/색상 선택 → AI 이미지 생성
                (3종 랜덤)   (드래그 앤 드롭)   (피커 UI)        (미니게임 대기)
```

## 라이선스

MIT
