import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  CreditCard, 
  Clock, 
  Heart, 
  Calendar,
  PieChart,
  BarChart3,
  Activity,
  CheckCircle,
  History
} from 'lucide-react';

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

const Analytics = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<GiftCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCards(data || []);
    } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
    }
  };

    fetchCards();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view analytics</h1>
        </div>
      </div>
    );
  }

  // Analytics calculations
  const totalCards = cards.length;
  const totalValue = cards.reduce((sum, card) => sum + card.value, 0);
  const averageValue = totalCards > 0 ? totalValue / totalCards : 0;
  
  const expiringSoon = cards.filter(card => {
    if (!card.expires_at) return false;
    const expiryDate = new Date(card.expires_at);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return expiryDate <= sevenDaysFromNow;
  }).length;
  
  const favoriteCards = cards.filter(card => card.is_favorite).length;
  const usedCards = cards.filter(card => card.is_used).length;
  
  const sectorBreakdown = cards.reduce((acc, card) => {
    acc[card.sector] = (acc[card.sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topBrand = cards.length > 0 ? 
    cards.reduce((prev, current) => 
      (prev.value > current.value) ? prev : current
    ).brand_name : 'No data';

  const monthlyBreakdown = cards.reduce((acc, card) => {
    const date = new Date(card.created_at);
    const month = date.toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const valueBySector = cards.reduce((acc, card) => {
    acc[card.sector] = (acc[card.sector] || 0) + card.value;
    return acc;
  }, {} as Record<string, number>);

  const recentCards = cards.slice(0, 5);
  const usedCardsHistory = cards.filter(card => card.is_used).slice(0, 5);

  // Pie chart colors
  const pieColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#F43F5E', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Insights and statistics about your gift card collection
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {totalCards} cards • ₹{totalValue.toLocaleString('en-IN')} total value
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{totalCards}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-green-500">₹</span>
                <span className="text-3xl font-bold">{totalValue.toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span className="text-3xl font-bold">₹{averageValue.toFixed(0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-3xl font-bold">{expiringSoon}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Used Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-3xl font-bold">{usedCards}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sector Distribution with Pie Chart */}
          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-blue-500" />
                <span>Cards by Sector</span>
              </CardTitle>
              <CardDescription>Distribution of your cards across different sectors</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(sectorBreakdown).length > 0 ? (
                <div className="space-y-6">
                  {/* Pie Chart Visualization */}
                  <div className="flex justify-center">
                    <div className="relative w-40 h-40">
                      {(() => {
                        const sortedSectors = Object.entries(sectorBreakdown)
                          .sort(([,a], [,b]) => b - a);
                        
                        let currentAngle = 0;
                        
                        return sortedSectors.map(([sector, count], index) => {
                          const percentage = (count / totalCards) * 100;
                          const color = pieColors[index % pieColors.length];
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + (percentage / 100) * 360;
                          
                          // Update current angle for next slice
                          currentAngle = endAngle;
                          
                          // Calculate the clip path for this slice
                          const startX = 50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180);
                          const startY = 50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180);
                          const endX = 50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180);
                          const endY = 50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180);
                          
                          // Determine if we need to draw the large arc
                          const largeArcFlag = percentage > 50 ? 1 : 0;
                          
                          return (
                            <svg
                              key={sector}
                              className="absolute inset-0 w-full h-full"
                              viewBox="0 0 100 100"
                            >
                              <path
                                d={`M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                                fill={color}
                                className="transition-all duration-500 hover:opacity-80"
                              />
                            </svg>
                          );
                        });
                      })()}
                      
                      {/* Center circle for better visual appeal */}
                      <div className="absolute inset-0 m-8 rounded-full bg-card border-2 border-border flex items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">Total</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground text-center">Sector Breakdown</h4>
                    {Object.entries(sectorBreakdown)
                      .sort(([,a], [,b]) => b - a)
                      .map(([sector, count], index) => {
                        const percentage = ((count / totalCards) * 100).toFixed(1);
                        const color = pieColors[index % pieColors.length];

  return (
                          <div key={sector} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div 
                              className="w-4 h-4 rounded-full shadow-sm" 
                              style={{ backgroundColor: color }}
                            />
                            <span className="flex-1 text-sm capitalize font-medium">{sector}</span>
                            <span className="text-sm font-bold text-foreground">{count}</span>
                            <span className="text-xs text-muted-foreground">({percentage}%)</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No cards yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Add some gift cards to see sector distribution</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Value by Sector */}
              <Card className="bg-card border-border">
                <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Value by Sector</span>
              </CardTitle>
              <CardDescription>Total value distribution across sectors</CardDescription>
                </CardHeader>
                <CardContent>
              {Object.keys(valueBySector).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(valueBySector)
                    .sort(([,a], [,b]) => b - a)
                    .map(([sector, value]) => {
                      const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0';
                      return (
                        <div key={sector} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="capitalize font-medium">{sector}</span>
                            <span className="font-medium">₹{value.toLocaleString('en-IN')} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No value data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Favorites</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <span className="text-4xl font-bold text-red-500">{favoriteCards}</span>
              <p className="text-muted-foreground text-sm mt-1">favorite cards</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <span>Top Brand</span>
              </CardTitle>
                </CardHeader>
            <CardContent className="text-center">
              <span className="text-2xl font-bold text-blue-500">{topBrand}</span>
              <p className="text-muted-foreground text-sm mt-1">highest value</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <span>Monthly Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-16">
                {Object.keys(monthlyBreakdown).length > 0 ? (
                  <div className="text-center">
                    <span className="text-2xl font-bold text-orange-500">
                      {Math.max(...Object.values(monthlyBreakdown))}
                    </span>
                    <p className="text-muted-foreground text-sm">cards this month</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No activity yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Used Cards History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your most recently added gift cards</CardDescription>
                </CardHeader>
                <CardContent>
              {recentCards.length > 0 ? (
                <div className="space-y-3">
                  {recentCards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: card.brand_color }}
                        >
                          {card.brand_logo_url ? (
                            <img src={card.brand_logo_url} alt={card.brand_name} className="w-5 h-5 object-contain" />
                          ) : (
                            <span className="text-white text-xs font-bold">{card.brand_name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{card.brand_name}</p>
                          <p className="text-sm text-muted-foreground">{card.offer_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{card.value.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(card.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No cards added yet</p>
              )}
                </CardContent>
              </Card>
              
          {/* Used Cards History */}
              <Card className="bg-card border-border">
                <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5 text-green-600" />
                <span>Used Cards History</span>
              </CardTitle>
              <CardDescription>Recently used gift cards</CardDescription>
                </CardHeader>
                <CardContent>
              {usedCardsHistory.length > 0 ? (
                <div className="space-y-3">
                  {usedCardsHistory.map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: card.brand_color }}
                        >
                          {card.brand_logo_url ? (
                            <img src={card.brand_logo_url} alt={card.brand_name} className="w-5 h-5 object-contain" />
                          ) : (
                            <span className="text-white text-xs font-bold">{card.brand_name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{card.brand_name}</p>
                          <p className="text-sm text-muted-foreground">{card.offer_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{card.value.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground">
                          {card.used_at ? new Date(card.used_at).toLocaleDateString() : 'Recently used'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No used cards yet</p>
              )}
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
  );
};

export default Analytics;