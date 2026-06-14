"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ServiceRequestForm } from "@/components/forms/service-request-form";
import {
  ONBOARDING_SESSION_SKIP_KEY,
  ONBOARDING_WELCOME_SEEN_SESSION_KEY,
  isOnOnboardingStepTargetPage,
} from "@/lib/onboarding";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FolderKanban,
  ShoppingBag,
  Truck,
  Settings,
  LogOut,
  Users,
  PanelLeftClose,
  PanelLeft,
  User,
  SlidersHorizontal,
  Moon,
  Rocket,
  Sun,
  ArrowLeft,
  CreditCard,
  Bug,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SizerLogo } from "@/components/veta-logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { PageLoading } from "@/components/loaders/page-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getDisplayName } from "@/lib/display-name";
import { appPath } from "@/lib/app-paths";
import { getReportBugUrl } from "@/lib/report-bug";
import { AuthConfirmedTracker } from "@/components/gtm/auth-confirmed-tracker";

function AppLayoutSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="mt-8 flex-1">
        <PageLoading variant="default" />
      </div>
    </>
  );
}

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  BASE: "Base",
  PRO: "Pro",
  STUDIO: "Studio",
};

function getSettingsBreadcrumbs(
  pathname: string,
  t: (key: string) => string
): { label: string; href?: string }[] {
  const base = { label: t("settings"), href: appPath("/settings") };
  const pathToKey: Record<string, string> = {
    [appPath("/settings")]: "account",
    [appPath("/settings/account")]: "account",
    [appPath("/settings/plan")]: "yourPlan",
    [appPath("/settings/plan/change")]: "changePlan",
    [appPath("/settings/customization")]: "customization",
  };
  const key = pathToKey[pathname];
  if (!key) return [base];
  const items = [base, { label: t(key) }];
  if (pathname === appPath("/settings/plan/change")) {
    items.splice(1, 0, {
      label: t("yourPlan"),
      href: appPath("/settings/plan"),
    });
  }
  return items;
}


function isMobileTabActive(pathname: string, path: string): boolean {
  const href = appPath(path);
  if (href === appPath("/dashboard")) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isMobileMoreActive(pathname: string, isMenuOpen: boolean): boolean {
  return (
    isMenuOpen ||
    pathname.startsWith(appPath("/catalog")) ||
    pathname.startsWith(appPath("/settings")) ||
    pathname.startsWith(appPath("/profile"))
  );
}

function MobileBottomNav({
  pathname,
  isMenuOpen,
  onMenuOpen,
  navItems,
  tNav,
  tLayout,
}: {
  pathname: string;
  isMenuOpen: boolean;
  onMenuOpen: () => void;
  navItems: Array<{ name: string; href: string; icon: LucideIcon; onClick?: () => void }>;
  tNav: ReturnType<typeof useTranslations<"AppNav">>;
  tLayout: ReturnType<typeof useTranslations<"AppLayout">>;
}) {
  const tabClass = (active: boolean) =>
    cn(
      "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors",
      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    );

  return (
    <nav
      aria-label={tLayout("mobileNavAria")}
      className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed inset-x-0 bottom-0 z-40 touch-manipulation border-t pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm md:hidden print:hidden"
    >
      <div className="flex h-16 items-stretch px-1">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const handleClick = (e: React.MouseEvent) => {
            if (item.onClick) {
              e.preventDefault();
              item.onClick();
            }
          };
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClick}
              className={tabClass(isActive)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn("h-5 w-5 shrink-0", isActive && "scale-105")}
                aria-hidden
              />
              <span className="max-w-full truncate text-[10px] leading-tight font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMenuOpen}
          className={tabClass(isMobileMoreActive(pathname, isMenuOpen))}
          aria-label={`${tNav("more")}, ${tLayout("openMenu")}`}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-sheet"
        >
          <MoreHorizontal
            className={cn(
              "h-5 w-5 shrink-0",
              isMobileMoreActive(pathname, isMenuOpen) && "scale-105"
            )}
            aria-hidden
          />
          <span className="max-w-full truncate text-[10px] leading-tight font-medium">
            {tNav("more")}
          </span>
        </button>
      </div>
    </nav>
  );
}

function SidebarContent({
  collapsed = false,
  user,
  profileFullName,
  effectivePlan,
  roles,
  signOut,
  pathname,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
  onServiceRequestClick,
  className,
}: {
  collapsed?: boolean;
  user: ReturnType<typeof useAuth>["user"];
  profileFullName: ReturnType<typeof useAuth>["profileFullName"];
  effectivePlan: ReturnType<typeof useAuth>["effectivePlan"];
  roles: ReturnType<typeof useAuth>["roles"];
  signOut: () => Promise<void>;
  pathname: string;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onServiceRequestClick?: () => void;
  /** Clases adicionales para el contenedor raíz (ej. en desktop: md:fixed md:w-64) */
  className?: string;
}) {
  const tNav = useTranslations("AppNav");

  const navItems = useMemo(() => {
    const items = [];
    const rolesList = roles && roles.length > 0 ? roles : ["client"];

    // 1. Client navigation items
    if (rolesList.includes("client")) {
      items.push(
        {
          name: tNav("clientDashboard"),
          href: appPath("/portal"),
          icon: LayoutDashboard,
        },
        {
          name: "Mes projets",
          href: appPath("/mes-projets"),
          icon: FolderKanban,
        },
        {
          name: tNav("requestServices"),
          href: appPath("/services"),
          icon: FolderKanban,
          onClick: onServiceRequestClick,
        }
      );
    }

    // 2. Internal Staff (architect, site_manager, admin) navigation items
    const isInternal = rolesList.some((r) =>
      ["architect", "site_manager", "admin"].includes(r)
    );
    if (isInternal) {
      items.push(
        {
          name: tNav("dashboard"),
          href: appPath("/dashboard"),
          icon: LayoutDashboard,
        },
        {
          name: tNav("projects"),
          href: appPath("/projects"),
          icon: FolderKanban,
        },
        {
          name: tNav("clients"),
          href: appPath("/clients"),
          icon: Users,
        },
        {
          name: tNav("suppliers"),
          href: appPath("/suppliers"),
          icon: Truck,
        },
        {
          name: tNav("catalog"),
          href: appPath("/catalog"),
          icon: ShoppingBag,
        }
      );
    }

    // 3. Admin specific navigation items
    if (rolesList.includes("admin")) {
      items.push(
        {
          name: tNav("serviceRequests"),
          href: appPath("/admin/service-requests"),
          icon: FolderKanban,
        },
        {
          name: tNav("hr"),
          href: appPath("/admin/hr"),
          icon: SlidersHorizontal,
        },
        {
          name: tNav("site"),
          href: appPath("/admin/site"),
          icon: Settings,
        }
      );
    }

    return items;
  }, [roles, tNav, onServiceRequestClick]);

  const settingsNavItems = useMemo(() => {
    const rolesList = roles && roles.length > 0 ? roles : ["client"];
    const isInternal = rolesList.some((r) =>
      ["architect", "site_manager", "admin"].includes(r)
    );
    const backHref = isInternal ? appPath("/dashboard") : appPath("/client");

    return [
      { name: tNav("back"), href: backHref, icon: ArrowLeft },
      { name: tNav("account"), href: appPath("/settings/account"), icon: User },
    ];
  }, [roles, tNav]);

  const { theme, setTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  useEffect(() => setThemeMounted(true), []);

  const isInSettings = pathname.includes("/settings");
  const navSource = isInSettings ? settingsNavItems : navItems;

  const renderNavLink = (
    item: (typeof navItems)[number] | (typeof settingsNavItems)[number],
    isActive: boolean,
    animationDelayMs?: number
  ) => {
    const handleClick = (e: React.MouseEvent) => {
      if ('onClick' in item && item.onClick) {
        e.preventDefault();
        item.onClick();
      }
      setIsMobileOpen(false);
    };

    const linkContent = (
      <Link
        href={item.href}
        onClick={handleClick}
        className={cn(
          "group flex items-center rounded-xl text-sm font-medium transition-all duration-200",
          collapsed ? "justify-center px-2 py-2.5" : "px-4 py-2.5",
          isActive
            ? "bg-primary text-primary-foreground shadow-primary/20 shadow-md"
            : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
        )}
        style={
          animationDelayMs != null
            ? { animationDelay: `${animationDelayMs}ms` }
            : undefined
        }
      >
        <item.icon
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
            !collapsed && "mr-3",
            isActive
              ? "text-primary-foreground"
              : "text-muted-foreground group-hover:text-secondary-foreground"
          )}
        />
        {!collapsed && item.name}
      </Link>
    );
    const wrapped = (
      <span
        className={cn(
          "block",
          isInSettings &&
            "animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-300"
        )}
        style={
          isInSettings && animationDelayMs != null
            ? { animationDelay: `${animationDelayMs}ms` }
            : undefined
        }
      >
        {linkContent}
      </span>
    );
    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{wrapped}</TooltipTrigger>
          <TooltipContent side="right" variant="tertiary">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }
    return wrapped;
  };

  return (
    <div
      className={cn(
        "bg-sidebar border-border relative flex h-full flex-col border-r",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 p-6",
          collapsed && "justify-center p-4"
        )}
      >
        <Link
          href={isInSettings ? appPath("/settings") : appPath("/dashboard")}
          className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center"
          )}
        >
          <div className="brightness-0 invert">
            <SizerLogo
              height={48}
              showWordmark={!collapsed}
              className="text-foreground"
            />
          </div>
        </Link>
      </div>

      {/* Toggle button - positioned at the edge */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="bg-background border-border hover:bg-secondary absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 rounded-full border p-1 shadow-md transition-colors md:flex"
        aria-label={collapsed ? tNav("expandSidebar") : tNav("collapseSidebar")}
      >
        {collapsed ? (
          <PanelLeft className="text-muted-foreground h-4 w-4" />
        ) : (
          <PanelLeftClose className="text-muted-foreground h-4 w-4" />
        )}
      </button>

      <nav className={cn("flex-1 space-y-1.5", collapsed ? "px-2" : "px-4")}>
        {navSource.map((item, index) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Fragment key={item.href}>
              {renderNavLink(
                item,
                isActive,
                isInSettings ? index * 80 : undefined
              )}
            </Fragment>
          );
        })}
      </nav>
      <div
        className={cn(
          "border-border mt-auto border-t",
          collapsed ? "p-2" : "space-y-3 p-4"
        )}
      >
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:bg-secondary flex w-full cursor-pointer justify-center rounded-xl p-2 transition-colors">
                    <Avatar className="border-border h-9 w-9 border">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.email?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  align="end"
                  className="w-56 rounded-xl"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">
                          {getDisplayName(user, profileFullName)}
                        </p>
                        {effectivePlan?.plan_code && (
                          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                            {PLAN_DISPLAY_NAMES[effectivePlan.plan_code] ??
                              effectivePlan.plan_code}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={appPath("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      {tNav("settings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const url = getReportBugUrl({
                        viewTitle:
                          typeof document !== "undefined" ? document.title : "",
                        viewUrl:
                          typeof window !== "undefined"
                            ? window.location.href
                            : "",
                      });
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    className="cursor-pointer"
                  >
                    <Bug className="mr-2 h-4 w-4" />
                    {tNav("reportBug")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {tNav("signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent side="right" variant="tertiary">
              {getDisplayName(user, profileFullName)}
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="bg-secondary/50 border-border/50 flex items-center gap-3 rounded-xl border p-2">
            <Avatar className="border-border h-9 w-9 border">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-foreground truncate text-sm font-medium">
                {getDisplayName(user, profileFullName)}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {user?.email}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label={tNav("accountMenuAria")}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">
                        {getDisplayName(user, profileFullName)}
                      </p>
                      {effectivePlan?.plan_code && (
                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                          {PLAN_DISPLAY_NAMES[effectivePlan.plan_code] ??
                            effectivePlan.plan_code}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={appPath("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    {tNav("settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const url = getReportBugUrl({
                      viewTitle:
                        typeof document !== "undefined" ? document.title : "",
                      viewUrl:
                        typeof window !== "undefined"
                          ? window.location.href
                          : "",
                    });
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="cursor-pointer"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  {tNav("reportBug")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {tNav("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const tLayout = useTranslations("AppLayout");
  const tCrumb = useTranslations("AppSettingsBreadcrumb");
  const tNav = useTranslations("AppNav");
  const { user, profileFullName, effectivePlan, roles, signOut, loading } = useAuth();
  const pathname = usePathname();

  // State declarations - must be before useMemo that uses them
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [serviceRequestModalOpen, setServiceRequestModalOpen] = useState(false);

  // Navigation items based on user roles
  const navItems = useMemo(() => {
    const items = [];
    const rolesList = roles && roles.length > 0 ? roles : ["client"];

    // 1. Client navigation items
    if (rolesList.includes("client")) {
      items.push(
        {
          name: tNav("clientDashboard"),
          href: appPath("/portal"),
          icon: LayoutDashboard,
        },
        {
          name: "Mes projets",
          href: appPath("/mes-projets"),
          icon: FolderKanban,
        },
        {
          name: tNav("requestServices"),
          href: appPath("/services"),
          icon: FolderKanban,
          onClick: () => setServiceRequestModalOpen(true),
        }
      );
    }

    // 2. Internal Staff (architect, site_manager, admin) navigation items
    const isInternal = rolesList.some((r) =>
      ["architect", "site_manager", "admin"].includes(r)
    );
    if (isInternal) {
      items.push(
        {
          name: tNav("dashboard"),
          href: appPath("/dashboard"),
          icon: LayoutDashboard,
        },
        {
          name: tNav("projects"),
          href: appPath("/projects"),
          icon: FolderKanban,
        },
        {
          name: tNav("clients"),
          href: appPath("/clients"),
          icon: Users,
        },
        {
          name: tNav("suppliers"),
          href: appPath("/suppliers"),
          icon: Truck,
        },
        {
          name: tNav("catalog"),
          href: appPath("/catalog"),
          icon: ShoppingBag,
        }
      );
    }

    // 3. Admin specific navigation items
    if (rolesList.includes("admin")) {
      items.push(
        {
          name: tNav("hr"),
          href: appPath("/admin/hr"),
          icon: SlidersHorizontal,
        },
        {
          name: tNav("site"),
          href: appPath("/admin/site"),
          icon: Settings,
        }
      );
    }

    return items;
  }, [roles, tNav]);

  useEffect(() => {
    document.body.classList.add("sizer-app");
    return () => document.body.classList.remove("sizer-app");
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col p-6">
        <AppLayoutSkeleton />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <AuthConfirmedTracker />
      <a href="#main-content" className="skip-link">
        {tLayout("skipToContent")}
      </a>
      <div className="bg-background text-foreground flex min-h-screen">
        {/* Desktop Sidebar */}
        <SidebarContent
          collapsed={isCollapsed}
          user={user}
          profileFullName={profileFullName}
          effectivePlan={effectivePlan}
          roles={roles}
          signOut={signOut}
          pathname={pathname}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onServiceRequestClick={() => setServiceRequestModalOpen(true)}
          className={cn(
            "z-50 hidden shadow-sm transition-all duration-300 md:fixed md:inset-y-0 md:flex md:flex-col print:hidden",
            isCollapsed ? "md:w-16" : "md:w-64"
          )}
        />

        {/* Mobile nav sheet */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent
            id="mobile-nav-sheet"
            side="right"
            className="border-border w-64 border-l p-0 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
            closeLabel={tLayout("closeMenu")}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{tLayout("navMenuTitle")}</SheetTitle>
              <SheetDescription>
                {tLayout("navMenuDescription")}
              </SheetDescription>
            </SheetHeader>
            <SidebarContent
              collapsed={false}
              user={user}
              profileFullName={profileFullName}
              effectivePlan={effectivePlan}
              roles={roles}
              signOut={signOut}
              pathname={pathname}
              setIsMobileOpen={setIsMobileOpen}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
              onServiceRequestClick={() => setServiceRequestModalOpen(true)}
            />
          </SheetContent>
        </Sheet>

        <div
          className={cn(
            "flex w-full min-w-0 flex-1 flex-col transition-all duration-300 print:ml-0",
            isCollapsed ? "md:ml-16" : "md:ml-64"
          )}
        >
          {/* Top Navbar */}
          <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/80 border-border sticky top-0 z-30 hidden border-b backdrop-blur-sm md:block print:hidden">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  const handleClick = (e: React.MouseEvent) => {
                    if ('onClick' in item && typeof item.onClick === 'function') {
                      e.preventDefault();
                      item.onClick();
                    }
                  };
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleClick}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      <Avatar className="border-border h-8 w-8 border">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user?.email?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1.5">
                        <p className="text-sm font-medium">
                          {getDisplayName(user, profileFullName)}
                        </p>
                        <p className="text-muted-foreground text-xs">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={appPath("/settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        {tNav("settings")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const url = getReportBugUrl({
                          viewTitle: typeof document !== "undefined" ? document.title : "",
                          viewUrl: typeof window !== "undefined" ? window.location.href : "",
                        });
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      className="cursor-pointer"
                    >
                      <Bug className="mr-2 h-4 w-4" />
                      {tNav("reportBug")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {tNav("signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </nav>

          <main
            id="main-content"
            tabIndex={-1}
            className={cn(
              "w-full min-w-0 flex-1 overflow-x-hidden px-4 pt-4 transition-all duration-300 md:p-5 print:p-0",
              "pb-[calc(4rem+max(1rem,env(safe-area-inset-bottom,0px)))] md:pb-5",
              "animate-in fade-in slide-in-from-bottom-4 duration-500"
            )}
          >
            {(pathname.includes("/settings") ||
              pathname === appPath("/settings/customization")) && (
              <nav
                aria-label={tLayout("breadcrumbAria")}
                className="text-muted-foreground mb-4 flex items-center gap-1.5 text-sm md:mb-5"
              >
                <ol className="flex flex-wrap items-center gap-1.5">
                  {getSettingsBreadcrumbs(pathname, tCrumb).map((item, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      {i > 0 && (
                        <ChevronRight
                          className="h-4 w-4 shrink-0 opacity-60"
                          aria-hidden
                        />
                      )}
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="hover:text-foreground transition-colors"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span
                          className="text-foreground font-medium"
                          aria-current="page"
                        >
                          {item.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            {children}
          </main>

          <MobileBottomNav
            pathname={pathname}
            isMenuOpen={isMobileOpen}
            onMenuOpen={() => setIsMobileOpen(true)}
            navItems={navItems}
            tNav={tNav}
            tLayout={tLayout}
          />
        </div>
      </div>

      {/* Service Request Modal */}
      <Dialog open={serviceRequestModalOpen} onOpenChange={setServiceRequestModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Nouvelle demande de service</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Remplissez le formulaire ci-dessous pour créer une nouvelle demande de service.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            <ServiceRequestForm
              onSuccess={() => setServiceRequestModalOpen(false)}
              userEmail={user?.email}
              userName={profileFullName || undefined}
            />
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
