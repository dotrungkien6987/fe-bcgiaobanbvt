# Phase 3 & 4: Integration & Route Switch

## Phase 3: Responsive Integration

### Component Structure

```jsx
// CongViecDetailPage.js (Final)
import CongViecDetailDesktop from "./CongViecDetailDesktop";
import CongViecDetailMobile from "./CongViecDetailMobile";

export default function CongViecDetailPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return isMobile ? <CongViecDetailMobile /> : <CongViecDetailDesktop />;
}
```

### Shared Logic Hook

```jsx
// hooks/useCongViecDetail.js
export function useCongViecDetail() {
  const { id: congViecId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // All Redux selectors
  const { congViecDetail, loading, error } = useSelector(state => state.congViec);
  // ... other selectors

  // All handlers
  const handleBack = () => navigate(-1);
  const handleAddComment = async () => { ... };
  // ... other handlers

  return {
    congViecId,
    congViecDetail,
    loading,
    error,
    handleBack,
    handleAddComment,
    // ... all shared logic
  };
}
```

---

## Phase 4: Route Switch

### Before

```jsx
// routes/index.js
{
  path: "congviec/:id",
  element: <CongViecDetailPage />, // Uses Dialog
},
{
  path: "congviec-new/:id",
  element: <CongViecDetailPageNew />, // Test route
}
```

### After

```jsx
// routes/index.js
{
  path: "congviec/:id",
  element: <CongViecDetailPage />, // New Page component
}
// Remove test route
```

---

## ✅ Final Checklist

### Pre-Switch

- [ ] Desktop view tested thoroughly
- [ ] Mobile view tested thoroughly
- [ ] Responsive switching works
- [ ] All CRUD operations work
- [ ] No console errors
- [ ] Performance acceptable

### Post-Switch

- [ ] Old Dialog route removed
- [ ] Test route removed
- [ ] CongViecDetailDialog.js kept (for reference)
- [ ] Documentation updated

### Rollback Plan

If issues found:

1. Revert route to old CongViecDetailPage
2. Keep new files for debugging
3. Fix issues
4. Re-deploy

---

## 📁 Final File Structure

```
CongViec/
├── CongViecDetailPage.js       # Entry point (responsive switch)
├── CongViecDetailDesktop.js    # Desktop layout
├── CongViecDetailMobile.js     # Mobile layout
├── CongViecDetailDialog.js     # DEPRECATED (keep for reference)
├── hooks/
│   └── useCongViecDetail.js    # Shared logic
└── components/
    └── (unchanged)
```

---

## ⏱️ Total Estimated Time

| Phase                | Time           |
| -------------------- | -------------- |
| Phase 1: Desktop     | 1.5 hours      |
| Phase 2: Mobile      | 3.5 hours      |
| Phase 3: Integration | 1 hour         |
| Phase 4: Switch      | 30 min         |
| **Total**            | **~6.5 hours** |

---

## 🎯 Recommended Order

1. **Phase 1 first** → Test desktop thoroughly
2. **Phase 4 early** → Switch route khi desktop OK
3. **Phase 2 sau** → Mobile có thể làm sau khi desktop live
4. **Phase 3 cuối** → Integrate khi mobile OK

Lý do: Desktop là priority cao hơn, có thể deploy trước.
