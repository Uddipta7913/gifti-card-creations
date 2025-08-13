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
import { Loader2, Search } from 'lucide-react';

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
    'starbucks': 'hsl(155, 59%, 27%)',
    'spotify': 'hsl(141, 73%, 42%)',
    'nike': 'hsl(0, 0%, 0%)',
    'mcdonalds': 'hsl(51, 100%, 50%)',
    'mcdonald': 'hsl(51, 100%, 50%)',
    'h&m': 'hsl(0, 84%, 60%)',
    'gap': 'hsl(219, 100%, 66%)',
    'american eagle': 'hsl(219, 100%, 66%)',
    'amazon': 'hsl(37, 100%, 50%)',
    'apple': 'hsl(0, 0%, 0%)',
    'google': 'hsl(214, 89%, 52%)',
    'microsoft': 'hsl(214, 89%, 52%)',
    'walmart': 'hsl(214, 89%, 52%)',
    'target': 'hsl(0, 84%, 60%)',
    'zara': 'hsl(0, 0%, 0%)',
    'adidas': 'hsl(0, 0%, 0%)',
    'puma': 'hsl(0, 0%, 0%)',
    'uber': 'hsl(0, 0%, 0%)',
    'netflix': 'hsl(0, 84%, 60%)',
    'youtube': 'hsl(0, 84%, 60%)',
    'facebook': 'hsl(214, 89%, 52%)',
    'instagram': 'hsl(320, 100%, 50%)',
    'twitter': 'hsl(203, 89%, 53%)',
    'linkedin': 'hsl(214, 89%, 52%)',
    'samsung': 'hsl(214, 89%, 52%)',
    'sony': 'hsl(0, 0%, 0%)',
    'pepsi': 'hsl(214, 89%, 52%)',
    'coca cola': 'hsl(0, 84%, 60%)',
    'dominos': 'hsl(214, 89%, 52%)',
    'pizza hut': 'hsl(0, 84%, 60%)',
    'kfc': 'hsl(0, 84%, 60%)',
    'burger king': 'hsl(37, 100%, 50%)',
    'subway': 'hsl(60, 100%, 25%)',
    'dunkin': 'hsl(24, 100%, 50%)',
    'taco bell': 'hsl(268, 83%, 58%)',
  };

  for (const [key, color] of Object.entries(colorMap)) {
    if (brand.includes(key)) {
      return color;
    }
  }
  
  // Default gradient color
  return 'hsl(268, 83%, 58%)';
};

export const AddCardDialog = ({ open, onOpenChange, onCardAdded }: AddCardDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoSearching, setLogoSearching] = useState(false);
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
    brandColor: 'hsl(268, 83%, 58%)'
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
        brandColor: 'hsl(268, 83%, 58%)'
      });
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error('Failed to add gift card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Gift Card</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details of your gift card or coupon
          </DialogDescription>
        </DialogHeader>

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
                  onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
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
      </DialogContent>
    </Dialog>
  );
};