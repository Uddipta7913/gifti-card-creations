import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Loader2, Search, Eye, EyeOff } from 'lucide-react';
import { GiftCard } from './GiftCard';

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCardAdded: () => void;
}

const sectors = [
  'Food & Dining',
  'Fashion & Clothing', 
  'Entertainment',
  'Sports & Fitness',
  'Technology',
  'Travel',
  'Health & Beauty',
  'Home & Garden',
  'Education',
  'Other'
];

const getBrandColor = (brandName: string): string => {
  const brand = brandName.toLowerCase();
  const colorMap: Record<string, string> = {
    'starbucks': '#00704A',
    'spotify': '#1DB954',
    'nike': '#111111',
    'mcdonalds': '#FFC300',
    'mcdonald': '#FFC300',
    'h&m': '#E5002A',
    'gap': '#2A4B9B',
    'american eagle': '#1e40af',
    'amazon': '#FF9900',
    'apple': '#000000',
    'google': '#4285F4',
    'microsoft': '#00A4EF',
    'walmart': '#0071CE',
    'target': '#CC0000',
    'zara': '#000000',
    'adidas': '#000000',
    'puma': '#000000',
    'uber': '#000000',
    'netflix': '#E50914',
    'youtube': '#FF0000',
    'facebook': '#1877F2',
    'instagram': '#E4405F',
    'twitter': '#1DA1F2',
    'linkedin': '#0A66C2',
    'samsung': '#1428A0',
    'sony': '#000000',
    'pepsi': '#004B93',
    'coca cola': '#F40009',
    'dominos': '#0B4EA2',
    'pizza hut': '#FF0000',
    'kfc': '#F40027',
    'burger king': '#FF6600',
    'subway': '#489E3B',
    'dunkin': '#FF671F',
    'taco bell': '#702082',
  };

  for (const [key, color] of Object.entries(colorMap)) {
    if (brand.includes(key)) {
      return color;
    }
  }
  
  // Default gradient color
  return '#8B5CF6';
};

export const AddCardDialog = ({ open, onOpenChange, onCardAdded }: AddCardDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoSearching, setLogoSearching] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    offerName: '',
    brandName: '',
    sector: '',
    redeemNumber: '',
    perks: '',
    description: '',
    value: '',
    expiresAt: '',
    brandLogoUrl: '',
    brandColor: '#8B5CF6'
  });

  const searchBrandLogo = async (brandName: string) => {
    if (!brandName.trim()) return;
    
    setLogoSearching(true);
    try {
      // Call the edge function to search for brand logo
      const { data, error } = await supabase.functions.invoke('search-brand-logo', {
        body: { brandName: brandName.trim() }
      });

      if (error) throw error;

      if (data?.logoUrl) {
        setFormData(prev => ({ 
          ...prev, 
          brandLogoUrl: data.logoUrl,
          brandColor: getBrandColor(brandName)
        }));
        toast.success('Brand logo found!');
      } else {
        toast.info('No logo found for this brand');
        setFormData(prev => ({ 
          ...prev, 
          brandColor: getBrandColor(brandName)
        }));
      }
    } catch (error) {
      console.error('Error searching brand logo:', error);
      toast.error('Failed to search brand logo');
      // Still set brand color even if logo search fails
      setFormData(prev => ({ 
        ...prev, 
        brandColor: getBrandColor(brandName)
      }));
    } finally {
      setLogoSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('gift_cards')
        .insert({
          user_id: user.id,
          offer_name: formData.offerName,
          brand_name: formData.brandName,
          sector: formData.sector,
          redeem_number: formData.redeemNumber || null,
          perks: formData.perks || null,
          description: formData.description || null,
          value: formData.value ? parseFloat(formData.value) : 0,
          expires_at: formData.expiresAt || null,
          brand_logo_url: formData.brandLogoUrl || null,
          brand_color: formData.brandColor
        });

      if (error) throw error;

      toast.success('Gift card added successfully!');
      onCardAdded();
      
      // Reset form
      setFormData({
        offerName: '',
        brandName: '',
        sector: '',
        redeemNumber: '',
        perks: '',
        description: '',
        value: '',
        expiresAt: '',
        brandLogoUrl: '',
        brandColor: '#8B5CF6'
      });
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error('Failed to add gift card');
    } finally {
      setLoading(false);
    }
  };

  const previewCard = {
    id: 'preview',
    offerName: formData.offerName || 'Rewards • Perks',
    brandName: formData.brandName || 'Brand Name',
    sector: formData.sector || 'Category',
    redeemNumber: formData.redeemNumber,
    perks: formData.perks || 'Add perks and benefits here...',
    description: formData.description,
    brandLogoUrl: formData.brandLogoUrl,
    brandColor: formData.brandColor,
    value: formData.value ? parseFloat(formData.value) : 0,
    isFavorite: false,
    expiresAt: formData.expiresAt,
    onToggleFavorite: () => {},
    isSample: true
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Gift Card</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details of your gift card or coupon
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offerName">Offer Name *</Label>
                  <Input
                    id="offerName"
                    value={formData.offerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, offerName: e.target.value }))}
                    placeholder="e.g., Rewards • Perks"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="brandName"
                      value={formData.brandName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({ ...prev, brandName: value, brandColor: getBrandColor(value) }));
                      }}
                      placeholder="e.g., Starbucks"
                      required
                      className="bg-input border-border flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => searchBrandLogo(formData.brandName)}
                      disabled={!formData.brandName.trim() || logoSearching}
                      className="border-border"
                    >
                      {logoSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector *</Label>
                  <Select
                    value={formData.sector}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}
                    required
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select a sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value (₹)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="redeemNumber">Redeem Number (Optional)</Label>
                  <Input
                    id="redeemNumber"
                    value={formData.redeemNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, redeemNumber: e.target.value }))}
                    placeholder="Enter redeem code"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="perks">Perks</Label>
                <Textarea
                  id="perks"
                  value={formData.perks}
                  onChange={(e) => setFormData(prev => ({ ...prev, perks: e.target.value }))}
                  placeholder="e.g., Free latte with the next Summer special drink"
                  className="bg-input border-border"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about the card..."
                  className="bg-input border-border"
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-border"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Card'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Live Preview</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="border-border"
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
            
            {showPreview && (
              <div className="flex justify-center">
                <div className="w-64">
                  <GiftCard {...previewCard} />
                </div>
              </div>
            )}
            
            {!showPreview && (
              <div className="h-64 bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click "Show Preview" to see your card</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};