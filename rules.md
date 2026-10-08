# NEED ELECTRO Development and Business Rules

## 1. General Rule

NEED ELECTRO is a real business platform, not a demonstration
application. Features must use real data flows and proper backend
validation.

Do not replace functional logic with static mock behavior in production.

## 2. Brand Rules

Always use:

**NEED ELECTRO**

**Trusted Electrical and Technological Solutions**

Do not change the company name without explicit instruction.

Current public company information must be kept consistent across the
platform.

## 3. User Rules

Every user has an account and an appropriate role.

Users can only access data permitted by their role.

Customers can only access their own private records.

Technicians can only access jobs and information required for their
work.

Staff permissions must be limited to their assigned responsibilities.

## 4. Technician Rules

A technician cannot accept jobs before verification.

A technician must maintain an active account.

Suspended or blocked technicians cannot accept new jobs.

Technicians must provide required professional and identity information.

Sensitive documents must never be publicly displayed.

Technicians may accept only jobs for which they meet platform
eligibility requirements.

## 5. Job Rules

A job can have only one active technician assignment at a time.

Job status changes must follow valid transitions.

Every status change must be logged.

Completed jobs should not be silently edited.

Changes after completion require an authorized adjustment process.

## 6. Customer Privacy

Do not expose unnecessary customer information.

Before job acceptance, show only information necessary for a technician
to evaluate the job.

After assignment, disclose only information needed to complete the
service.

Never expose NID, payment credentials, private documents, or unrelated
customer records.

## 7. Payment Rules

Never store raw card credentials.

Use trusted payment providers.

Every payment requires a unique transaction reference.

Duplicate payment callbacks must be safely handled.

Financial transactions must be idempotent.

Refunds must create proper financial records.

## 8. Wallet Rules

Wallet balances must never be changed through arbitrary client-side
values.

Every wallet change requires a transaction.

Technician earnings become payable only according to configured
completion and payment rules.

Withdrawals must have status and audit history.

## 9. Product Rules

Products require valid categories and inventory configuration.

Stock cannot become negative unless a specific controlled business rule
allows it.

Serial-numbered products must maintain unique serial records.

Warranty records should reference actual products or valid warranty
identifiers.

## 10. Order Rules

Orders must maintain a status history.

Order totals must be calculated server-side.

The client must not be trusted to submit the final payable amount.

Discounts and delivery charges must be validated server-side.

## 11. Warranty Rules

Warranty status is calculated from stored warranty data and applicable
business rules.

A warranty claim must reference a valid product, serial number, invoice,
or warranty record.

Warranty decisions must be auditable.

## 12. Review Rules

Only eligible customers can review a completed service.

Prevent duplicate reviews for the same booking.

Reviews must not reveal private information.

Administrators may moderate reviews according to published platform
rules.

## 13. Admin Rules

Admin actions affecting money, users, permissions, bookings, products,
or technicians must be auditable.

Super Admin access should be protected with strong authentication.

Do not create hidden administrative backdoors.

## 14. Security Rules

Never:

-   Hardcode secrets.
-   Expose environment variables.
-   Trust client-side permissions.
-   Store passwords in plain text.
-   Store sensitive identity documents publicly.
-   Skip server-side validation.
-   Disable authentication for convenience.

## 15. Content Rules

Do not invent:

-   Branches
-   Prices
-   Reviews
-   Customer counts
-   Technician counts
-   Certifications
-   Partnerships
-   Guarantees
-   Product specifications

Use actual data or clearly marked placeholders in development.

## 16. Bangladesh Rules

Use BDT/৳ as the initial currency.

Use Bangladesh phone and address formats.

Payment architecture should support Bangladesh payment methods.

## 17. UX Rules

Important customer actions should be easy to reach:

-   Book Service
-   Emergency Service
-   Shop
-   Track Booking
-   Track Order
-   Warranty
-   Support

Avoid unnecessary forms and steps.

Always provide loading, success, error, and empty states.

## 18. Code Rules

Use TypeScript.

Prefer reusable components.

Keep modules focused.

Use DTO validation.

Use database migrations.

Avoid duplicated business logic.

Avoid giant components.

Keep API contracts documented.

Write tests for critical workflows.

## 19. PWA Rules

The PWA must be installable.

Do not cache sensitive information without a clear security model.

Offline mode should provide useful fallback behavior rather than
pretending that unavailable server operations succeeded.

## 20. ERP Rules

Do not duplicate financial authority unnecessarily.

The website/app must be ERP-compatible.

Use stable IDs and integration references.

Synchronization must be idempotent.

Conflicts must be detectable and reconcilable.

## 21. Safety Rule

Electrical work can be dangerous.

The platform should prioritize qualified technicians and appropriate
safety messaging.

Do not encourage customers to perform dangerous electrical work
themselves.

## 22. Change Rule

Before changing core architecture, database relationships, financial
rules, authentication, or role permissions, review the existing project
documentation and migration impact.

Do not break existing production workflows to implement a convenience
feature.
