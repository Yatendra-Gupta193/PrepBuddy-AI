# PrepBuddy AI frontend

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend origin
   (the default local backend is `http://localhost:5000`).
3. Start the Vite development server with `npm run dev`.

The frontend uses the backend's authenticated authentication, patient,
appointment, preparation, and reminder APIs. Preparation checklists are stored
on their patient record as `preparationSteps` entries with `title` and
`completed` fields. Progress is the completed-step percentage; an empty
checklist has 0% progress and `not_started` status. Do not put backend secrets
or database credentials in Vite environment variables; Vite variables are
exposed to the browser.

The preparation API supports listing account-owned checklists, retrieving or
creating a patient's checklist, toggling a step, and updating preparation
status through the compatibility endpoint. See
`backend/routes/preparationRoutes.js` for the authenticated routes.

Legacy patient records without a checklist are safely initialized on their
first patient/preparation read. Existing `pending` records migrate to unchecked
default steps, `in_progress` records to half-complete defaults, and `completed`
records to fully complete defaults. The migration preserves the existing
status meaning while ensuring future progress is derived from stored steps.

## Checks

- `npm run build` creates the production bundle.
- `npm run lint` runs Oxlint.
