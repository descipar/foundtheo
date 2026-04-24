/** @jsxImportSource hono/jsx */

interface Props {
  heroKey: string | undefined;
  thumbKeys: string[];
  imgAlt: string;
  photoHint: string;
}

export function ImageGallery({ heroKey, thumbKeys, imgAlt, photoHint }: Props) {
  return (
    <>
      {/* Hero image */}
      {heroKey && (
        <img
          class="hero"
          src={`/api/images/${encodeURIComponent(heroKey)}`}
          alt={imgAlt}
          onclick="openLightbox(this.src)"
        />
      )}

      {/* Thumbnails */}
      {thumbKeys.length > 0 && (
        <div class="thumbs">
          {thumbKeys.map((key) => (
            <img
              src={`/api/images/${encodeURIComponent(key)}`}
              alt={imgAlt}
              loading="lazy"
              onclick="openLightbox(this.src)"
            />
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
