import { User, BookOpen, Briefcase, Folder, BookMarked } from "lucide-react";

const NAV_ITEMS = [
  { href: "#about", label: "About", icon: User },
  { href: "#education", label: "Education", icon: BookOpen },
  { href: "#experience", label: "Experience", icon: Briefcase },
  { href: "#projects", label: "Projects", icon: Folder },
  { href: "#coursework", label: "Coursework", icon: BookMarked },
];

export function Nav() {
  return (
    <nav className="nav" aria-label="Primary">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <a key={href} href={href} title={label} className="nav-link">
          <Icon className="nav-icon" size={20} />
          <span className="nav-label">{label}</span>
        </a>
      ))}
    </nav>
  );
}
