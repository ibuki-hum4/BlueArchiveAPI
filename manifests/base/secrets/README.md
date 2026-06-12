# Secrets setup (SealedSecrets)

This directory only contains an example Secret manifest (`secret_sample.yaml`).
It is **not** referenced by `kustomization.yaml` and must not be applied
directly. Generate a `*.sealedsecret.yaml` file with `kubeseal` and add it to
`manifests/base/kustomization.yaml` `resources`.

One combined Secret `bluearchive-secrets` (Opaque) is required:

- `DATABASE_URL` - consumed by the `bluearchive-go-api` Deployment and the
  `bluearchive-export-students` CronJob.
- `ssh-privatekey` - mounted by the `bluearchive-export-students` CronJob and
  used to push the weekly `data/students.json` backup.

## 1. Generate a dedicated SSH deploy key

```sh
ssh-keygen -t ed25519 -f deploy_key -N ""
```

Register the **public** key (`deploy_key.pub`) as a Deploy Key with
**write access** on the
[BlueArchiveAPI repository](https://github.com/ibuki-hum4/BlueArchiveAPI)
(Settings → Deploy keys → Add deploy key → check "Allow write access").

## 2. Create and seal the combined Secret

```sh
kubectl create secret generic bluearchive-secrets \
  --namespace ibuki-bluearchive-api \
  --from-literal=DATABASE_URL='postgres://ba:ba@bluearchive-postgres/bluearchive?sslmode=disable' \
  --from-file=ssh-privatekey=deploy_key \
  --dry-run=client -o yaml \
  | kubeseal --format yaml \
  > manifests/base/secrets/bluearchive-secrets.sealedsecret.yaml
```

Delete the local `deploy_key` / `deploy_key.pub` files once sealed.

`secret_sample.yaml` shows the plain `Secret` shape this produces (the
sealed-secrets controller creates a `Secret` with the same
name/namespace/type/keys once the SealedSecret is applied).

## 3. Wire the generated SealedSecret into kustomize

```yaml
resources:
  - ...
  - secrets/bluearchive-secrets.sealedsecret.yaml
```
