import React from "react";

export type IconName =
  | "user"
  | "users"
  | "message"
  | "lightbulb"
  | "award"
  | "book"
  | "map-pin"
  | "handshake"
  | "globe"
  | "heart"
  | "phone"
  | "mail";

interface IconProps {
  name: IconName;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, size = 24 }) => {
  const sharedProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  const shapes: Record<IconName, React.ReactNode> = {
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    message: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
      </>
    ),
    lightbulb: (
      <>
        <path d="M9 18h6m-5 4h4m-2-20a7 7 0 0 0-4 12.75c.6.4 1 1 1 1.75h6c0-.75.4-1.35 1-1.75A7 7 0 0 0 12 2z" />
      </>
    ),
    award: (
      <>
        <circle cx="12" cy="8" r="6" />
        <path d="m8.2 13-1.3 9 5.1-3 5.1 3-1.3-9M9.5 8l1.7 1.7L14.5 6.5" />
      </>
    ),
    book: (
      <>
        <path d="M12 7v14m0-14C10.5 5.7 8.4 5 6 5c-1.4 0-2.7.2-4 .7V20c1.3-.5 2.6-.7 4-.7 2.4 0 4.5.7 6 2m0-14c1.5-1.3 3.6-2 6-2 1.4 0 2.7.2 4 .7V20c-1.3-.5-2.6-.7-4-.7-2.4 0-4.5.7-6 2" />
      </>
    ),
    "map-pin": (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    handshake: (
      <>
        <path d="m12 8 2-2a3 3 0 0 1 4 0l3 3-4 4-2-2m-3-3-2-2a3 3 0 0 0-4 0l-4 4 4 4 2-2m4-3 5 5a2 2 0 0 1-3 3l-1-1m-2-1 1 1a2 2 0 0 1-3 3l-4-4m6-4 5 5a2 2 0 0 1-3 3l-1-1" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </>
    ),
    heart: (
      <>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z" />
      </>
    ),
    phone: (
      <>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 8.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2.1z" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...sharedProps}
    >
      {shapes[name]}
    </svg>
  );
};

export default Icon;
