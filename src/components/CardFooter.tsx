/** @jsxImportSource hono/jsx */
import type { BadgeTheme } from "../themes";

interface Props {
  theme: BadgeTheme;
}

export function CardFooter({ theme }: Props) {
  return (
    <div class="card-footer">
      <div class="card-footer-logo">
        <img
          id="footer-logo"
          src={theme.logoPath || ""}
          alt={theme.logoAlt}
          style={theme.logoPath ? "" : "display:none"}
          onerror="this.style.display='none'"
        />
      </div>
      <div class="card-footer-paw">🐾</div>
    </div>
  );
}
