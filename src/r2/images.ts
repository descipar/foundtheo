const IMAGE_PREFIX = "dogs/theo/";
const IMAGE_COUNT = 4;

/**
 * Lists all image keys in the R2 bucket under dogs/theo/.
 */
export async function listImageKeys(bucket: R2Bucket): Promise<string[]> {
  const listed = await bucket.list({ prefix: IMAGE_PREFIX });
  return listed.objects
    .map((obj) => obj.key)
    .filter((key) => !key.endsWith("/")); // exclude folder entries
}

/**
 * Picks IMAGE_COUNT random images from the pool using crypto.getRandomValues.
 * Different selection on every page load.
 */
export function pickImages(keys: string[]): string[] {
  if (keys.length <= IMAGE_COUNT) return keys;

  // Fisher-Yates shuffle with crypto random
  const arr = [...keys];
  for (let i = arr.length - 1; i > 0; i--) {
    const rand = new Uint32Array(1);
    crypto.getRandomValues(rand);
    const j = rand[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, IMAGE_COUNT);
}

/**
 * Fetches a single image from R2 and returns it as a Response.
 */
export async function getImage(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  return bucket.get(key);
}
