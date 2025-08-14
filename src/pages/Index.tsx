import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Navigate, Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { GiftCardGrid } from '@/components/GiftCardGrid';
import { GiftCard } from '@/components/GiftCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 space-y-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold mb-4">
                Your personal vault for{' '}
                <span className="bg-hero-gradient bg-clip-text text-transparent">
                  coupons & gift cards
                </span>
              </h1>
              <p className="text-2xl text-foreground mb-4">
                No more missed rewards.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Add and customize your coupons like this for a premium feel
              </p>
              <div className="space-y-4">
                <p className="text-xl text-foreground">
                  Add your first gift card
                </p>
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-glow-primary px-8 py-3 text-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Card
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
              {/* Sample cards for welcome page */}
              <GiftCard
                id="sample-1"
                offerName="Rewards • Perks"
                brandName="Starbucks"
                sector="Food"
                value={0}
                brandColor="#00704A"
                brandLogoUrl="https://logo.clearbit.com/starbucks.com"
                isFavorite={false}
                onToggleFavorite={() => {}}
                isSample
              />
              <GiftCard
                id="sample-2"
                offerName="Fashion • Gift"
                brandName="American Eagle"
                sector="Fashion"
                value={0}
                brandColor="#1e40af"
                brandLogoUrl="https://logo.clearbit.com/ae.com"
                isFavorite={false}
                onToggleFavorite={() => {}}
                isSample
              />
              <GiftCard
                id="sample-3"
                offerName="Music • Gift"
                brandName="Spotify Premium"
                sector="Entertainment"
                value={0}
                brandColor="#1DB954"
                brandLogoUrl="https://logo.clearbit.com/spotify.com"
                isFavorite={false}
                onToggleFavorite={() => {}}
                isSample
              />
              <GiftCard
                id="sample-4"
                offerName="Sport • Gift"
                brandName="Nike Member"
                sector="Sports"
                value={0}
                brandColor="#111111"
                brandLogoUrl="https://logo.clearbit.com/nike.com"
                isFavorite={false}
                onToggleFavorite={() => {}}
                isSample
              />
              <GiftCard
                id="sample-5"
                offerName="Food • Gift"
                brandName="McDonald's"
                sector="Food"
                value={0}
                brandColor="#FFC300"
                brandLogoUrl="https://logo.clearbit.com/mcdonalds.com"
                isFavorite={false}
                onToggleFavorite={() => {}}
                isSample
              />
              <GiftCard
                id="sample-6"
                offerName="Fashion • Gift"
                brandName="H&M Club"
                sector="Fashion"
                value={0}
                brandColor="#E5002A"
                brandLogoUrl="https://logo.clearbit.com/hm.com"
                isFavorite={false}
                onToggleFavorite={() => {}}
                isSample
              />
              <GiftCard
                id="sample-7"
                offerName="Retail • Gift"
                brandName="Gap Gift"
                sector="Retail"
                value={0}
                brandColor="#2A4B9B"
                brandLogoUrl="https://logo.clearbit.com/gap.com"
                isFavorite={false}
                onToggleFavorite={() => {}}
                isSample
              />
            </div>
          </div>
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
