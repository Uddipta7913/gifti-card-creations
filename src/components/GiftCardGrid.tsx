import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { GiftCard } from './GiftCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddCardDialog } from './AddCardDialog';

interface GiftCardData {
  id: string;
  offer_name: string;
  brand_name: string;
  sector: string;
  redeem_number?: string;
  perks?: string;
  description?: string;
  brand_logo_url?: string;
  brand_color: string;
  value: number;
  is_favorite: boolean;
  expires_at?: string;
  created_at: string;
}

interface GiftCardGridProps {
  activeTab: string;
}

export const GiftCardGrid = ({ activeTab }: GiftCardGridProps) => {
  const { user } = useAuth();
  const [cards, setCards] = useState<GiftCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchCards = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('gift_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (activeTab === 'favorites') {
        query = query.eq('is_favorite', true);
      } else if (activeTab === 'expiring') {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        query = query.not('expires_at', 'is', null)
                    .lte('expires_at', sevenDaysFromNow.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [user, activeTab]);

  const handleToggleFavorite = async (cardId: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('gift_cards')
        .update({ is_favorite: !isFavorite })
        .eq('id', cardId);

      if (error) throw error;
      fetchCards();
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const handleCardAdded = () => {
    fetchCards();
    setShowAddDialog(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-48 bg-card rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const isFirstTime = cards.length === 0 && activeTab === 'all';

  return (
    <div className="space-y-6">
      {isFirstTime && (
        <div className="text-center py-12 space-y-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">
              Your personal vault for{' '}
              <span className="bg-hero-gradient bg-clip-text text-transparent">
                coupons & gift cards
              </span>
            </h2>
            <p className="text-xl text-foreground">
              No more missed rewards.
            </p>
            <p className="text-muted-foreground mt-4">
              Add and customize your coupons like this for a premium feel
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {/* Sample cards for first-time users */}
            <GiftCard
              id="sample-1"
              offerName="Rewards • Perks"
              brandName="Starbucks"
              sector="Food"
              value={0}
              brandColor="hsl(155, 59%, 27%)"
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
              brandColor="hsl(219, 100%, 66%)"
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
              brandColor="hsl(141, 73%, 42%)"
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
              brandColor="hsl(0, 0%, 0%)"
              isFavorite={false}
              onToggleFavorite={() => {}}
              isSample
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">
          {activeTab === 'all' && 'All Cards'}
          {activeTab === 'favorites' && 'Favorite Brands'}
          {activeTab === 'expiring' && 'Expiring Soon'}
        </h3>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-glow-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>

      {cards.length === 0 && !isFirstTime ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {activeTab === 'favorites' && 'No favorite cards yet'}
            {activeTab === 'expiring' && 'No cards expiring soon'}
            {activeTab === 'all' && 'No cards added yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((card) => (
            <GiftCard
              key={card.id}
              id={card.id}
              offerName={card.offer_name}
              brandName={card.brand_name}
              sector={card.sector}
              redeemNumber={card.redeem_number}
              perks={card.perks}
              description={card.description}
              brandLogoUrl={card.brand_logo_url}
              brandColor={card.brand_color}
              value={card.value}
              isFavorite={card.is_favorite}
              expiresAt={card.expires_at}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      <AddCardDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onCardAdded={handleCardAdded}
      />
    </div>
  );
};