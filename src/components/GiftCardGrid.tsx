import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { GiftCard } from './GiftCard';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { AddCardDialog } from './AddCardDialog';
import { CardDetailDialog } from './CardDetailDialog';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

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
  is_used?: boolean;
  used_at?: string;
}

interface GiftCardGridProps {
  activeTab: string;
}

export const GiftCardGrid = ({ activeTab }: GiftCardGridProps) => {
  const { user } = useAuth();
  const [cards, setCards] = useState<GiftCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<GiftCardData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
    // Update local state immediately for instant feedback
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId 
          ? { ...card, is_favorite: !isFavorite }
          : card
      )
    );
    
    // Update database in background
    try {
      const { error } = await supabase
        .from('gift_cards')
        .update({ is_favorite: !isFavorite })
        .eq('id', cardId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating favorite:', error);
      // Revert on error
      fetchCards();
    }
  };

  const handleCardAdded = () => {
    fetchCards();
    setShowAddDialog(false);
  };

  const handleCardUpdated = () => {
    fetchCards();
  };

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
    setShowDetailDialog(true);
  };

  const handleAddCard = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowAddDialog(true);
  };

  // Filter out used cards from the main display
  const filteredCards = cards
    .filter(card => !card.is_used) // Remove used cards from homepage
    .filter(card =>
      card.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.offer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by brand name, offer, or sector..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

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
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">
          {activeTab === 'all' && 'All Cards'}
          {activeTab === 'favorites' && 'Favorite Brands'}
          {activeTab === 'expiring' && 'Expiring Soon'}
        </h3>
        <Button
          onClick={handleAddCard}
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-glow-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>

      {filteredCards.length === 0 && !isFirstTime ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'No cards match your search' : 
              activeTab === 'favorites' && 'No favorite cards yet' ||
              activeTab === 'expiring' && 'No cards expiring soon' ||
              activeTab === 'all' && 'No cards added yet'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCards.map((card) => (
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
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      )}

      <AddCardDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onCardAdded={handleCardAdded}
      />

      <CardDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        card={selectedCard}
        onToggleFavorite={handleToggleFavorite}
        onCardUpdated={handleCardUpdated}
      />
    </div>
  );
};