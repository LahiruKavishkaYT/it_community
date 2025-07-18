# Job Application Status & Rejection Feedback Implementation

## Overview

This implementation ensures that:
1. Users who have applied to a job will see their application status instead of the "Apply" button
2. When applications are rejected, applicants can see the rejection reason provided by the recruiter

## Implementation Details

### Backend Changes

#### 1. Jobs Service (`backend/src/modules/jobs/jobs.service.ts`)

- **Enhanced `findAll` method**: Now includes application data for authenticated users
  ```typescript
  // Includes user's application status if they are authenticated
  const includeAuth = isAuthenticated();
  const jobs = await this.jobsService.findAll(filters, userId);
  ```

- **Added `getApplicationDetails` method**: Retrieves complete application information including rejection reason
  ```typescript
  async getApplicationDetails(applicationId: string, userId: string): Promise<JobApplication>
  ```

#### 2. Jobs Controller (`backend/src/modules/jobs/jobs.controller.ts`)

- **Added new endpoint**: `GET /jobs/applications/:applicationId`
  - Fetches detailed application information
  - Includes rejection reason if status is REJECTED
  - Validates user permissions

### Frontend Changes

#### 1. API Service (`frontend/src/services/api.ts`)

- **Enhanced `getJobs` function**: Includes authentication headers to get application status
- **Added `getApplicationDetails` function**: Fetches complete application data

#### 2. Jobs Page (`frontend/src/pages/JobsPage.tsx`)

- **Updated `getApplicationButtonContent` function**: 
  - Shows appropriate button/status based on application state
  - Displays "You Applied (Status)" for users who have applied
  - Different color coding for each application status

- **Enhanced `handleViewApplication` function**:
  - Fetches complete application details when user clicks to view
  - Includes rejection reason in the application data

#### 3. Application View Modal (`frontend/src/components/UI/ApplicationViewModal.tsx`)

- Already supports displaying rejection feedback
- Shows rejection reason in a dedicated section when status is REJECTED

### Database Schema

The existing schema already supports all required features:
- `JobApplication` model includes `rejectionReason` field
- Unique constraint on `[jobId, applicantId]` prevents duplicate applications
- `ApplicationStatus` enum includes all necessary statuses

## Usage Flow

1. **Job Listing View**:
   - Authenticated users see their application status instead of "Apply" button
   - Status is color-coded (e.g., yellow for PENDING, red for REJECTED)

2. **Viewing Application Details**:
   - User clicks on their application status
   - System fetches complete application details
   - Modal displays all information including rejection reason if applicable

3. **Rejection Feedback**:
   - When recruiter rejects an application, they can provide a reason
   - This reason is stored in the `rejectionReason` field
   - Applicants see this feedback in a dedicated section of the application view

## Security Considerations

- Users can only view their own applications
- Company users can view applications for their job postings
- Application details endpoint validates permissions before returning data

## TypeScript Type Safety

All endpoints and data structures are properly typed:
- `JobApplication` interface includes all fields
- `ApplicationStatus` enum ensures type safety for status values
- API functions return properly typed responses

## Error Handling

- Graceful fallback if application details cannot be fetched
- Proper error messages for authentication and authorization failures
- Console warnings for debugging without breaking the UI

## Future Enhancements

1. Email notifications when application status changes
2. Bulk status updates for recruiters
3. Application history tracking
4. Analytics on rejection reasons 