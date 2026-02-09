# Code Style Guidelines

## Language Convention

- **Comments and docstrings**: Portuguese
- **Identifiers** (variables, functions, classes, columns): English
- **Commit messages**: Portuguese (see git-workflow.md)

```python
# Verifica se o profissional pode gerenciar agenda
async def check_can_manage_schedule(...):
```

## Python Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Functions, variables | snake_case | `create_access_token`, `subscription_status` |
| Classes | PascalCase | `SubscriptionPlan`, `UserResponse` |
| Constants | UPPER_SNAKE_CASE | `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES` |
| Files | snake_case | `auth_utils.py`, `subscription_jobs.py` |

## Import Order

1. Standard library
2. Third-party packages
3. Local relative imports (using `..`)

```python
# Example from backend/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
import re
import secrets

from ..database import get_db
from ..models import User
from ..schemas import UserLogin, Token, UserResponse
from ..auth_utils import verify_password, create_access_token, get_password_hash
from ..dependencies import get_current_user
from ..config import settings
```

## Async Pattern

All database operations MUST be async:

```python
# Correct
result = await db.execute(select(User).filter(User.email == email))
user = result.scalars().first()

# Wrong - never use sync operations
user = db.query(User).filter_by(email=email).first()
```

## JavaScript Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Component files | PascalCase `.jsx` | `ProfessionalLayout.jsx`, `SEOHead.jsx` |
| Config/utility files | camelCase `.js` | `config.js`, `tourConfig.js` |
| Functions, variables | camelCase | `handleLogout`, `isSidebarOpen` |
| Styled components | PascalCase | `MainContent`, `NavItem` |
| File extension | `.jsx` NOT `.tsx` | JavaScript, NOT TypeScript |

## Component File Structure

```jsx
// 1. React/library imports
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import styled from 'styled-components';

// 2. Local imports
import { API_URL } from '../config';

// 3. Styled components
const Container = styled.div`...`;

// 4. Component function
export default function MyComponent() {
    // hooks -> state -> effects -> handlers -> return JSX
}
```
