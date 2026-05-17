import { createElement, type ReactElement, type SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>

export type NavIconKey =
  | "home"
  | "training"
  | "verse-memory"
  | "quests"
  | "leaderboard"
  | "profile"
  | "settings"
  | "upgrade"
  | "crown"
  | "bell"
  | "info"
  | "sun"
  | "chevron-right"
  | "menu"
  | "close"
  | "brand"

export type NavItem = {
  label: string
  href: string
  icon: NavIconKey
  imageSrc?: string
}

function iconBase(props: IconProps, children: ReactElement[] | ReactElement) {
  const { className, ...rest } = props

  return createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.9,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      className,
      ...rest,
    },
    children
  )
}

function HomeIcon(props: IconProps) {
  return iconBase(props, [
    createElement("path", { key: "roof", d: "M3 10.5 12 3l9 7.5" }),
    createElement("path", { key: "body", d: "M5.5 9.5V21h13V9.5" }),
    createElement("path", { key: "door", d: "M10 21v-6h4v6" }),
  ])
}

function TrainingIcon(props: IconProps) {
  return iconBase(props, [
    createElement("path", { key: "left-weight", d: "M2.5 9v6" }),
    createElement("path", { key: "left-inner", d: "M5 7v10" }),
    createElement("path", { key: "bar", d: "M7 12h10" }),
    createElement("path", { key: "right-inner", d: "M19 7v10" }),
    createElement("path", { key: "right-weight", d: "M21.5 9v6" }),
  ])
}

function BookOpenIcon(props: IconProps) {
  return iconBase(props, [
    createElement("path", { key: "left", d: "M4 6.5C4 5.1 5.1 4 6.5 4H11v15H6.5A2.5 2.5 0 0 0 4 21.5z" }),
    createElement("path", { key: "right", d: "M20 6.5C20 5.1 18.9 4 17.5 4H13v15h4.5a2.5 2.5 0 0 1 2.5 2.5z" }),
  ])
}

function SwordsIcon(props: IconProps) {
  return iconBase(props, [
    createElement("path", { key: "blade-a", d: "m7 3 6 6" }),
    createElement("path", { key: "blade-b", d: "m17 3-6 6" }),
    createElement("path", { key: "hilt-a", d: "M5 13 3 15l3 3 2-2" }),
    createElement("path", { key: "hilt-b", d: "m19 13 2 2-3 3-2-2" }),
    createElement("path", { key: "handle-a", d: "m9 11-5 5" }),
    createElement("path", { key: "handle-b", d: "m15 11 5 5" }),
  ])
}

function TrophyIcon(props: IconProps) {
  return iconBase(props, [
    createElement("path", { key: "cup", d: "M8 4h8v3a4 4 0 0 1-8 0z" }),
    createElement("path", { key: "left", d: "M8 5H5a2 2 0 0 0 0 4h1" }),
    createElement("path", { key: "right", d: "M16 5h3a2 2 0 1 1 0 4h-1" }),
    createElement("path", { key: "stem", d: "M12 11v4" }),
    createElement("path", { key: "base", d: "M9 21h6" }),
    createElement("path", { key: "foot", d: "M10 15h4" }),
  ])
}

function UserIcon(props: IconProps) {
  return iconBase(props, [
    createElement("circle", { key: "head", cx: "12", cy: "8", r: "3.25" }),
    createElement("path", { key: "body", d: "M5.5 20a6.5 6.5 0 0 1 13 0" }),
  ])
}

function SettingsIcon(props: IconProps) {
  return iconBase(props, [
    createElement("circle", { key: "core", cx: "12", cy: "12", r: "3" }),
    createElement("path", {
      key: "gear",
      d: "M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.7Z",
    }),
  ])
}

function ShieldIcon(props: IconProps) {
  return iconBase(props, [
    createElement("path", { key: "shape", d: "M12 3 5 6v5c0 4.4 2.8 8.4 7 10 4.2-1.6 7-5.6 7-10V6z" }),
    createElement("path", { key: "mark", d: "m9.5 12 1.8 1.8L15 10.2" }),
  ])
}

function CrownIcon(props: IconProps) {
  return iconBase(props, [
    createElement("path", { key: "base", d: "M5 18h14" }),
    createElement("path", { key: "body", d: "m6.5 18 1.4-8 4.1 3.2L16.1 10l1.4 8" }),
    createElement("path", { key: "tips", d: "M7.9 10 10 6.5 12 9l2-2.5 2.1 3.5" }),
  ])
}

function BellIcon(props: IconProps) {
  return iconBase(props, [
    createElement("path", { key: "body", d: "M6.5 16.5h11a1 1 0 0 0 .8-1.6l-1.3-1.8V10a5 5 0 1 0-10 0v3.1l-1.3 1.8a1 1 0 0 0 .8 1.6Z" }),
    createElement("path", { key: "clapper", d: "M10 19a2 2 0 0 0 4 0" }),
  ])
}

function InfoIcon(props: IconProps) {
  return iconBase(props, [
    createElement("circle", { key: "ring", cx: "12", cy: "12", r: "8.5" }),
    createElement("path", { key: "stem", d: "M12 10.5V16" }),
    createElement("path", { key: "dot", d: "M12 7.8h.01" }),
  ])
}

function SunIcon(props: IconProps) {
  return iconBase(props, [
    createElement("circle", { key: "core", cx: "12", cy: "12", r: "3.4" }),
    createElement("path", { key: "t", d: "M12 3.5v2.2" }),
    createElement("path", { key: "b", d: "M12 18.3v2.2" }),
    createElement("path", { key: "l", d: "M3.5 12h2.2" }),
    createElement("path", { key: "r", d: "M18.3 12h2.2" }),
    createElement("path", { key: "tl", d: "m6.3 6.3 1.6 1.6" }),
    createElement("path", { key: "tr", d: "m16.1 6.3-1.6 1.6" }),
    createElement("path", { key: "bl", d: "m6.3 17.7 1.6-1.6" }),
    createElement("path", { key: "br", d: "m16.1 17.7-1.6-1.6" }),
  ])
}

function ChevronRightIcon(props: IconProps) {
  return iconBase(props, [createElement("path", { key: "arrow", d: "m9 6 6 6-6 6" })])
}

function MenuIcon(props: IconProps) {
  return iconBase(props, [
    createElement("path", { key: "top", d: "M4 7h16" }),
    createElement("path", { key: "mid", d: "M4 12h16" }),
    createElement("path", { key: "bot", d: "M4 17h16" }),
  ])
}

function CloseIcon(props: IconProps) {
  return iconBase(props, [
    createElement("path", { key: "a", d: "m6 6 12 12" }),
    createElement("path", { key: "b", d: "M18 6 6 18" }),
  ])
}

function BrandIcon(props: IconProps) {
  return iconBase(props, [
    createElement("path", { key: "outer", d: "M12 3.5 7.5 6v5c0 3.2 1.9 6 4.5 7.2 2.6-1.2 4.5-4 4.5-7.2V6z" }),
    createElement("path", { key: "inner", d: "M12 7.5v6" }),
    createElement("path", { key: "cross", d: "M9.5 10.5h5" }),
  ])
}

const iconMap: Record<NavIconKey, (props: IconProps) => ReactElement> = {
  home: HomeIcon,
  training: TrainingIcon,
  "verse-memory": BookOpenIcon,
  quests: SwordsIcon,
  leaderboard: TrophyIcon,
  profile: UserIcon,
  settings: SettingsIcon,
  upgrade: ShieldIcon,
  crown: CrownIcon,
  bell: BellIcon,
  info: InfoIcon,
  sun: SunIcon,
  "chevron-right": ChevronRightIcon,
  menu: MenuIcon,
  close: CloseIcon,
  brand: BrandIcon,
}

export const desktopNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "home",
    imageSrc: "/icons/navigation/nav-dashboard-shield-transparent.png",
  },
  {
    label: "Training Arena",
    href: "/training",
    icon: "training",
    imageSrc: "/icons/navigation/nav-training-dumbbell-transparent.png",
  },
  {
    label: "Quests",
    href: "/quests",
    icon: "quests",
    imageSrc: "/icons/navigation/nav-quests-banner-transparent.png",
  },
  {
    label: "Verse Memory",
    href: "/flashcards",
    icon: "verse-memory",
    imageSrc: "/icons/navigation/nav-verse-memory-book-transparent.png",
  },
  { label: "Leaderboard", href: "/leaderboard", icon: "leaderboard" },
  {
    label: "Profile",
    href: "/settings",
    icon: "profile",
    imageSrc: "/icons/navigation/nav-profile-headset-transparent.png",
  },
  { label: "Settings", href: "/settings", icon: "settings" },
]

export const mobileNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "home",
    imageSrc: "/icons/navigation/nav-dashboard-shield-transparent.png",
  },
  {
    label: "Training",
    href: "/training",
    icon: "training",
    imageSrc: "/icons/navigation/nav-training-dumbbell-transparent.png",
  },
  {
    label: "Quests",
    href: "/quests",
    icon: "quests",
    imageSrc: "/icons/navigation/nav-quests-banner-transparent.png",
  },
  {
    label: "Verse Memory",
    href: "/flashcards",
    icon: "verse-memory",
    imageSrc: "/icons/navigation/nav-verse-memory-book-transparent.png",
  },
  {
    label: "Profile",
    href: "/settings",
    icon: "profile",
    imageSrc: "/icons/navigation/nav-profile-headset-transparent.png",
  },
]

export function renderNavIcon(icon: NavIconKey, className?: string) {
  return iconMap[icon]({ className })
}

export function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
