import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number };

export function GoogleIcon({ size = 18, ...props }: Props) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...props}>
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.6 14.6 2.7 12 2.7 6.9 2.7 2.8 6.9 2.8 12S6.9 21.3 12 21.3c6.2 0 9.1-4.3 9.1-6.6 0-.4 0-.8-.1-1.1H12Z"/>
      <path fill="#4285F4" d="M21.1 12.6c0-.4 0-.8-.1-1.1H12v3.9h5.4c-.3 1.3-1.2 2.4-2.5 3.1l3 2.3c1.7-1.6 3.2-4.1 3.2-8.2Z"/>
      <path fill="#FBBC05" d="M6.1 14.3 5.4 16l-2.6 2C4.4 20.1 8 21.3 12 21.3c2.6 0 4.8-.9 6.4-2.4l-3-2.3c-.8.5-2 .9-3.4.9-3.1 0-5.7-2.1-6.6-5Z"/>
      <path fill="#34A853" d="M2.8 6l3.3 2.4c.9-2.9 3.5-4.9 6.5-4.9 1.8 0 3.4.6 4.5 1.7l2.7-2.7C18 1 15.2 0 12 0 8 0 4.4 2.3 2.8 6Z"/>
    </svg>
  );
}

export function InstagramIcon({ size = 18, ...props }: Props) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="ig-gradient" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="45%" stopColor="#DD2A7B" />
          <stop offset="75%" stopColor="#8134AF" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#ig-gradient)" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="1.9" />
      <circle cx="17.2" cy="6.9" r="1.2" fill="#fff" />
    </svg>
  );
}

export function FacebookIcon({ size = 18, ...props }: Props) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#1877F2" />
      <path fill="#fff" d="M13.5 20v-6.3h2.1l.3-2.4h-2.4V9.8c0-.7.2-1.2 1.2-1.2H16V6.4c-.2 0-.9-.1-1.8-.1-1.8 0-3 1.1-3 3.2v1.8H9.2v2.4h2V20h2.3Z" />
    </svg>
  );
}

export function TikTokIcon({ size = 18, ...props }: Props) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#111" />
      <path fill="#25F4EE" d="M14.1 6.2v7.3a2.6 2.6 0 1 1-2-2.6v-2.1a4.7 4.7 0 1 0 4.1 4.7V10c1 .8 2.1 1.2 3.4 1.3V9.1c-1.5-.1-2.9-.8-3.5-2.9h-2Z" />
      <path fill="#FE2C55" d="M13.5 6v7.3a2.6 2.6 0 1 1-2-2.6V9.5a4.7 4.7 0 1 0 4.1 4.7V9.8c1 .8 2.2 1.2 3.5 1.3V8.9c-1.6-.1-3-.8-3.6-2.9h-2Z" opacity=".85" />
      <path fill="#fff" d="M13.8 6.1v7.1a2.3 2.3 0 1 1-1.8-2.2V8.7a4.5 4.5 0 1 0 4 4.5V9.9c1 .8 2.1 1.2 3.3 1.3V9.3c-1.5-.1-2.8-.8-3.4-2.8h-2.1Z" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 18, ...props }: Props) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill="#25D366" />
      <path fill="#fff" d="M17.4 14.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.5.7c-.1.1-.3.2-.5.1-1.5-.7-2.6-1.8-3.3-3.3-.1-.2 0-.4.1-.5l.4-.5c.2-.2.2-.4.1-.6l-.7-1.6c-.1-.2-.3-.4-.5-.4h-.4c-.2 0-.5.1-.6.3-.3.4-.8 1-.8 2.3 0 1.2.9 2.4 1 2.6 1.2 1.7 2.8 3 4.7 3.8 1.9.8 2 .5 2.4.5.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .2-1.1 0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}
