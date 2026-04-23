/** @jsxImportSource hono/jsx */

interface Props {
  name: string;
  title: string;
  badgeNr: string;
}

export function IdHeader({ name, title, badgeNr }: Props) {
  return (
    <div class="id-header">
      <div class="id-name">
        <div class="name">{name}</div>
        <div class="job-title">{title}</div>
      </div>
      <div class="id-badge-nr">#{badgeNr}</div>
    </div>
  );
}
