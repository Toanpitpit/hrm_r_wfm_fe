# 🔗 Shared — Thành phần dùng chung cho TẤT CẢ modules

## Mục đích
Thư mục `shared/` chứa các thành phần **dùng chung** mà **nhiều module** cùng sử dụng.  
Đây là nơi duy nhất được phép import từ bất kỳ module nào.

## Cấu trúc

```
shared/
├── README.md
├── components/         ← UI components dùng chung (Button, Modal, Table,...)
│   ├── Button/
│   │   ├── index.jsx
│   │   └── Button.module.css
│   ├── Modal/
│   ├── Table/
│   ├── Loading/
│   ├── ErrorBoundary/
│   └── Layout/
│       ├── Header/
│       ├── Sidebar/
│       └── Footer/
├── hooks/              ← Custom hooks dùng chung (useDebounce, useToggle,...)
│   ├── useDebounce.js
│   ├── useToggle.js
│   └── useLocalStorage.js
├── constants/          ← Hằng số dùng chung (API endpoints, messages,...)
│   ├── api.constants.js
│   └── message.constants.js
├── context/            ← Context dùng chung (Theme, Notification,...)
│   └── ThemeContext.jsx
└── utils/              ← Helper functions (format date, validate,...)
    ├── format.utils.js
    └── validate.utils.js
```

## Quy tắc quan trọng

### 1. Khi nào đặt vào shared/?
- Khi **2+ modules** cùng sử dụng component/hook/constant đó.
- Khi đó là **thành phần UI cơ bản** (Button, Input, Modal,...).
- Khi đó là **utility function** không thuộc nghiệp vụ cụ thể nào.

### 2. Khi nào KHÔNG đặt vào shared/?
- Khi component **chỉ dùng trong 1 module** → đặt trong `modules/[tên]/components/`.
- Khi hook **chỉ phục vụ 1 nghiệp vụ** → đặt trong `modules/[tên]/hooks/`.

### 3. Cách import từ shared

```jsx
// Từ bất kỳ module nào
import Button from '@/shared/components/Button';
import useDebounce from '@/shared/hooks/useDebounce';
import { API_ENDPOINTS } from '@/shared/constants/api.constants';
import { formatDate } from '@/shared/utils/format.utils';
```

### 4. Quy tắc component trong shared
- Phải là **Dumb Component** (nhận props, không gọi API).
- Phải có **CSS Module** riêng.
- Phải có **export default**.
- Phải đủ **generic** để dùng ở nhiều nơi.
