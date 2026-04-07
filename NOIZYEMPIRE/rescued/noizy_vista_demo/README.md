# noizy_vista_demo

## GitHub Push Automation

To automate branch creation, commit, and push to GitHub, use the provided script:

```zsh
./github_push.sh "Your commit message" [branch_name]
```
- If no branch name is provided, defaults to `main`.
- If no commit message is provided, defaults to `Update project`.

## GitHub Actions

A basic workflow is included in `.github/workflows/push_demo.yml` to run on pushes to `main` or `cockpit` branches.

## First-Time Setup
1. Make sure you have initialized a git repository:
   ```zsh
   git init
   git remote add origin <your-repo-url>
   ```
2. Make the push script executable:
   ```zsh
   chmod +x github_push.sh
   ```
3. Use the script to push changes:
   ```zsh
   ./github_push.sh "Initial commit"
   ```

---

For cockpit UI automation, just ask for `cockpit_launcher.js` and I'll generate it next!
