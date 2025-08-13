import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Navigate, Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { GiftCardGrid } from '@/components/GiftCardGrid';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold bg-hero-gradient bg-clip-text text-transparent">
            Welcome to GiftiGo
          </h1>
          <p className="text-xl text-muted-foreground">
            Your personal vault for gift cards & coupons
          </p>
          <Link to="/auth">
            <Button className="bg-hero-gradient text-background font-semibold hover:opacity-90">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1">
          <header className="h-16 flex items-center border-b border-border px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold text-foreground ml-4">My Gift Cards</h1>
          </header>
          
          <div className="p-6">
            <GiftCardGrid activeTab={activeTab} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
