# Career Connect

A lightweight static website with two job-platform experiences:

- `Linkdin`: professional networking feed, profile panel, hiring insights.
- `Nakari`: job-search portal with filters, listings, and career snapshot.

The app is served by Nginx and is deployable to Kubernetes with the Helm chart in `charts/career-connect`.

## Run with Docker

```powershell
docker build -t career-connect:latest .
docker run --rm -p 8080:8080 career-connect:latest
```

Open `http://127.0.0.1:8080`.

## AI CI/CD Pipeline

The main GitHub Actions pipeline is `.github/workflows/ai-cicd.yml`.

Pipeline flow:

1. Developer code push to GitHub.
2. AI code review and security scan.
3. Build application.
4. Run unit tests.
5. Build Docker image.
6. Push image to Docker Hub or AWS ECR.
7. Deploy to Dev.
8. Deploy to Test / QA.
9. Manual production approval.
10. Deploy to Production.
11. AI log analysis and monitoring.

AI and security integrations:

| Purpose | Tool |
| --- | --- |
| Code suggestion | GitHub Copilot |
| Code review | ChatGPT / Codex through `OPENAI_API_KEY` |
| Vulnerability fix suggestion | Trivy, CodeQL, Snyk AI or GitHub Advanced Security |
| Test case generation | Codex / Copilot |
| Log analysis | ChatGPT through `OPENAI_API_KEY` |
| Pipeline error fixing | ChatGPT / Codex |

Required repository secrets:

- `KUBE_CONFIG_B64`: base64-encoded kubeconfig for the remote Kubernetes cluster.
- `DOCKERHUB_USERNAME`: Docker Hub username.
- `DOCKERHUB_TOKEN`: Docker Hub access token.

Optional repository secrets and variables:

- `OPENAI_API_KEY`: enables AI code review and AI log analysis.
- `OPENAI_MODEL`: repository variable for the OpenAI model, defaults to `gpt-4.1-mini`.
- `AWS_ACCOUNT_ID`, `AWS_REGION`, `AWS_ROLE_TO_ASSUME`: required only when pushing to AWS ECR.

Create `KUBE_CONFIG_B64` from PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$env:USERPROFILE\.kube\config"))
```

Create GitHub environments named `dev`, `qa`, `production-approval`, and `production`.
Add required reviewers to the `production-approval` environment to enable the manual approval gate.

## Legacy Remote Deploy Workflow

This repository also includes a manual legacy workflow at `.github/workflows/deploy-remote.yml`.
It builds the Docker image, pushes it to GitHub Container Registry, and deploys the Helm chart to a remote Kubernetes cluster.

Add this required repository secret:

- `KUBE_CONFIG_B64`: base64-encoded kubeconfig for the remote cluster.

For private GHCR images, also add:

- `GHCR_USERNAME`: GitHub username or bot account.
- `GHCR_TOKEN`: a GitHub token with `read:packages`.

Create the secret from PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$env:USERPROFILE\.kube\config"))
```

Then push to `main` or run the `Deploy Career Connect` workflow manually.

The workflow deploys:

- Namespace: `career-connect`
- Release: `career-connect`
- Chart: `charts/career-connect`
- Image: `ghcr.io/<owner>/<repo>:<commit-sha>`

## Manual Helm Deploy

```powershell
docker build -t career-connect:latest .
helm upgrade --install career-connect .\charts\career-connect `
  --set image.repository=career-connect `
  --set image.tag=latest `
  --set image.pullPolicy=IfNotPresent
kubectl port-forward svc/career-connect 8080:80
```

Open `http://127.0.0.1:8080`.

For a remote cluster, push the image to a registry first and set `image.repository` to that registry path.
