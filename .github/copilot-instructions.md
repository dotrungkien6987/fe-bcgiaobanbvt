# Hospital Management System - AI Agent Guidelines

## Architecture Overview

This is a **bilingual React + Node.js hospital management system** with two main domains:

- **Daily Medical Reports**: Department-based reporting with patient tracking, statistics, and PowerPoint exports
- **Medical Incident Management**: Incident reporting, analysis workflow, and quality management per MOH Circular 43/2018

### Key Technology Stack

- **Frontend**: React 18 + Redux Toolkit + Material-UI v5 + React Hook Form + Yup validation
- **Backend**: Express.js + MongoDB (Mongoose) + JWT auth + Multer file uploads
- **Architecture**: Feature-based folder structure with Redux slices per domain

## Critical Patterns & Conventions

### 1. Redux State Management Pattern

**Every feature follows the standard slice pattern:**

```javascript
// Standard slice structure
const slice = createSlice({
  name: "featureName",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Feature-specific success reducers
  },
});

// Standard thunk pattern with toast notifications
export const someAction = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/endpoint", data);
    dispatch(slice.actions.someActionSuccess(response.data.data));
    toast.success("Success message");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
```

### 2. Form Component Pattern

**All forms use React Hook Form + Yup + custom form components:**

```javascript
// Standard form pattern
const yupSchema = Yup.object().shape({
  fieldName: Yup.string().required("Vietnamese error message"),
});

function SomeForm({ open, handleClose, item = {} }) {
  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      /* Vietnamese field names */
    },
  });

  const onSubmit = (data) => {
    // Redux dispatch logic
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <FTextField name="fieldName" label="Vietnamese Label" />
        {/* Custom form components: FTextField, FDatePicker, FAutocomplete, etc. */}
      </FormProvider>
    </Dialog>
  );
}
```

### 3. Table + CRUD Button Pattern

**Standard table with Add/Update/Delete buttons:**

```javascript
// TableComponent.js - displays data with action buttons
// AddButton.js - opens form with empty/default data
// UpdateButton.js - opens form with existing data for editing
// Form.js - handles both create and update modes based on item._id

// Action column pattern in tables:
Cell: ({ row }) => (
  <Stack direction="row">
    <UpdateButton item={row.original} />
    <DeleteButton itemId={row.original._id} />
  </Stack>
);
```

### 4. DataFix Pattern (Master Data Management)

**Centralized master data with automatic indexing:**

```javascript
// Backend automatically adds index field to arrays for frontend table operations
// Frontend references: state.nhanvien.VaiTro, state.nhanvien.ChucDanh, etc.
// CRUD operations update the single datafix document
dispatch(updateOrInsertDatafix(datafixUpdate));
```

## Development Workflows

### File Organization

```
src/
├── features/           # Feature-based modules
│   ├── FeatureName/
│   │   ├── featureSlice.js      # Redux logic
│   │   ├── FeatureTable.js      # Data display
│   │   ├── FeatureForm.js       # Create/Edit form
│   │   ├── AddFeatureButton.js  # Opens create form
│   │   └── UpdateFeatureButton.js # Opens edit form
├── components/form/    # Reusable form components (FTextField, etc.)
├── pages/             # Route-level components
└── routes/           # React Router configuration
```

### Backend API Patterns

```javascript
// Standard controller pattern with error handling
controller.action = catchAsync(async (req, res, next) => {
  // Business logic
  return sendResponse(res, 200, true, { data }, null, "Success message");
});

// Routes follow REST conventions: GET/POST/PUT/DELETE
router.get("/", controller.getAll);
router.post("/", controller.create);
```

## Domain-Specific Knowledge

### Patient Data Structure

- **LoaiBN field**: 1=Death, 2=Transfer, 3=Severe, 4=Surgery, 5=Emergency, 6=Intervention, 7=Monitoring
- **Image uploads**: Cloudinary integration with multiple image support per patient
- **Department-based filtering**: Data isolation per medical department (Khoa)

### Medical Incident Workflow

- **Status progression**: Reported → Accepted → Analyzed → Completed
- **Role-based access**: Quality managers can accept/analyze, admins have full access
- **Document exports**: Word document generation for incident reports

### Authentication & Authorization

```javascript
// Role hierarchy: 1=User, 2=Manager, 3=Admin, 4=SuperAdmin
// Department-based data access via KhoaID
// JWT tokens with refresh mechanism
```

### Image Handling

- Cloudinary for image storage with automatic compression
- Multiple image uploads per record with preview functionality
- Custom ImageUploader and ImageListDisplay components

## Key Conventions

1. **Vietnamese UI**: All labels, messages, and form fields use Vietnamese text
2. **Date Handling**: Consistent dayjs usage with Vietnamese formatting
3. **Loading States**: Every async operation shows loading spinners/buttons
4. **Toast Notifications**: Success/error feedback on all CRUD operations
5. **Responsive Design**: Mobile-first MUI breakpoints throughout
6. **Error Boundaries**: Comprehensive error handling with user-friendly messages

## Common Gotchas

- DataFix arrays need `index` field for table operations (backend auto-generates)
- Form defaultValues must match Vietnamese field names from API
- Redux actions require consistent `startLoading/hasError/success` pattern
- File uploads need FormData with specific Multer field names
- Date fields require dayjs parsing for compatibility

When working with this codebase, always follow the established patterns for Redux, forms, and component structure. The bilingual nature and medical domain require careful attention to field names and business logic.
