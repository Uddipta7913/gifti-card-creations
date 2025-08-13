import { Heart, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GiftCardProps {
  id: string;
  offerName: string;
  brandName: string;
  sector: string;
  redeemNumber?: string;
  perks?: string;
  description?: string;
  brandLogoUrl?: string;
  brandColor: string;
  value: number;
  isFavorite: boolean;
  expiresAt?: string;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  isSample?: boolean;
}

export const GiftCard = ({
  id,
  offerName,
  brandName,
  sector,
  redeemNumber,
  perks,
  description,
  brandLogoUrl,
  brandColor,
  value,
  isFavorite,
  expiresAt,
  onToggleFavorite,
  isSample = false
}: GiftCardProps) => {
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

  return (
    <Card 
      className="relative overflow-hidden border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer"
      style={{
        background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
      }}
    >
      <div className="p-6 h-full flex flex-col justify-between text-white relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            {brandLogoUrl ? (
              <img 
                src={brandLogoUrl} 
                alt={`${brandName} logo`}
                className="w-8 h-8 rounded-lg object-contain bg-white/20 p-1"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-xs font-bold">
                  {brandName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!isSample && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(id, isFavorite);
                }}
              >
                <Heart 
                  className={`h-4 w-4 ${
                    isFavorite ? 'fill-white text-white' : 'text-white/70'
                  }`} 
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:bg-white/20 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-xl font-bold mb-1">{brandName}</h3>
            <p className="text-white/80 text-sm">{offerName}</p>
          </div>

          {value > 0 && (
            <div className="text-2xl font-bold">
              ₹{value.toLocaleString('en-IN')}
            </div>
          )}

          {perks && (
            <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
              {perks}
            </p>
          )}

          {expiresAt && (
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white border-0 text-xs"
            >
              {formatExpiry(expiresAt)}
            </Badge>
          )}
        </div>

        {/* Bottom section */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/80 capitalize">{sector}</span>
            {redeemNumber && (
              <span className="text-white/60 font-mono text-xs">
                #{redeemNumber.slice(-4)}
              </span>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full opacity-50" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full opacity-30" />
      </div>
    </Card>
  );
};