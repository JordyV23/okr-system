import { Bell, Search, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockCycle } from "@/data/mockData";

export const AppHeader = ({ title, subtitle }) => {
  return (
    <>
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Title & Subtitle */}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center max-w-md flex-1 mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar objetivos, personas..."
                className="pl-10 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cycle Info */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{mockCycle.name}</span>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                {mockCycle.daysRemaining} días
              </Badge>
            </div>

            {/* New Objective */}
            <Button size="sm" className="gap-2 gradient-primary border-0">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Objetivo</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
};
