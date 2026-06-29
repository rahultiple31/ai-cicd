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

## Deploy to a Remote Kubernetes Cluster

This repository includes a GitHub Actions workflow at `.github/workflows/deploy-remote.yml`.
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
