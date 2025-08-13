import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const Analytics = () => {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    totalCards: 0,
    totalValue: 0,
    expiringSoon: 0,
    favoriteCount: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data: cards } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('user_id', user?.id);

      if (cards) {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        
        setStats({
          totalCards: cards.length,
          totalValue: cards.reduce((sum, card) => sum + (card.value || 0), 0),
          expiringSoon: cards.filter(card => 
            card.expires_at && new Date(card.expires_at) <= sevenDaysFromNow
          ).length,
          favoriteCount: cards.filter(card => card.is_favorite).length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeTab="" onTabChange={() => {}} />
        <main className="flex-1">
          <header className="h-16 flex items-center border-b border-border px-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold text-foreground ml-4">Analytics</h1>
          </header>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Total Cards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.totalCards}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Total Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">₹{stats.totalValue.toLocaleString('en-IN')}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Expiring ≤7d</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">{stats.expiringSoon}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Favorites</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">{stats.favoriteCount}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Analytics;