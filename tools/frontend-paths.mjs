// Only course-owned immutable frontend/runtime paths may be retained from a
// published manifest. Keep this in step with modules emitted by build.mjs.
export function valid(path) {
 return /^(app|learning-model|learning-models|source-transfer|course-parts|lab-hub|workspace-store|course|investigations|lesson-presentation|editor|routes|style)\.[a-f0-9]{16}\.(js|css)$/.test(path)
  || /^linux\/releases\/[a-f0-9]{64}\/[A-Za-z0-9_./-]+$/.test(path)&&!path.split('/').includes('..')
  || /^runtime\/images\/[a-f0-9]{64}\/(head|lock|manifest\.json|files\/[a-f0-9]{16})$/.test(path);
}
