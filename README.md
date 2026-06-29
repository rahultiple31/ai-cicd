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
2. Enterprise governance checks and OpenAI risk assessment.
3. AI code review and security scan.
4. OpenAI security remediation advisor.
5. Build application.
6. Run unit tests and OpenAI test generation.
7. Build Docker image with SBOM and provenance.
8. Push image to GHCR by default, or Docker Hub / AWS ECR when selected manually.
9. OpenAI production readiness report.
10. Deploy to Dev.
11. Deploy to Test / QA.
12. Manual production approval.
13. Deploy to Production.
14. OpenAI log analysis and monitoring.

AI and security integrations:

| Purpose | AI Tool |
| ---------------------------- | ---------------------------------- |
| Code suggestion | GitHub Copilot |
| Code review | ChatGPT / Codex using `OPENAI_API_KEY` |
| Vulnerability fix suggestion | Snyk AI / GitHub Advanced Security |
| Test case generation | Codex / Copilot, plus OpenAI-generated CI test ideas |
| Log analysis | ChatGPT / AWS Q Developer using production logs |
| Pipeline error fixing | ChatGPT / Codex with uploaded guidance artifacts |

Enterprise controls in the workflow:

- Least-privilege GitHub token permissions.
- Serialized pipeline runs per branch with `concurrency`.
- Repository policy checks for required deployment files and accidental secret patterns.
- OpenAI enterprise release risk report.
- OpenAI security remediation report.
- Trivy source scan as a blocking gate.
- Trivy image scan as a reporting gate.
- Docker image SBOM and provenance attestations.
- Helm chart linting before image build.
- Deployment preflight that skips Kubernetes deployment cleanly when `KUBE_CONFIG_B64` is missing.
- Dev, QA, and production rollout checks with smoke-test pod inspection.
- GitHub environment approval before production.

Required repository secret for Kubernetes deployment:

- `KUBE_CONFIG_B64`: base64-encoded kubeconfig for the remote Kubernetes cluster.

Optional repository secrets and variables:

- `OPENAI_API_KEY`: enables AI code review and AI log analysis.
- `OPENAI_MODEL`: repository variable for the OpenAI model, defaults to `gpt-4.1-mini`.
- `SNYK_TOKEN`: enables the Snyk AI vulnerability suggestion stage.
- `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`: required only when manually selecting Docker Hub.
- `AWS_ACCOUNT_ID`, `AWS_REGION`, `AWS_ROLE_TO_ASSUME`: required only when manually selecting AWS ECR.

Create `KUBE_CONFIG_B64` from PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$env:USERPROFILE\.kube\config"))
```

Create GitHub environments named `dev`, `qa`, `production-approval`, and `production`.
Add required reviewers to the `production-approval` environment to enable the manual approval gate.

Useful workflow artifacts:

- `enterprise-governance`: policy output and OpenAI release risk report.
- `ai-code-review`: AI tool map and OpenAI code review report.
- `openai-security-remediation`: OpenAI security hardening recommendations.
- `generated-test-ideas`: OpenAI/Codex-style enterprise test ideas.
- `enterprise-release-readiness`: production readiness and rollback guidance.
- `ai-log-analysis-monitoring`: production logs and OpenAI log analysis after production deploy.

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
