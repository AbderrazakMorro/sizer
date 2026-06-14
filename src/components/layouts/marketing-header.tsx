"use client";

import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { AnchorToHash } from "@/components/smooth-scroll-link";
import { SizerLogo } from "@/components/veta-logo";
import { LanguageToggle } from "@/components/language-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const locale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isFr = locale === "fr";

  const dropdownLinks = [
    { href: "/#apropos", label: isFr ? "À PROPOS" : "ABOUT" },
    { href: "/#services", label: isFr ? "SERVICES" : "SERVICES" },
    { href: "/#contact", label: isFr ? "CONTACT" : "CONTACT" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b border-outline-variant/30 bg-background/80 backdrop-blur-md",
        scrolled ? "py-4 shadow-sm" : "py-6"
      )}
    >
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-screen-2xl mx-auto">
        <Link href="/" className="flex items-center">
          <div className="brightness-0 invert">
            <SizerLogo height={100} />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <AnchorToHash
            href="/#projets"
            className="text-label-sm font-label-sm uppercase tracking-[0.2em] text-white hover:text-primary transition-colors duration-300"
          >
            {isFr ? "PROJETS" : "PROJECTS"}
          </AnchorToHash>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-label-sm font-label-sm uppercase tracking-[0.2em] text-white hover:text-primary transition-colors duration-300 outline-none">
              {isFr ? "PLUS" : "MORE"}
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border-outline-variant/30">
              {dropdownLinks.map((link) => (
                <DropdownMenuItem key={link.label} asChild>
                  <AnchorToHash
                    href={link.href}
                    className="text-label-sm uppercase tracking-[0.1em] cursor-pointer"
                  >
                    {link.label}
                  </AnchorToHash>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="w-[1px] h-4 bg-outline-variant/30 mx-2"></div>
          <Link
            href="/sign-in"
            className="text-label-sm font-label-sm uppercase tracking-[0.2em] text-white hover:text-primary transition-colors duration-300"
          >
            {isFr ? "CONNEXION" : "LOGIN"}
          </Link>
          <Link
            href="/demande-service"
            className="btn-primary px-6 py-2 text-label-sm font-label-sm uppercase tracking-[0.2em]"
          >
            {isFr ? "DEMANDER UN SERVICE" : "REQUEST A SERVICE"}
          </Link>
          <div className="flex items-center ml-4">
            <LanguageToggle />
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-4">
          <LanguageToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-on-surface hover:text-primary transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-outline-variant/30 px-margin-mobile py-8 flex flex-col gap-6 z-50">
          <AnchorToHash
            href="/#projets"
            onClick={() => setMobileMenuOpen(false)}
            className="text-label-sm font-label-sm uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors duration-300 w-full"
          >
            {isFr ? "PROJETS" : "PROJECTS"}
          </AnchorToHash>
          {dropdownLinks.map((link) => (
            <AnchorToHash
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-label-sm font-label-sm uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors duration-300 w-full"
            >
              {link.label}
            </AnchorToHash>
          ))}
          <div className="h-[1px] w-full bg-outline-variant/30 my-2"></div>
          <Link
            href="/sign-in"
            onClick={() => setMobileMenuOpen(false)}
            className="text-label-sm font-label-sm uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors duration-300"
          >
            {isFr ? "CONNEXION" : "LOGIN"}
          </Link>
          <Link
            href="/demande-service"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-primary px-6 py-2 text-center text-label-sm font-label-sm uppercase tracking-[0.2em] w-full"
          >
            {isFr ? "DEMANDER UN SERVICE" : "REQUEST A SERVICE"}
          </Link>
        </div>
      )}
    </nav>

  );
}
