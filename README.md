# Ishaan Goyal's personal website

Source for the canonical portfolio at <https://www.ishaangoyal.com/>.

## Repository boundary

This folder lives inside the broader `resume/` personal-branding workspace, but it remains an independent Git repository:

- GitHub: <https://github.com/GoyalIshaan/personal-website>
- Default branch: `master`
- Vercel link: `.vercel/project.json` (local project metadata only; authentication is managed separately)

Run Git commands from this folder or use `git -C personal-website ...` from the parent workspace. Moving the folder does not change its commit history, branches, remote URL, or upstream configuration as long as `.git/` moves with it.

## Content sources

- `data/resume.tsx` contains the site's broad work, education, skills, and project inventory.
- `data/navigation.tsx` owns navigation, social links, and the published resume path.
- `public/resumes/ishaan-goyal-ai-infrastructure.pdf` is a derived public resume artifact.
- `../RESUME_CONTEXT.md` is the durable cross-project fact bank and conflict registry.

Treat site and resume claims as working claims until supported by the primary evidence recorded in `RESUME_CONTEXT.md`. Do not resolve disagreements by copying whichever wording is newest.

## Development and verification

```sh
npm install
npm run dev
```

Before publishing a content or interface change, run:

```sh
npm run typecheck
npm run lint
npm run build
npm run start -- -p 3210
# In a second shell, while the production server is ready:
npm run qa
```

The QA script expects the freshly built production site at `http://localhost:3210`. Set `SITE_URL` only when intentionally testing another local or deployed target.

No deployment or GitHub push is implied by a local edit. Verify the selected Git branch, worktree, upstream state, and Vercel authentication separately before publishing.
