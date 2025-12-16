import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/app/pages/auth/login/loginTemplate";

export default function LoginPage() {
  return (
    <div className="min-h-svh flex flex-col lg:flex-row">
      {/* LEFT SECTION */}
      <div className="flex flex-col gap-4 p-6 md:p-10 flex-1">
        {/* Brand Section */}
        <div className="flex justify-center md:justify-start gap-2">
          <a href="/pages/home" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            FastBite
          </a>
        </div>

        {/* Centered Form */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* RIGHT SECTION (if you add hero/illustrations later) */}
      {/* <div className="flex-1 hidden lg:flex bg-muted"></div> */}
    </div>
  );
}
