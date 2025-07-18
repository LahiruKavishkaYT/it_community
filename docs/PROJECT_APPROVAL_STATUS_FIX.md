# Project Approval Status Filter Fix

## Issue Analysis

The error changed from "uuid is expected" to "Project is not pending approval", which means the CUID validation is now working correctly, but there's a status filtering issue.

### Root Cause
The frontend was sending `status: 'PENDING_APPROVAL'` but the backend's `mapProjectStatus` method expects lowercase values. The mapping shows:

```typescript
// Backend mapping in admin.service.ts
const statusMap: Record<string, ProjectStatus> = {
  'published': ProjectStatus.PUBLISHED,
  'draft': ProjectStatus.DRAFT,
  'flagged': ProjectStatus.PENDING_APPROVAL,  // ← This is the key
  'pending': ProjectStatus.PENDING_APPROVAL,  // ← This is the key
  'approved': ProjectStatus.APPROVED,
  'rejected': ProjectStatus.REJECTED,
  'archived': ProjectStatus.ARCHIVED
};
```

The frontend was sending `'PENDING_APPROVAL'` which doesn't match any of these lowercase keys.

## Fixes Applied

### 1. Frontend Status Filter Fix
**File**: `admin-dashboard/src/components/dashboard/overview/ProjectApprovalPanel.tsx`

**Before**:
```typescript
queryFn: () => adminAPI.content.getProjects({ status: 'PENDING_APPROVAL', limit: 10 })
```

**After**:
```typescript
queryFn: () => adminAPI.content.getProjects({ status: 'pending', limit: 10 })
```

### 2. Enhanced Error Messages
**File**: `backend/src/modules/admin/admin.service.ts`

**Before**:
```typescript
throw new BadRequestException('Project is not pending approval');
```

**After**:
```typescript
throw new BadRequestException(`Project is not pending approval. Current status: ${project.status}`);
```

### 3. Frontend Status Validation
**File**: `admin-dashboard/src/components/dashboard/overview/ProjectApprovalPanel.tsx`

Added validation to prevent actions on projects that are not pending approval:

```typescript
const isProjectPendingApproval = (project: Project) => {
  return project.status === 'pending' || project.status === 'flagged';
};

const handleApprove = (project: Project) => {
  if (!isProjectPendingApproval(project)) {
    toast({
      title: 'Cannot Approve',
      description: `Project is not pending approval. Current status: ${project.status}`,
      variant: 'destructive',
    });
    return;
  }
  // ... rest of the function
};
```

### 4. Button State Management
Updated approve/reject buttons to be disabled for projects that are not pending approval:

```typescript
<Button
  onClick={() => handleApprove(project)}
  disabled={approveMutation.isPending || !isProjectPendingApproval(project)}
  title={!isProjectPendingApproval(project) ? `Cannot approve project with status: ${project.status}` : 'Approve project'}
>
  <ThumbsUp className="w-4 h-4 mr-1" />
  Approve
</Button>
```

## Status Mapping Reference

### Backend ProjectStatus Enum
```typescript
enum ProjectStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  REJECTED
  PUBLISHED
  ARCHIVED
}
```

### Frontend Status Values (API Project Interface)
```typescript
status: 'published' | 'draft' | 'flagged' | 'pending' | 'approved' | 'rejected' | 'archived'
```

### Backend Status Mapping
```typescript
'published': ProjectStatus.PUBLISHED
'draft': ProjectStatus.DRAFT
'flagged': ProjectStatus.PENDING_APPROVAL  // ← Maps to PENDING_APPROVAL
'pending': ProjectStatus.PENDING_APPROVAL  // ← Maps to PENDING_APPROVAL
'approved': ProjectStatus.APPROVED
'rejected': ProjectStatus.REJECTED
'archived': ProjectStatus.ARCHIVED
```

## User Experience Improvements

### 1. Clear Error Messages
- Backend now shows current project status in error messages
- Frontend shows specific error messages for invalid actions

### 2. Visual Feedback
- Buttons are disabled for projects that can't be approved/rejected
- Tooltips show why buttons are disabled
- Status badges clearly show project status

### 3. Prevention of Invalid Actions
- Frontend validates project status before allowing actions
- Clear feedback when actions are not allowed

## Testing

### Debug Script
Created `debug-project-status.js` to test:
- All projects endpoint
- Projects with "pending" status filter
- Projects with "PENDING_APPROVAL" status filter (for comparison)

### Expected Behavior
1. Frontend should now correctly fetch projects with `status: 'pending'`
2. Only projects with `PENDING_APPROVAL` status in database should be returned
3. Approve/reject actions should work for these projects
4. Clear error messages for projects in wrong status

## Result

✅ **Fixed**: Status filtering mismatch between frontend and backend
✅ **Improved**: Error messages with current project status
✅ **Enhanced**: Frontend validation to prevent invalid actions
✅ **Added**: Visual feedback for disabled buttons
✅ **Optimized**: User experience with clear status indicators

The project approval workflow should now work correctly with proper status filtering and clear user feedback. 