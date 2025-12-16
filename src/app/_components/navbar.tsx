"use client";

import * as React from "react";
import {
  useEffect,
  useState,
  useRef,
  useId,
  RefCallback,
  FormEvent,
} from "react";

import { SearchIcon, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils";

// ---------------------------------------------
// Types
// ---------------------------------------------
interface NavItem {
  href?: string;
  label: string;
}

interface Navbar04Props extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: NavItem[];
  cartCount?: number;
  searchPlaceholder?: string;
}

// ---------------------------------------------
// SVG Logo
// ---------------------------------------------
const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 324 323"
    fill="currentColor"
    {...props}
  >
    <rect
      x="88.1"
      y="144.8"
      width="151.8"
      height="36.57"
      rx="18.3"
      transform="rotate(-38.58 88.1 144.8)"
      fill="currentColor"
    />
    <rect
      x="85.34"
      y="244.53"
      width="151.8"
      height="36.57"
      rx="18.3"
      transform="rotate(-38.58 85.34 244.53)"
      fill="currentColor"
    />
  </svg>
);

// ---------------------------------------------
// Hamburger Icon
// ---------------------------------------------
const HamburgerIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className,
  ...props
}) => (
  <svg
    className={cn("pointer-events-none", className)}
    width={26}
    height={26}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <g className="transition-all duration-300 group-aria-expanded:opacity-0">
      <path d="M3 7h18" />
      <path d="M3 12h18" />
      <path d="M3 17h18" />
    </g>

    <g className="opacity-0 transition-all duration-300 group-aria-expanded:opacity-100">
      <path d="M6 6l12 12" />
      <path d="M18 6l-12 12" />
    </g>
  </svg>
);

// ---------------------------------------------
// MAIN NAVBAR COMPONENT
// ---------------------------------------------
export const Navbar04 = React.forwardRef<HTMLElement, Navbar04Props>(
  (
    {
      className,
      logo = <Logo />,
      logoHref = "/pages/home",
      navigationLinks = [
        { href: "/pages/products", label: "Products" },
        { href: "/pages/categories", label: "Categories" },
        { href: "/pages/profile", label: "Profile" },
      ],
      searchPlaceholder = "Search...",
      ...props
    },
    ref
  ) => {
    const router = useRouter();

    // Only login state remains
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [isMobile, setIsMobile] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const containerRef = useRef<HTMLElement | null>(null);
    const searchId = useId();

    // Fetch login state ONLY
    useEffect(() => {
      const checkLogin = async () => {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (session?.user?.id) setIsLoggedIn(true);
        else setIsLoggedIn(false);
      };

      checkLogin();
    }, []);

    // Detect mobile layout
    useEffect(() => {
      const checkWidth = () => {
        if (containerRef.current) {
          setIsMobile(containerRef.current.offsetWidth < 768);
        }
      };

      checkWidth();
      const ro = new ResizeObserver(checkWidth);
      if (containerRef.current) ro.observe(containerRef.current);
      return () => ro.disconnect();
    }, []);

    const combinedRef: RefCallback<HTMLElement> = (node) => {
      containerRef.current = node;

      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object") ref.current = node;
    };

    const goToSignIn = () => router.push("/pages/auth/signup");
    const goToCart = () => router.push("/pages/cart");

    const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const query = new FormData(e.currentTarget).get("search") as string;
      console.log("Search:", query);
    };

    return (
      <header
        ref={combinedRef}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4 md:px-6",
          className
        )}
        {...props}
      >
        {/* TOP ROW */}
        <div className="container mx-auto flex h-16 items-center justify-between gap-2 md:gap-4">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-2 shrink-0">
            {isMobile && (
              <Button
                className="group h-9 w-9"
                variant="ghost"
                size="icon"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((p) => !p)}
              >
                <HamburgerIcon />
              </Button>
            )}

            <a
              href={logoHref}
              className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors"
            >
              <div className="text-2xl">{logo}</div>
              <span className="hidden font-bold text-xl sm:inline-block">
                FastBite
              </span>
            </a>
          </div>

          {/* CENTER */}
          <div className="flex flex-1 items-center justify-between md:justify-around gap-6 min-w-0">
            {!isMobile && (
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  {navigationLinks.map((item) => (
                    <NavigationMenuItem key={item.href}>
                      <NavigationMenuLink
                        href={item.href}
                        className="text-muted-foreground font-medium transition-colors px-4 py-2 text-sm hover:text-white"
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            )}

            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full max-w-225"
            >
              <Input
                id={searchId}
                name="search"
                className="peer w-full h-10 ps-8 pe-2"
                placeholder={searchPlaceholder}
                type="search"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2 text-muted-foreground/80">
                <SearchIcon size={20} />
              </div>
            </form>
          </div>

          {/* RIGHT SIDE (DESKTOP) */}
          {!isMobile && (
            <div className="flex items-center gap-3 shrink-0">
              {/* SIGN IN CONDITIONAL */}
              {!isLoggedIn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToSignIn}
                  className="text-sm cursor-pointer"
                >
                  Sign In
                </Button>
              )}

              {/* CART ICON ONLY */}
              <Button
                size="sm"
                onClick={goToCart}
                className="text-sm px-4 h-9 cursor-pointer"
              >
                <ShoppingCart size={18} className="text-white " />
              </Button>
            </div>
          )}
        </div>

        {/* MOBILE MENU */}
        {isMobile && mobileOpen && (
          <div className="w-full bg-background border-b p-3 animate-in slide-in-from-top duration-200">
            <NavigationMenu className="max-w-none w-full">
              <NavigationMenuList className="flex-col items-start gap-0 w-full">
                {navigationLinks.map((link) => (
                  <NavigationMenuItem key={link.href} className="w-full">
                    <a
                      href={link.href}
                      className="w-full px-3 py-2 rounded-md text-sm hover:bg-accent"
                    >
                      {link.label}
                    </a>
                  </NavigationMenuItem>
                ))}

                <div className="bg-border -mx-1 my-2 h-px" />

                {/* SIGN IN MOBILE */}
                {!isLoggedIn && (
                  <NavigationMenuItem className="w-full">
                    <button
                      onClick={goToSignIn}
                      className="w-full px-3 py-2 rounded-md text-sm hover:bg-accent"
                    >
                      Sign In
                    </button>
                  </NavigationMenuItem>
                )}

                {/* CART MOBILE */}
                <NavigationMenuItem className="w-full">
                  <Button size="sm" className="w-full" onClick={goToCart}>
                    <ShoppingCart size={18} className="text-white" />
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        )}
      </header>
    );
  }
);

Navbar04.displayName = "Navbar04";

export { Logo, HamburgerIcon };
