import { Heart, MoreVertical, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

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
  onCardClick?: (card: any) => void;
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
  onCardClick,
  isSample = false
}: GiftCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(isFavorite);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Update local state when prop changes
  useEffect(() => {
    setIsLiked(isFavorite);
  }, [isFavorite]);

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

  const handleCardClick = () => {
    if (onCardClick && !isSample) {
      onCardClick({
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
        isFavorite: isLiked,
        expiresAt
      });
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSample) return;
    
    // Start animation immediately
    setIsAnimating(true);
    
    // Update local state instantly for immediate feedback
    setIsLiked(!isLiked);
    
    // Call the parent function without waiting
    onToggleFavorite(id, isLiked).catch((error) => {
      // Only revert on error, don't wait for success
      console.error('Error updating favorite:', error);
      setIsLiked(isFavorite);
    });
    
    // Stop animation quickly for snappy feel
    setTimeout(() => setIsAnimating(false), 150);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate mouse position relative to card center (-1 to 1)
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  // Calculate dynamic tilt based on mouse position
  const getTiltTransform = () => {
    if (!isHovered) {
      return 'perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
    }
    
    // Convert mouse position to rotation angles
    const rotateY = mousePosition.x * 12; // -12° to +12° based on X position
    const rotateX = -mousePosition.y * 8; // -8° to +8° based on Y position (negative for natural feel)
    const translateZ = Math.abs(mousePosition.x) + Math.abs(mousePosition.y) * 15; // Dynamic depth
    
    return `perspective(1200px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(${translateZ}px)`;
  };

  return (
    <Card
      className={`relative overflow-hidden border-0 transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl group cursor-pointer rounded-3xl ${
        isHovered ? 'rotate-2' : 'rotate-0'
      }`}
      style={{ 
        background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
        transform: getTiltTransform()
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleCardClick}
    >
      {/* Faded background logo */}
      {brandLogoUrl && (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <img 
            src={brandLogoUrl} 
            alt={`${brandName} background`}
            className="w-32 h-32 object-contain"
          />
        </div>
      )}

      <div className="p-5 sm:p-6 h-full flex flex-col justify-between text-white relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20 transition-all duration-200 group-hover:scale-110 group-hover:bg-white/25 ${
              isHovered ? `rotate-6 translate-x-${Math.round(mousePosition.x * 2)} translate-y-${Math.round(mousePosition.y * 2)}` : 'rotate-0 translate-x-0 translate-y-0'
            }`}>
              {brandLogoUrl ? (
                <img src={brandLogoUrl} alt={`${brandName} logo`} className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-lg font-bold">{brandName.charAt(0)}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isSample && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 text-white hover:bg-white/20 transition-all duration-100 ${
                  isAnimating ? 'scale-150 bg-white/40 shadow-lg' : 'hover:scale-110'
                }`}
                onClick={handleLikeClick}
              >
                <Heart 
                  className={`h-4 w-4 transition-all duration-100 ${
                    isLiked 
                      ? 'fill-white text-white' 
                      : 'text-white/80'
                  } ${isAnimating ? 'scale-125' : ''}`} 
                />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white/80 hover:bg-white/20 transition-all duration-200 hover:scale-110"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <h3 className="text-2xl font-extrabold tracking-tight transition-all duration-300 group-hover:text-white/95">{brandName}</h3>
          <p className="text-white/85 text-sm transition-all duration-300 group-hover:text-white/90">{offerName}</p>

          {value > 0 && (
            <div className={`text-3xl font-extrabold transition-all duration-200 group-hover:scale-105 ${
              isHovered ? `rotate-1 translate-x-${Math.round(mousePosition.x * 1)} translate-y-${Math.round(mousePosition.y * 1)}` : 'rotate-0 translate-x-0 translate-y-0'
            }`}>
              ₹{value.toLocaleString('en-IN')}
            </div>
          )}

          {perks && (
            <p className="text-white/95 text-sm leading-relaxed line-clamp-2 transition-all duration-300 group-hover:text-white">
              {perks}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {expiresAt && (
              <Badge 
                variant="secondary" 
                className="bg-white/25 text-white border-0 text-xs px-3 py-1 rounded-full transition-all duration-300 group-hover:bg-white/30"
              >
                {formatExpiry(expiresAt)}
              </Badge>
            )}
            
            {/* Show used badge if card is used */}
            {false && ( // This will be controlled by parent component
              <Badge 
                variant="secondary" 
                className="bg-green-500 text-white border-0 text-xs px-3 py-1 rounded-full"
              >
                Used
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/85 capitalize transition-all duration-300 group-hover:text-white/90">{sector}</span>
            {redeemNumber && (
              <span className="text-white/70 font-mono text-xs transition-all duration-300 group-hover:text-white/80">
                #{redeemNumber.slice(-4)}
              </span>
            )}
          </div>
        </div>

        {/* Enhanced decorative elements with mouse-following effect */}
        <div className={`absolute -top-10 -right-10 w-28 h-28 bg-white/10 rounded-full opacity-50 transition-all duration-200 group-hover:scale-110 group-hover:opacity-70 ${
          isHovered ? `rotate-12 translate-x-${Math.round(mousePosition.x * 4)} translate-y-${Math.round(mousePosition.y * 4)}` : 'rotate-0 translate-x-0 translate-y-0'
        }`} />
        <div className={`absolute -bottom-6 -left-6 w-20 h-20 bg-white/5 rounded-full opacity-30 transition-all duration-200 group-hover:scale-110 group-hover:opacity-50 ${
          isHovered ? `-rotate-12 translate-x-${Math.round(mousePosition.x * 3)} translate-y-${Math.round(mousePosition.y * 3)}` : 'rotate-0 translate-x-0 translate-y-0'
        }`} />
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        
        {/* Dynamic glow effect following mouse */}
        <div className={`absolute inset-0 rounded-3xl transition-all duration-200 ${
          isHovered 
            ? `bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-60` 
            : 'opacity-0'
        }`} 
        style={{
          background: isHovered 
            ? `radial-gradient(ellipse at ${50 + mousePosition.x * 50}% ${50 + mousePosition.y * 50}%, rgba(255,255,255,0.15) 0%, transparent 70%)`
            : 'none'
        }} />
        
        {/* Floating shadow effect with mouse-following */}
        <div className={`absolute inset-0 rounded-3xl transition-all duration-200 ${
          isHovered 
            ? `shadow-2xl shadow-black/30 -translate-y-2 translate-x-${Math.round(mousePosition.x * 2)} translate-y-${Math.round(mousePosition.y * 2)}` 
            : 'shadow-lg shadow-black/10 translate-x-0 translate-y-0'
        }`} />
      </div>
    </Card>
  );
};