export type NavItem = {
  label: string
  href: string
  icon: string
}

export const desktopNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Explore", href: "/explore", icon: "🗺️" },
  { label: "Flashcards", href: "/flashcards", icon: "🧠" },
  { label: "Quests", href: "/quests", icon: "⚔️" },
  { label: "Leaderboard", href: "/leaderboard", icon: "🏆" },
]

export const mobileNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Explore", href: "/explore", icon: "🗺️" },
  { label: "Quests", href: "/quests", icon: "⚔️" },
  { label: "Flashcards", href: "/flashcards", icon: "🧠" },
  { label: "Profile", href: "/settings", icon: "⚙️" },
]

export function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
