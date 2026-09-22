/**
 * Upload abstraction for submission media.
 *
 * A production implementation would:
 *   1. Ask the backend for a pre-signed upload URL
 *      (e.g. POST /api/uploads/sign -> { uploadUrl, publicUrl }, backed by
 *      S3/Cloudinary/GCS -- credentials live server-side only).
 *   2. PUT the picked file directly to `uploadUrl` from the device.
 *   3. Pass the resulting `publicUrl` to POST /competitions/:id/submissions.
 *
 * That requires real object-storage credentials, which cannot be
 * committed to this repository (and aren't required by the assignment,
 * which is scoped to the Competition Details feature's business logic).
 *
 * What IS real here: the file picker, and validating what was picked. What
 * is a labeled STUB: the actual network upload -- it does not silently
 * pretend to succeed against a fake endpoint; it explicitly logs that it's
 * a stub and returns a deterministic placeholder URL so the real
 * downstream flow (backend authorization: must be registered, must be
 * within the submission window) is still exercised end-to-end.
 */

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB, arbitrary demo ceiling

export function validatePickedFile(file) {
  if (!file || !file.uri) {
    throw new Error('No file selected.');
  }
  if (typeof file.size === 'number' && file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File is too large. Please choose a file under 200MB.');
  }
  return true;
}

export async function uploadSubmissionMedia(file) {
  validatePickedFile(file);

  // STUB -- replace with the real pre-signed-URL upload described above.
  console.warn(
    '[uploadSubmissionMedia] STUB: not performing a real network upload. ' +
      'Wire real object storage here before shipping to production.'
  );

  return `https://example.com/submissions/stub-${Date.now()}-${encodeURIComponent(file.name || 'file')}`;
}
