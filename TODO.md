# TODO

- [x] Inspect reset password flow: request/verify/set routes + set-password front behavior
- [x] Fix set-password UI: when `reset_session_id` is present, do not require Supabase access_token/refresh_token session
- [ ] (next) Run local dev / build to ensure no TS/ESLint errors
- [ ] (next) Manually test email link flow end-to-end:
  - Request reset
  - Verify via OTP
  - Click link
  - Set new password
- [ ] (next) If needed, add better UX for expired `reset_session_id` (server returns 400 -> toast)

