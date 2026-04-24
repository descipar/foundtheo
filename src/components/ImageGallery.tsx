/** @jsxImportSource hono/jsx */

interface Props {
  heroKey: string | undefined;
  thumbKeys: string[];
  imgAlt: string;
  photoHint: string;
  /** Like-Zähler pro Bild-Key: { [image_key]: count } */
  imageLikes: Record<string, number>;
}

export function ImageGallery({ heroKey, thumbKeys, imgAlt, photoHint, imageLikes }: Props) {
  return (
    <>
      {/* Hero image – mit Like-Wrapper */}
      {heroKey && (
        <div class="img-like-wrapper" data-img-key={heroKey} data-like-count={imageLikes[heroKey] ?? 0}>
          <img
            class="hero"
            src={`/api/images/${encodeURIComponent(heroKey)}`}
            alt={imgAlt}
            onclick="openLightbox(this.src)"
          />
        </div>
      )}

      {/* Thumbnails – jedes in einem Like-Wrapper */}
      {thumbKeys.length > 0 && (
        <div class="thumbs">
          {thumbKeys.map((key) => (
            <div class="img-like-wrapper" data-img-key={key} data-like-count={imageLikes[key] ?? 0}>
              <img
                src={`/api/images/${encodeURIComponent(key)}`}
                alt={imgAlt}
                loading="lazy"
                onclick="openLightbox(this.src)"
              />
            </div>
          ))}
        </div>
      )}

      {/* Photo hint */}
      <p class="photo-hint">{photoHint}</p>

      {/* Lightbox */}
      <div class="lightbox" id="lightbox" onclick="closeLightbox()">
        <span class="lightbox-close" onclick="closeLightbox()">✕</span>
        <img id="lightbox-img" src="" alt={imgAlt} />
      </div>
    </>
  );
}
