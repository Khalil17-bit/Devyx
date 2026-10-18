import * as React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function WhatsAppIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export function TelegramIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.693c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
    </svg>
  );
}

export function MessengerIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.745 6.616 4.47 8.653V24l4.088-2.242c1.077.298 2.222.464 3.442.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.056-3.26-5.963 3.26 6.556-6.963 3.13 3.26 5.889-3.26-6.556 6.963z" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function TikTokIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .586.044.86.126V9.41a6.33 6.33 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 8.78 5.86 6.33 6.33 0 0 0 3.9-5.86V8.75a8.16 8.16 0 0 0 4.77 1.52V6.81a4.85 4.85 0 0 1-1-.12z" />
    </svg>
  );
}

export function YouTubeIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export const socialIconMap: Record<string, React.ComponentType<IconProps>> = {
  whatsapp: WhatsAppIcon,
  telegram: TelegramIcon,
  messenger: MessengerIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
};

export interface PlatformStyling {
  hoverBorder: string;
  hoverText: string;
  hoverBg: string;
  tag: string;
}

export const platformStyling: Record<string, PlatformStyling> = {
  whatsapp: {
    hoverBorder: "hover:border-[#25D366]/50",
    hoverText: "group-hover:text-[#25D366]",
    hoverBg: "group-hover:bg-[#25D366]/10",
    tag: "SYS_WA",
  },
  telegram: {
    hoverBorder: "hover:border-[#229ED9]/50",
    hoverText: "group-hover:text-[#229ED9]",
    hoverBg: "group-hover:bg-[#229ED9]/10",
    tag: "SYS_TG",
  },
  messenger: {
    hoverBorder: "hover:border-[#0084FF]/50",
    hoverText: "group-hover:text-[#0084FF]",
    hoverBg: "group-hover:bg-[#0084FF]/10",
    tag: "SYS_MSG",
  },
  instagram: {
    hoverBorder: "hover:border-[#E4405F]/50",
    hoverText: "group-hover:text-[#E4405F]",
    hoverBg: "group-hover:bg-[#E4405F]/10",
    tag: "SYS_IG",
  },
  tiktok: {
    hoverBorder: "hover:border-[#00f2fe]/50",
    hoverText: "group-hover:text-[#fe2c55]",
    hoverBg: "group-hover:bg-[#fe2c55]/10",
    tag: "SYS_TT",
  },
  youtube: {
    hoverBorder: "hover:border-[#FF0000]/50",
    hoverText: "group-hover:text-[#FF0000]",
    hoverBg: "group-hover:bg-[#FF0000]/10",
    tag: "SYS_YT",
  },
};

export function getSocialIcon(platform: string): React.ComponentType<IconProps> {
  const key = platform.toLowerCase().trim();
  return socialIconMap[key] || WhatsAppIcon;
}

export function getPlatformStyling(platform: string): PlatformStyling {
  const key = platform.toLowerCase().trim();
  return (
    platformStyling[key] || {
      hoverBorder: "hover:border-accent-primary/50",
      hoverText: "group-hover:text-accent-primary",
      hoverBg: "group-hover:bg-accent-primary/10",
      tag: "SYS_CH",
    }
  );
}
