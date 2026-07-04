# Release Playbook & Production Operations

This document defines the release strategy, backup, recovery, and deployment procedures for the Frontend Interview Preparation Guide.

---

## 1. Branching & Release Strategy

We follow a structured branching strategy to maintain stability in development and production:

- **`main`**: Reflects production-ready code. No direct commits allowed. All changes must be merged via Pull Requests.
- **`develop`**: The integration branch for new features and bug fixes.
- **`feature/*`**: Individual features branched from `develop` and merged back via PR.
- **`bugfix/*` / `hotfix/*`**: Critical bug fixes branched from `develop` or `main`.

### Release Workflow
1. Create a release branch `release/vX.Y.Z` from `develop`.
2. Verify local builds and run linting/testing:
   ```bash
   npm run lint
   npx tsc --noEmit
   npm run test
   ```
3. Deploy the release branch to **Staging** (simulated or staging env) and perform QA smoke tests.
4. Merge `release/vX.Y.Z` into `main` and `develop` after successful validation.
5. Create a Git tag on the merge commit on `main`:
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z description"
   git push origin vX.Y.Z
   ```

---

## 2. Backup & Restore Strategy

### Database Backups (MongoDB Atlas)
- **Automatic Backups**: Continuous cloud backup is configured on MongoDB Atlas (daily snapshots, weekly retention).
- **Manual Backups**: For pre-release safeguards:
  ```bash
  mongodump --uri="mongodb+srv://<user>:<password>@fig.sxxv731.mongodb.net/interview_guide" --out=./backups/backup-$(date +%F)
  ```
- **Restoration**: To restore a snapshot:
  ```bash
  mongorestore --uri="mongodb+srv://<user>:<password>@fig.sxxv731.mongodb.net/interview_guide" --dir=./backups/backup-<timestamp>/interview_guide
  ```

---

## 3. Disaster Recovery & Rollback Plan

### Rolllback Procedure (Vercel)
If a production release introduces critical runtime errors or data regression:
1. Identify the previous stable Git tag (e.g. `v1.0.0-stable`).
2. Roll back the deployment on Vercel:
   - Navigate to **Vercel Dashboard** → **Deployments**.
   - Find the last stable deployment and click **Promote to Production**.
   - Alternatively, trigger a rollback from CLI:
     ```bash
     vercel rollback <deployment-id>
     ```
3. Verify production health status immediately by calling `GET /api/v1/health`.

### Outage Escalation Plan
1. **API / Server Outage**:
   - Check status on Vercel Status.
   - Verify environment variables are correctly populated (no runtime parser failures).
2. **Database Outage**:
   - Check Atlas Status.
   - Inspect connection pool sizes (`maxPoolSize: 10`). Recycle serverless functions if connections are exhausted.
