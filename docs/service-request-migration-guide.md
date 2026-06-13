# Service Request Migration Guide

## 📋 Overview

This guide explains how to apply the service request tracking migration to your Supabase database.

## 🚀 Quick Start - Apply Migration via Supabase Dashboard

### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select your project: **grpqkqxssaoptruozwdq**

### Step 2: Open SQL Editor

1. In the left sidebar, click on **SQL Editor**
2. Click **New Query** button

### Step 3: Copy Migration SQL

1. Open the file: `supabase/migrations/20260613000000_service_requests_tracking_serial.sql`
2. Copy the **entire content** (201 lines)

### Step 4: Execute Migration

1. Paste the SQL into the SQL Editor
2. Click **Run** button (or press Ctrl+Enter / Cmd+Enter)
3. Wait for execution to complete
4. You should see: "Success. No rows returned"

### Step 5: Verify Migration

Run this query to verify the migration was successful:

```sql
-- Check if tracking_serial column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'service_requests' 
  AND column_name = 'tracking_serial';

-- Check if the function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'generate_tracking_serial';

-- Check if the view exists
SELECT table_name 
FROM information_schema.views 
WHERE table_name = 'service_request_tracking';
```

Expected results:
- ✅ `tracking_serial` column exists (type: text)
- ✅ `generate_tracking_serial` function exists
- ✅ `service_request_tracking` view exists

## 📝 What the Migration Does

### 1. **Adds New Columns**
- `tracking_serial` - Unique serial (SIZER-XXXXXX)
- `guest_email`, `guest_name`, `guest_phone` - Guest info
- `project_type`, `budget_range` - Project details
- `preferred_contact` - Contact preference
- `converted_to_user_at` - Conversion timestamp
- `ip_address`, `user_agent` - Security tracking

### 2. **Makes client_id Nullable**
Allows guest submissions without authentication

### 3. **Creates Tracking Serial Generator**
Auto-generates unique `SIZER-XXXXXX` format serials

### 4. **Sets Up RLS Policies**
- Authenticated users manage their own requests
- Anyone can create guest requests
- Public read access via tracking serial

### 5. **Creates Guest-to-User Linking**
Function to convert guest requests to authenticated users

### 6. **Creates Public Tracking View**
Limited data view with masked email for public access

## 🧪 Testing the Migration

After applying the migration, test it:

### Test 1: Insert Guest Request

```sql
INSERT INTO service_requests (
  guest_email,
  guest_name,
  title,
  description,
  status
) VALUES (
  'test@example.com',
  'Test User',
  'Test Project',
  'This is a test service request',
  'submitted'
) RETURNING tracking_serial;
```

Expected: Returns a tracking serial like `SIZER-A1B2C3`

### Test 2: Query Public View

```sql
SELECT * FROM service_request_tracking 
WHERE tracking_serial = 'SIZER-XXXXXX';
```

Replace `SIZER-XXXXXX` with the serial from Test 1.

Expected: Returns request data with masked email

### Test 3: Link to User

```sql
SELECT link_guest_request_to_user(
  'SIZER-XXXXXX',
  'user-uuid-here'
);
```

Expected: Returns `true` if emails match

## 🔧 Troubleshooting

### Issue: "relation already exists"

**Solution:** Some parts of the migration may already exist. This is safe to ignore if you see this for:
- `service_request_status` enum
- `service_requests` table

### Issue: "column already exists"

**Solution:** The column was added in a previous migration. Safe to ignore.

### Issue: "permission denied"

**Solution:** Make sure you're logged in with an account that has database access. Contact your Supabase project owner if needed.

### Issue: Migration runs but tracking_serial is NULL

**Solution:** The trigger may not have fired. Manually update:

```sql
UPDATE service_requests 
SET tracking_serial = generate_tracking_serial() 
WHERE tracking_serial IS NULL;
```

## 📚 Related Files

- **Migration SQL**: `supabase/migrations/20260613000000_service_requests_tracking_serial.sql`
- **Server Actions**: `src/app/actions/guest-service-request-actions.ts`
- **Form Component**: `src/components/forms/guest-service-request-form.tsx`
- **Tracking Page**: `src/app/track/[serial]/`
- **Email Templates**: `src/lib/email/service-request-templates.ts`
- **Validation**: `src/lib/validations/service-request.ts`

## 🎯 Next Steps After Migration

1. **Test the form**: Create a test page with `<GuestServiceRequestForm />`
2. **Configure SMTP**: Update `.env.local` with email credentials
3. **Test email flow**: Submit request → receive email → track status
4. **Test tracking page**: Visit `/track/SIZER-XXXXXX`
5. **Test conversion**: Sign up with same email → requests auto-link

## 💡 Tips

- Keep the migration file for reference
- Document any custom modifications
- Test in development before production
- Monitor the first few submissions closely
- Set up error tracking for the tracking page

## 🆘 Need Help?

If you encounter issues:

1. Check the Supabase logs in Dashboard → Logs
2. Verify RLS policies are active
3. Test with service role key (bypasses RLS)
4. Check browser console for client errors
5. Review server action logs

---

**Migration File**: `supabase/migrations/20260613000000_service_requests_tracking_serial.sql`  
**Created**: 2026-06-13  
**Status**: Ready to apply