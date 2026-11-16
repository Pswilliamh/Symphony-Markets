# Symphony Markets — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Default-Deny Catch-All**: Every path not explicitly matched is unconditionally denied (`allow read, write: if false;`).
2. **Google Verified Identity Gate**: Every read and write requires `request.auth != null && request.auth.token.email_verified == true`. Unverified emails or anonymous sessions are strictly rejected.
3. **Strict Owner Isolation & Zero PII**:
   - No PII (`email`, `phone`, `address`) is stored in Firestore documents.
   - `/users/{userId}` can only be read (`get`), created, or updated when `request.auth.uid == userId` and `incoming().uid == request.auth.uid`.
   - `list` and `delete` operations are denied (`false`) across all collections to eliminate scraping and preserve audit integrity.
4. **Master Gate Relational Sync**:
   - A `/users/{userId}/walletApprovals/{approvalId}` document cannot be read, created, or updated unless its parent `/users/{userId}` document exists, belongs to `request.auth.uid`, and has `walletModeUnlocked == true`. Locking Live Wallet Mode (`walletModeUnlocked == false`) synchronously blocks all sub-resource approvals.
5. **Terminal State & Immortal Fields**:
   - `createdAt`, `uid`, and `ownerUid` are immutable after creation, and `createdAt` / `updatedAt` must equal `request.time`.
   - Once a `WalletSetApproval` reaches terminal `status == 'signed'`, no subsequent updates are permitted.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return `PERMISSION_DENIED`)
1. **Payload 01 — Unverified Email Spoof**: `{ uid: "user_1", walletModeUnlocked: true, lastWalletNetwork: "XRPL", createdAt: SERVER_TIME, updatedAt: SERVER_TIME }` with `auth.token.email_verified = false`.
2. **Payload 02 — Cross-Tenant Identity Spoofing**: Authenticated as `user_attacker` writing `{ uid: "user_victim", ... }` to `/users/user_victim`.
3. **Payload 03 — Shadow Ghost Field Injection (Create)**: Adding `"isAdmin": true` to `/users/user_1` alongside valid fields.
4. **Payload 04 — Shadow Ghost Field Injection (Update)**: Updating `/users/user_1` with `walletModeUnlocked: true` plus `"role": "superuser"`.
5. **Payload 05 — ID Poisoning (2KB Path Variable)**: Creating `/users/user_1/walletApprovals/<2000-char-junk-id$%#>` exceeding `128` chars / regex `^[a-zA-Z0-9_\-]+$`.
6. **Payload 06 — Orphaned Subcollection Write (Missing Master Gate)**: Creating `/users/user_no_session/walletApprovals/set_1` before `/users/user_no_session` exists or while `walletModeUnlocked == false`.
7. **Payload 07 — Client Timestamp Forgery**: Creating `/users/user_1` with backdated `createdAt: "2020-01-01T00:00:00Z"` (`!= request.time`).
8. **Payload 08 — Immortal Field Mutation**: Updating `/users/user_1` while mutating `createdAt` or `uid`.
9. **Payload 09 — Terminal State Bypass**: Updating `/users/user_1/walletApprovals/set_1` after `existing().status == 'signed'` back to `'dispatched'` or changing `buyPrice`.
10. **Payload 10 — Value Poisoning on Whitelisted Update Key**: Updating `lastWalletNetwork` on `/users/user_1` with a 500KB string or disallowed enum `"Solana_Fake"`.
11. **Payload 11 — Out-of-Range Numeric Injection**: Creating `WalletSetApproval` with `setNumber: 99`, `quantity: -50`, or `buyPrice: 0`.
12. **Payload 12 — Unauthorized Collection Scraping (`list`)**: Executing a `list` query against `/users` or `/users/user_1/walletApprovals`.
