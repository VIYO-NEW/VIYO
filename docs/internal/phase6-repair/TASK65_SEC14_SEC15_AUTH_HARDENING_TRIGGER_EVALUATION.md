# Task 65 — T51a SEC-14 and SEC-15 Auth Hardening Trigger Evaluation

**Status recommendation:** Deferred until the first auth/database code trigger.
**Taskmaster ID:** 65.
**Taskmaster title:** T51a: SEC-14 and SEC-15 Auth Hardening.
**Taskmaster description:** Implement auth hardening when the first auth/database code trigger occurs.
**Taskmaster dependency:** Task 64 is complete.

## Trigger decision

Task 65 is a **trigger-bound security task**, not an immediate Phase 6.2 product-code task. Its Taskmaster details bind implementation to the **first auth/database code trigger** and enumerate the required controls as password complexity, bcrypt cost 10+, HaveIBeenPwned k-anonymity check, last-five password reuse prevention, and brute-force lockout controls when the auth surface is built.

The current Phase 6.2 execution path after Task 64 moves toward Task 68 and Task 69 foundations for the Image Studio repair graph. Those tasks are provider-registry, shared-contract, router, UI, Studio shell, generation-mode, export, accessibility, and validation tasks. They do not require the creation or modification of password-authentication, credential-login, bcrypt, HaveIBeenPwned, password-history, or brute-force lockout code. Therefore, implementing Task 65 now would violate the PO instruction that Phase 1–4 security remains trigger-bound and must not be implemented prematurely.

## Binding implementation guardrail

Task 65 remains mandatory when its trigger fires. The first future task that introduces or materially changes any of the following surfaces must stop and execute Task 65 before merge:

| Trigger surface | Required Task 65 controls before merge |
|---|---|
| Password signup, password reset, login, invitation acceptance, or account creation | Password complexity, bcrypt cost 10+, and HaveIBeenPwned k-anonymity password check. |
| Password update or password reset persistence | Last-five password reuse prevention and password-history storage design. |
| Public authentication endpoint exposed to repeated attempts | Brute-force lockout/rate controls with evidence. |
| User-auth database schema changed to support credentials | Schema, migration, service, and tests for SEC-14/SEC-15 must be implemented before the triggering code merges. |

## Boundary

This artifact does not mark the auth-hardening implementation as built. It records that the trigger has **not** fired in the current Image Studio implementation path and that Task 65 must remain visible as a deferred security gate until an auth/database code trigger occurs.

No product code was modified for this evaluation.
