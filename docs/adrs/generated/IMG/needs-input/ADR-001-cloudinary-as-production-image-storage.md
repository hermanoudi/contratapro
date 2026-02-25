# ADR-001: Cloudinary as Production Image Storage with Local Filesystem Fallback

**Status:** Accepted
**Date:** Unknown

---

## Context and Problem Statement

The platform requires persistent, publicly accessible image storage for professional profile pictures and service listing images. The hosting infrastructure (Railway) uses ephemeral container filesystems, meaning any files written to disk are lost on redeploy or container restart. This forces image persistence to an external service in production.

The system implements a dual-mode storage abstraction: a single shared service dispatches uploads to either a cloud provider (Cloudinary) or the local filesystem depending on an environment variable. In production, Cloudinary handles upload, optimization, and CDN delivery. In local development, images are written to an `uploads/` directory and served through a FastAPI static files mount.

[NEEDS INPUT: Was Railway's ephemeral filesystem the primary forcing function for adopting external image storage, or were CDN delivery and image transformation capabilities also primary requirements from the outset?]

## Decision Drivers

- Railway's container infrastructure does not provide persistent volumes, making local filesystem storage non-viable in production
- Profile pictures and service images must be publicly accessible via stable HTTPS URLs after upload
- Image optimization (format conversion, quality compression) reduces bandwidth costs and improves page load performance
- A single abstraction layer must support both production cloud storage and local developer workflows without code changes
- The solution must integrate with an existing Python/FastAPI backend without significant operational overhead
- [NEEDS INPUT: Was cost of Cloudinary's free tier versus S3 pricing a factor in the selection decision?]

## Considered Options

1. Cloudinary (SaaS image hosting with CDN and transformation pipeline)
2. AWS S3 with CloudFront CDN
3. Local filesystem only (development default, not viable in production)

## Decision Outcome

Chosen option: Cloudinary, because it provides a single SDK that handles upload, automatic WebP conversion, quality optimization, and global CDN delivery without requiring infrastructure configuration. The abstraction layer preserves developer experience through a local filesystem fallback activated by environment variable.

[NEEDS INPUT: Was the built-in transformation pipeline (WebP conversion, quality auto) the primary differentiator over S3 + CloudFront, or was SDK simplicity and time-to-integrate the deciding factor?]

## Pros and Cons of the Options

### Cloudinary

- Good: Single SDK handles upload, transformation, and CDN delivery with no additional infrastructure
- Good: Automatic WebP conversion and quality optimization reduce bandwidth at upload time, not serving time
- Good: Stable HTTPS CDN URLs are immediately usable as stored `image_url` values in the database
- Bad: Free tier limits (storage and bandwidth) create a scaling ceiling that may require paid plan or migration
- Bad: Asset deletion relies on brittle URL parsing to extract the `public_id`; version segments in URLs can cause silent failures
- Bad: Dev/prod URL format discrepancy (relative paths locally vs absolute CDN URLs) means local behavior does not replicate production

### AWS S3 with CloudFront

- Good: No proprietary URL format; deletion uses stable object keys stored separately from serving URLs
- Good: Pricing scales predictably with usage; no free-tier ceiling forcing a provider migration
- Bad: Requires separate infrastructure configuration for bucket policies, CloudFront distribution, and IAM credentials
- Bad: Image transformations require Lambda@Edge or a separate service; not built-in

### Local Filesystem Only

- Good: Zero external dependencies; works without credentials in any environment
- Bad: Not viable on Railway due to ephemeral container filesystems; uploaded files are lost on redeploy
- Bad: No CDN delivery, no image optimization, no geographic distribution

## Consequences

All image upload paths across the platform pass through the shared storage service, making Cloudinary a critical production dependency. Any Cloudinary service degradation, credential rotation, or API change directly impacts image upload availability for both professional profiles and service listings. The abstraction layer isolates callers from the specific provider but does not provide automatic failover.

The asset deletion implementation has a documented fragility: URL parsing to extract the Cloudinary `public_id` assumes a specific URL structure without version segments. If Cloudinary returns versioned URLs, deletion calls will silently fail, leaving orphaned assets in the account. This is a known constraint that future development in the IMG module must account for.

Adding new image upload features (portfolio photos, certificates, cover images) requires awareness of the dual-mode contract: the upload service returns different URL formats per environment, and the `folder` parameter maps to both a Cloudinary folder and a local directory path. This behavior must be communicated to all developers extending the IMG module.

## References

- `backend/app/services/image_storage.py:14`
- `backend/app/config.py:52`
- `backend/app/main.py:119`
- `backend/app/routers/users.py:65`
- `backend/app/routers/services.py:52`
