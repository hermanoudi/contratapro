# Frontend Patterns

## JavaScript, NOT TypeScript

All frontend code uses `.jsx` files. Do NOT create `.tsx` files or add type annotations.

## File Organization

```
frontend/src/
  pages/                 # One component per route
  components/            # Reusable UI (layouts, SEO, ImageUpload)
    ProfessionalLayout.jsx
    ClientLayout.jsx
    SharedLayout.jsx
    SEO/SEOHead.jsx
  contexts/              # React contexts (TourContext)
  config/                # Configuration (tourConfig.js)
  config.js              # API_URL export
  assets/                # Static images
```

## Layout System

Three layouts wrap route content in `App.jsx`:

| Layout | Used By | Routes |
|--------|---------|--------|
| `ProfessionalLayout` | Professional pages | `/dashboard`, `/subscription/manage`, `/profile` |
| `ClientLayout` | Client pages | `/my-appointments` |
| `SharedLayout` | Both roles | `/appointment/:id`, `/history`, `/notifications` |

```jsx
<Route path="/dashboard" element={<ProfessionalLayout><Dashboard /></ProfessionalLayout>} />
```

**Critical**: Pages rendered inside layouts must NOT render their own navigation/sidebar. The layout handles that.

## API Calls

Use inline `fetch()` with `API_URL` from `config.js`. Do NOT use axios or create a services directory:

```jsx
import { API_URL } from '../config';

const res = await fetch(`${API_URL}/services/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
});
if (res.ok) {
    const data = await res.json();
}
```

Auth token from localStorage:

```jsx
const token = localStorage.getItem('token');
```

## styled-components

### CSS Variables (defined globally)

```
--bg-primary, --bg-secondary
--text-primary, --text-secondary
--primary (indigo #6366f1)
--border
--font-sans
```

### Breakpoints

| Size | Breakpoint | Use |
|------|-----------|-----|
| Tablet | 968px | Layout shifts |
| Mobile | 768px | Sidebar collapses, stacked layout |
| Small | 480px | Compact spacing |

### Transient Props

Use `$` prefix for styled-component-only props (not passed to DOM):

```jsx
const NavItem = styled.button`
  background: ${props => props.$active ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};
`;

<NavItem $active={isActive('/dashboard')} />
```

## Libraries

| Library | Purpose | Import |
|---------|---------|--------|
| `sonner` | Toast notifications | `import { toast } from 'sonner'` |
| `lucide-react` | Icons | `import { Calendar, Menu } from 'lucide-react'` |
| `framer-motion` | Animations | `import { motion } from 'framer-motion'` |
| `react-helmet-async` | SEO meta tags | `SEOHead` component in `components/SEO/` |
| `react-joyride` | Guided tours | Wrapped in `TourContext` |
| `react-calendar` | Date picker | `import Calendar from 'react-calendar'` |

## Guided Tours

Tour system uses react-joyride + TourContext:
- Steps defined in `config/tourConfig.js`
- Context provides `startTour`, `startWelcomeTour`, `hasCompletedTour`
- Target elements with `data-tour` attributes: `data-tour="sidebar-nav"`
- Tour completion tracked in localStorage
- Auto-starts on first login, manual restart via "Ver Tour Guiado" button

## SEO

Use `SEOHead` component from `components/SEO/`:

```jsx
import SEOHead from '../components/SEO/SEOHead';

<SEOHead title="Buscar Profissionais" description="..." />
```
