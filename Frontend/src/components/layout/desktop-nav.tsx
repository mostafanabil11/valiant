"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Category } from "@/types/category";

interface DesktopNavProps {
  categories: Category[];
}

export function DesktopNav({ categories }: DesktopNavProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const pathname = usePathname();

  const staticLinks = [
    { name: "Contact Us", slug: "contact", isStatic: true },
  ];

  const getLinkClasses = (isActive: boolean, isHovered: boolean = false, isRed: boolean = false) => {
    const textColor = isHovered 
      ? (isRed ? "text-[#8f1e18]" : "text-foreground")
      : (isRed ? "text-[#B3261E]" : "text-muted-foreground");
      
    const hoverColor = isRed ? "hover:text-[#8f1e18]" : "hover:text-foreground";
    
    return `relative block py-[11px] text-[18px] font-semibold tracking-[0.1em] uppercase transition-colors duration-200 ${textColor} ${hoverColor} after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[3px] after:bg-current after:transition-transform after:duration-300 after:origin-center after:will-change-transform ${
      isActive || isHovered ? "after:scale-x-100" : "after:scale-x-0"
    }`;
  };

  return (
    <div className="hidden w-full border-t border-b border-border md:block" onMouseLeave={() => setHoveredCategory(null)}>
      <nav className="relative mx-auto flex w-full max-w-(--spacing-container-max) items-center justify-center gap-[64px] px-margin-desktop">
        
        <div onMouseEnter={() => setHoveredCategory(null)}>
          <Link href="/" className={getLinkClasses(pathname === "/")}>
            Home
          </Link>
        </div>

        {categories.map((category) => {
          const hasChildren = category.children && category.children.length > 0;
          const isHovered = hoveredCategory === category._id;
          const isActive = pathname === `/${category.slug}` || pathname.startsWith(`/${category.slug}/`);

          return (
            <div
              key={category._id}
              className="relative group"
              onMouseEnter={() => setHoveredCategory(category._id)}
            >
              <Link href={`/${category.slug}`} className={getLinkClasses(isActive, isHovered)}>
                {category.name}
              </Link>

              {/* Simple Dropdown Menu */}
              {hasChildren && isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+1px)] z-50 min-w-[220px] bg-background border border-t-0 border-border shadow-md animate-in fade-in slide-in-from-top-1 duration-200">
                  <ul className="flex flex-col py-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    {category.children!.map((child) => (
                      <li key={child._id}>
                        <Link
                          href={`/${category.slug}/${child.slug}`}
                          className="block px-6 py-2.5 text-[14px] font-medium tracking-[0.05em] text-muted-foreground uppercase transition-colors hover:text-foreground hover:bg-muted/30"
                          onClick={() => setHoveredCategory(null)}
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

        <div onMouseEnter={() => setHoveredCategory(null)}>
          <Link href="/sale" className={getLinkClasses(pathname === "/sale", false, true)}>
            20% off selected items
          </Link>
        </div>

        {staticLinks.map((link) => {
          const isActive = pathname === `/${link.slug}`;
          return (
            <div key={link.slug} onMouseEnter={() => setHoveredCategory(null)}>
              <Link href={`/${link.slug}`} className={getLinkClasses(isActive)}>
                {link.name}
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
