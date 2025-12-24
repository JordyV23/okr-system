import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export const AppLayout = ({ children, title, subtitle }) => {
  return (
    <>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <div className="pl-64">
          <AppHeader title={title} subtitle={subtitle} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </>
  );
};
