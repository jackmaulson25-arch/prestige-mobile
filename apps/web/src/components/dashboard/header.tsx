"use client";

import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="h-6 w-6" />
      </Button>

      {/* Search */}
      <div className="relative hidden flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users, content..."
          className="w-full max-w-md pl-10"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="" alt="Admin" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            A
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
