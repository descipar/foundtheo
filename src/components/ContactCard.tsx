/** @jsxImportSource hono/jsx */

interface Props {
  phone: string;
  email: string;
  contactPrompt: string;
  contactSubject: string;
}

export function ContactCard({ phone, email, contactPrompt, contactSubject }: Props) {
  return (
    <div class="contact">
      <p>{contactPrompt}</p>
      <div class="contact-buttons">
        <a id="contact-phone" class="primary" href={`tel:${phone.replace(/\s/g, "")}`}>📞 {phone}</a>
        <a id="contact-email" class="secondary" href={`mailto:${email}?subject=${contactSubject}`} data-subject={contactSubject}>✉ {email}</a>
      </div>
    </div>
  );
}
