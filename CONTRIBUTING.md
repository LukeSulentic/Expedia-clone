# Contributing

Thanks for your interest in this project. It began as a course project for SE 3290 – Software Project Management, but the codebase has a number of open defects and unfinished features, and outside contributions are welcome.

## Getting set up

Follow the installation steps in [README.md](README.md). Two points cause most setup failures:

- Use **Node 22 LTS**, and install with `npm install --legacy-peer-deps`.
- Authentication will not work until you enable the **Phone** provider *and* allow the `+91` region under **Firebase → Authentication → Settings → SMS region policy**. Because errors are silently swallowed in the current code, this failure produces no visible message.

Please confirm the application runs locally before opening a pull request.

## Branching and pull requests

- Do not commit directly to `main`.
- Branch from `main` using a short descriptive name: `fix/admin-route-guard`, `feature/env-config`, `docs/setup-notes`.
- Keep each pull request to a single concern. A PR that fixes one bug is easier to review than one that fixes five.
- Write a description explaining *what* changed and *why*. If it fixes an issue, reference it.
- At least one other contributor should review before merging.

## Commit messages

Write in the imperative mood and explain the reason where it isn't obvious:

```
Add route guard to admin pages

Admin routes were reachable without authentication, exposing
booking and user data to any visitor.
```

Avoid `update`, `fix stuff`, and `changes`.

## Code style

The project uses Create React App's default ESLint configuration. Beyond that:

- Match the conventions of the file you are editing rather than reformatting it.
- Prefer React state over direct DOM manipulation. Much of the existing code uses `document.querySelector` inside components; new code should not.
- Never leave a `.catch` block empty. Surface the error to the user or log it — silent failures in this codebase have already cost significant debugging time.
- Do not commit credentials. `db.json` contains placeholder passwords; keep them placeholders. Firebase configuration belongs in an environment variable rather than hardcoded, and moving it there would be a welcome contribution.

## Good first contributions

These are known issues, documented in the README, that are reasonably self-contained:

- Add authentication guards to the `/admin` routes.
- Replace the hardcoded `http://localhost:8080` (13 occurrences under `src/`) with a single configurable base URL.
- Remove the hardcoded `+91` country code and add a country selector.
- Add error handling to the empty `.catch` blocks in `Login.jsx` and `Register.jsx`.
- Replace `setInterval` with `setTimeout` for the post-login redirect.
- Normalize the inconsistent casing in the `flight` records in `db.json`.
- Add `cars`, `packages`, or `trains` resources to `db.json` so those pages function.

## Reporting bugs

Open an issue including the steps to reproduce, what you expected, what happened, your Node version, and any browser console or network output. For authentication problems, the response body of the failing request is far more useful than the console error, since the UI reports nothing.