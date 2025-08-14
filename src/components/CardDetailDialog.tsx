import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Heart, Copy, ExternalLink, Calendar, Tag, Hash, Gift, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CardDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: any;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onCardUpdated?: () => void;
}

export const CardDetailDialog = ({ 
  open, 
  onOpenChange, 
  card, 
  onToggleFavorite,
  onCardUpdated
}: CardDetailDialogProps) => {
  const [copying, setCopying] = useState(false);
  const [markingUsed, setMarkingUsed] = useState(false);

  if (!card) return null;

  const formatExpiry = (date: string) => {
    const expiryDate = new Date(date);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 7) return `Expires in ${diffDays} days`;
    return `Expires ${expiryDate.toLocaleDateString()}`;
  };

  const copyToClipboard = async (text: string, label: string) => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    } finally {
      setCopying(false);
    }
  };

  const markAsUsed = async () => {
    if (!card.id) return;
    
    setMarkingUsed(true);
    try {
      const { error } = await supabase
        .from('gift_cards')
        .update({ 
          is_used: true,
          used_at: new Date().toISOString()
        })
        .eq('id', card.id);

      if (error) throw error;
      
      toast.success('Card marked as used!');
      
      // Update the local card state
      const updatedCard = { ...card, is_used: true, used_at: new Date().toISOString() };
      
      // Call the callback to update parent
      onCardUpdated?.();
      
      // Close dialog after a short delay to show success
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error marking card as used:', error);
      toast.error('Failed to mark card as used');
    } finally {
      setMarkingUsed(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card border-border">
        {/* Cross button in top right corner */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 z-50"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader className="pr-12">
          <DialogTitle className="text-foreground">Gift Card Details</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            View and manage your gift card information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Card Preview */}
          <div 
            className="relative overflow-hidden rounded-2xl p-6 text-white"
            style={{ background: `linear-gradient(135deg, ${card.brandColor} 0%, ${card.brandColor}dd 100%)` }}
          >
            {/* Faded background logo */}
            {card.brandLogoUrl && (
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <img 
                  src={card.brandLogoUrl} 
                  alt={`${card.brandName} background`}
                  className="w-40 h-40 object-contain"
                />
              </div>
            )}

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                    {card.brandLogoUrl ? (
                      <img src={card.brandLogoUrl} alt={`${card.brandName} logo`} className="w-10 h-10 object-contain" />
                    ) : (
                      <span className="text-2xl font-bold">{card.brandName.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold">{card.brandName}</h3>
                    <p className="text-white/90 text-lg">{card.offerName}</p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-white hover:bg-white/20"
                  onClick={() => onToggleFavorite(card.id, card.isFavorite)}
                >
                  <Heart className={`h-5 w-5 ${card.isFavorite ? 'fill-white text-white' : 'text-white/80'}`} />
                </Button>
              </div>

              {card.value > 0 && (
                <div className="text-4xl font-bold mb-4">
                  ₹{card.value.toLocaleString('en-IN')}
                </div>
              )}

              {card.perks && (
                <p className="text-white/95 text-lg leading-relaxed mb-4">
                  {card.perks}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/25 text-white border-0">
                  <Tag className="w-3 h-3 mr-1" />
                  {card.sector}
                </Badge>
                {card.expiresAt && (
                  <Badge className="bg-white/25 text-white border-0">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatExpiry(card.expiresAt)}
                  </Badge>
                )}
                {card.is_used && (
                  <Badge className="bg-green-500 text-white border-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Used
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Card Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Card Information</h4>
            
            {card.description && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-foreground bg-muted/50 p-3 rounded-lg">
                  {card.description}
                </p>
              </div>
            )}

            {card.redeemNumber && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Redeem Code</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-muted/50 p-3 rounded-lg font-mono text-foreground">
                    {card.redeemNumber}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(card.redeemNumber, 'Redeem code')}
                    disabled={copying}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Brand</label>
                <p className="text-foreground bg-muted/50 p-3 rounded-lg">
                  {card.brandName}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Sector</label>
                <p className="text-foreground bg-muted/50 p-3 rounded-lg capitalize">
                  {card.sector}
                </p>
              </div>
            </div>

            {card.expiresAt && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                <p className="text-foreground bg-muted/50 p-3 rounded-lg">
                  {new Date(card.expiresAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {card.is_used && card.used_at && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Used On</label>
                <p className="text-foreground bg-muted/50 p-3 rounded-lg">
                  {new Date(card.used_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {!card.is_used && (
              <Button
                onClick={markAsUsed}
                disabled={markingUsed}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {markingUsed ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 animate-spin" />
                    Marking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Used
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={() => {
                // Here you could add functionality to edit the card
                toast.info('Edit functionality coming soon!');
              }}
            >
              <Gift className="w-4 h-4 mr-2" />
              Edit Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
