"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      description: "Monitora supermercati e prodotti",
    },
    {
      name: "Volantini Drive",
      href: "/drive",
      icon: HardDrive,
      description: "Gestisci PDF su Google Drive",
    },
  ];

  return (
    <nav className="border-b border-border bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
                  "hover:text-primary hover:bg-accent/50",
                  isActive
                    ? "text-primary bg-accent"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
