"use client";

import { Button } from "@/components/ui/button";

export default function LogoutButton({ action }) {
  return (
    <form action={action}>
      <Button variant="destructive" type="submit">
        Logout
      </Button>
    </form>
  );
}
