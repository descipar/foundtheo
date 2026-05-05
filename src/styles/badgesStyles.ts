export const badgesStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f0f4f8;
    color: #111;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem 3rem;
  }

  .page-header {
    max-width: 460px;
    width: 100%;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .page-header h1 {
    font-size: 1.75rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #1A3C6B;
    text-transform: uppercase;
  }
  .page-header p {
    font-size: 0.8rem;
    color: #999;
    margin-top: 0.4rem;
  }

  .badges-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 460px;
    width: 100%;
  }

  .badge-card {
    background: #fff;
    border-radius: 1.25rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);
    overflow: hidden;
    text-decoration: none;
    display: block;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .badge-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08);
  }

  .badge-card__header {
    padding: 1.1rem 1.25rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .badge-card__name {
    font-size: 1.3rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.01em;
  }
  .badge-card__arrow {
    font-size: 1.1rem;
    color: rgba(255,255,255,0.7);
  }

  .badge-card__body {
    padding: 0.9rem 1.25rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .badge-card__label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #aaa;
    font-weight: 600;
  }
  .badge-card__count {
    font-size: 1.8rem;
    font-weight: 800;
    line-height: 1;
  }
  .badge-card__unit {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #bbb;
    font-weight: 600;
    margin-top: 0.15rem;
  }

  .back-link {
    margin-top: 1.5rem;
    font-size: 0.78rem;
    color: #aaa;
    text-decoration: none;
  }
  .back-link:hover { color: #555; }
`;
