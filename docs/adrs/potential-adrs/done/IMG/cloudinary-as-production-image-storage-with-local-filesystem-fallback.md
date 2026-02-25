# Potential ADR: Cloudinary as Production Image Storage with Local Filesystem Fallback

**Module**: IMG
**Category**: Infrastructure / Technology
**Priority**: Must Document (Score: 130)
**Date Identified**: 2026-02-17

---

## What Was Identified

The codebase implements a dual-mode image storage system where all image uploads are routed through a single `ImageStorageService` class in `backend/app/services/image_storage.py`. The service dispatches to one of two backends depending on the `UPLOAD_STORAGE` environment variable: `"cloudinary"` routes to the Cloudinary Python SDK; any other value (defaulting to `"local"`) writes files to the local `uploads/` directory on the server's filesystem.

The Cloudinary path applies two production optimizations at upload time: automatic conversion to WebP format (`format="webp"`) and automatic quality compression (`quality="auto"`). Images are then served via Cloudinary's global CDN using HTTPS URLs (`res.cloudinary.com/...`). The local path writes files under `uploads/{folder}/` with UUID-based filenames and serves them through FastAPI's `StaticFiles` mount registered at `/uploads` in `main.py`.

This pattern was present from the beginning of the project based on module structure, and the `config.py` default of `UPLOAD_STORAGE: str = "local"` makes clear the local mode is the developer default while Cloudinary is the production target. The singleton `image_storage = ImageStorageService()` at module level is imported directly by two domain routers (USER, SVC), making this service a shared cross-cutting dependency.

## Why This Might Deserve an ADR

- **Impact**: Every image upload in the system — both profile pictures (`routers/users.py`) and service images (`routers/services.py`) — passes through this service. Cloudinary is a paid third-party SaaS; migrating away would require re-uploading all stored assets, updating all `image_url` fields in the database, and changing serving infrastructure.
- **Trade-offs**: The current design creates a dev/prod URL format discrepancy: local images return relative URLs (`/uploads/profiles/uuid.jpg`) while Cloudinary returns absolute HTTPS CDN URLs (`https://res.cloudinary.com/...`). This is acceptable because the frontend always renders the URL as-is, but it means local behavior does not fully replicate production behavior. A developer who runs locally cannot test CDN behavior, WebP conversion, or Cloudinary transformations.
- **Complexity**: The `_delete_cloudinary()` method parses the `public_id` from the Cloudinary URL by splitting on `/` and stripping the extension. This is brittle: if Cloudinary's URL structure changes or a versioned URL (`/v123456/`) is used, the public_id extraction will silently fail. This is a known fragility baked into the current architecture.
- **Team Knowledge**: Any developer adding a new image upload feature (e.g., portfolio photos, certificates, cover images) must understand: (a) to call `image_storage.upload(file, folder="new_folder")`, (b) that the `folder` parameter maps to a Cloudinary folder and a local directory, (c) that the returned URL format differs by environment.
- **Future Implications**: If the platform scales, Cloudinary's free tier limits (25 credits/month, 25GB storage, 25GB bandwidth) may be exceeded. Moving to S3, GCS, or another provider would require significant refactoring of the entire IMG module and all callers. The current abstraction partially addresses this, but the delete logic and URL structure are Cloudinary-specific.
- **Temporal Context**: The pattern appears stable with no evidence of churn or migration attempts.

## Evidence Found in Codebase

### Key Files
- [`backend/app/services/image_storage.py`](/home/hermano/projetos/faz_de_tudo/backend/app/services/image_storage.py) - Lines 14-169: Full service implementation
- [`backend/app/config.py`](/home/hermano/projetos/faz_de_tudo/backend/app/config.py) - Lines 52-58: Storage configuration defaults
- [`backend/app/main.py`](/home/hermano/projetos/faz_de_tudo/backend/app/main.py) - Lines 119-121: StaticFiles mount for local dev serving
- [`backend/app/routers/users.py`](/home/hermano/projetos/faz_de_tudo/backend/app/routers/users.py) - Lines 65-96: Profile picture upload caller
- [`backend/app/routers/services.py`](/home/hermano/projetos/faz_de_tudo/backend/app/routers/services.py) - Lines 52-92: Service image upload caller

### Code Evidence

```python
# backend/app/services/image_storage.py:51-54
# Delegar para o storage apropriado
if self.storage_type == "cloudinary":
    return await self._upload_cloudinary(file, folder, contents)
else:
    return await self._upload_local(file, folder, file_ext)
```

```python
# backend/app/services/image_storage.py:91-98 — Cloudinary upload with WebP optimization
result = cloudinary.uploader.upload(
    contents,
    public_id=public_id,
    folder=folder,
    resource_type="image",
    format="webp",  # Converter para WebP (otimizado)
    quality="auto",  # Qualidade automática
    fetch_format="auto"
)
```

```python
# backend/app/services/image_storage.py:155-162 — Brittle public_id extraction
# URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/filename.ext
parts = url.split("/")
if "cloudinary.com" in url and len(parts) >= 2:
    public_id = "/".join(parts[-2:]).split(".")[0]
    result = cloudinary.uploader.destroy(public_id)
    return result.get("result") == "ok"
```

```python
# backend/app/config.py:52-58 — Storage configuration
UPLOAD_STORAGE: str = "local"  # "local" ou "cloudinary"
CLOUDINARY_CLOUD_NAME: str = ""
CLOUDINARY_API_KEY: str = ""
CLOUDINARY_API_SECRET: str = ""
MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".webp"}
```

```python
# backend/app/main.py:119-121 — Local dev image serving
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

### Impact Analysis
- Introduced: Early in project lifecycle (core service, present from initial structure)
- Modified: Stable — single file, consistent implementation
- Last change: Not determinable without git access
- Affects: 2 routers (USER, SVC), 1 service (IMG), 1 entry point (CORE static mount)
- External dependency: Cloudinary Python SDK 1.41.0 (`cloudinary` package in requirements)
- Note: Git history was not available during analysis — temporal enrichment skipped

### Alternatives (if observable)
The code comments explicitly note the dual-mode design as intentional: `"local" ou "cloudinary"` comment in `config.py`. No alternatives to Cloudinary are mentioned in comments or configuration, suggesting Cloudinary was chosen directly (no recorded evaluation of S3, GCS, or Bunny CDN).

## Questions to Address in ADR (if created)

- Why was Cloudinary chosen over AWS S3 + CloudFront, Google Cloud Storage, or a self-hosted object store?
- Was cost, simplicity of SDK, or built-in CDN/transformation the primary driver?
- Was ephemeral filesystem on Railway (no persistent volumes) the forcing function for needing a cloud storage service?
- What is the plan if Cloudinary's free tier limits are exceeded?
- Is the brittle `public_id` extraction in `_delete_cloudinary()` a known risk, and is there a remediation plan?
- Should a third storage mode (e.g., S3) be added to the strategy, and if so, what triggers that?
- Is the dev/prod URL format discrepancy (relative vs absolute) considered acceptable long-term?

## Related Potential ADRs
- CORE module — StaticFiles mount decision (local image serving in development) is a direct consequence of this decision
- NOTIF module — similar dual-mode adapter pattern (email: SMTP vs Resend) was likely inspired by the same architectural approach used here

## Additional Notes

The `_delete_cloudinary()` method contains a known fragile URL-parsing approach. The comment within the code acknowledges the URL format (`# URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/filename.ext`) but the parsing ignores the version segment (`v123456`) and assumes the last two path segments are `folder/filename`. If Cloudinary includes a version in the URL, the extracted `public_id` will be incorrect and delete calls will silently return `False`. This implementation detail is worth explicitly capturing in an ADR so future developers understand the constraint.

The `cloudinary` package is imported lazily (inside the method body) rather than at module level. This means a missing Cloudinary installation raises an `HTTPException(500)` at runtime rather than an `ImportError` at startup. The ADR could address whether this lazy-import pattern is the intended behavior or an oversight.
