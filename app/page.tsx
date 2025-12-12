'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Proper Bitcoin Logo Component (₿)
const BitcoinLogo = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`${className} flex items-center justify-center font-bold`} style={{ fontFamily: 'serif', ...style }}>
    ₿
  </div>
);

// Mountain Icon Component
const MountainIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 6l-3.75 5 2.25 3h4.5L19 11l-5-5zm-4.5 9L12 12l-2.25-3L8 11l1.5 4z"/>
  </svg>
);

// Chart timeframe options (constant outside component to prevent re-creation)
const CHART_TIMEFRAMES = [
  { label: '1D', value: '1D', days: 1 },
  { label: '7D', value: '7D', days: 7 },
  { label: '30D', value: '30D', days: 30 },
  { label: '90D', value: '90D', days: 90 },
  { label: '1Y', value: '1Y', days: 365 }
];

// Bitcoin Chart Widget Component
const BitcoinChartWidget = () => {
  const [timeframe, setTimeframe] = useState('7D');
  const [chartData, setChartData] = useState<{price: number, timestamp: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const selectedTimeframe = CHART_TIMEFRAMES.find(t => t.value === timeframe);
        const days = selectedTimeframe?.days || 7;
        
        // Use CoinGecko's free API for historical data
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=${days === 1 ? 'hourly' : 'daily'}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }
        
        const data = await response.json();
        const formattedData = data.prices.map(([timestamp, price]: [number, number]) => ({
          timestamp,
          price
        }));
        
        setChartData(formattedData);
        setError(null);
      } catch {
        setError('Failed to load chart data');
        // Fallback mock data for demo
        const mockData = Array.from({ length: 20 }, (_, i) => ({
          timestamp: Date.now() - (19 - i) * 24 * 60 * 60 * 1000,
          price: 70000 + Math.random() * 10000 - 5000
        }));
        setChartData(mockData);
      }
      setLoading(false);
    };

    fetchChartData();
  }, [timeframe]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeframe === '1D') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateChange = () => {
    if (chartData.length < 2) return { amount: 0, percentage: 0 };
    const first = chartData[0].price;
    const last = chartData[chartData.length - 1].price;
    const amount = last - first;
    const percentage = (amount / first) * 100;
    return { amount, percentage };
  };

  const change = calculateChange();
  const isPositive = change.amount >= 0;

  // Create SVG path for the chart
  const createPath = () => {
    if (chartData.length === 0) return '';
    
    const width = 400;
    const height = 120;
    const padding = 10;
    
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    
    const points = chartData.map((point, index) => {
      const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' L ');
    
    return `M ${points}`;
  };

  const createGradient = () => {
    if (chartData.length === 0) return '';
    
    const width = 400;
    const height = 120;
    const padding = 10;
    
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    
    const points = chartData.map((point, index) => {
      const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' L ');
    
    return `M ${points} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;
  };

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-6 hover:shadow-bitcoin transition-all duration-300 hover:scale-105 transition-theme">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">📈</div>
          <div>
            <h3 className="text-lg font-bold text-card-foreground">Bitcoin Chart</h3>
            <p className="text-sm text-muted-foreground">Historical price data</p>
          </div>
        </div>
        {!loading && (
          <div className="text-right">
            <div className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{formatPrice(change.amount)}
            </div>
            <div className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{change.percentage.toFixed(2)}%
            </div>
          </div>
        )}
      </div>

      {/* Timeframe Selector */}
      <div className="flex flex-wrap gap-1 mb-4">
        {CHART_TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              timeframe === tf.value
                ? 'bg-primary text-primary-foreground scale-105'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="relative h-32 mb-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground text-center">
              <div className="mb-2">Failed to load chart</div>
              <button 
                onClick={() => window.location.reload()}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <svg 
              viewBox="0 0 400 120" 
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(247, 147, 26, 0.2))' }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'var(--btc-orange)', stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: 'var(--btc-orange)', stopOpacity: 0.05 }} />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'var(--btc-orange)', stopOpacity: 0.8 }} />
                  <stop offset="50%" style={{ stopColor: 'var(--btc-orange)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'var(--btc-orange)', stopOpacity: 0.8 }} />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              <defs>
                <pattern id="chartGrid" patternUnits="userSpaceOnUse" width="40" height="24">
                  <rect width="40" height="24" fill="none" stroke="var(--grid-color)" strokeWidth="0.5" opacity="0.1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#chartGrid)"/>
              
              {/* Area under curve */}
              <path
                d={createGradient()}
                fill="url(#chartGradient)"
                className="animate-pulse"
                style={{ animationDuration: '3s' }}
              />
              
              {/* Main chart line */}
              <path
                d={createPath()}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
                style={{ 
                  strokeDasharray: '2000',
                  strokeDashoffset: '2000',
                  animation: 'drawLine 2s ease-out forwards, pulse 3s ease-in-out infinite 2s'
                }}
              />
              
              {/* Data points */}
              {chartData.map((point, index) => {
                if (index % Math.max(1, Math.floor(chartData.length / 8)) !== 0) return null;
                
                const width = 400;
                const height = 120;
                const padding = 10;
                const prices = chartData.map(d => d.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                const priceRange = maxPrice - minPrice || 1;
                
                const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding);
                const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding);
                
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="var(--btc-orange)"
                    className="animate-pulse"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <title>{formatDate(point.timestamp)}: {formatPrice(point.price)}</title>
                  </circle>
                );
              })}
            </svg>
            
            {/* Floating Bitcoin symbols */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float opacity-20"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${10 + i * 20}%`,
                    animationDelay: `${i * 2}s`,
                    animationDuration: `${6 + i}s`
                  }}
                >
                  <BitcoinLogo className="text-primary text-lg" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price Range */}
      {!loading && !error && chartData.length > 0 && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <div>
            <span>Low: </span>
            <span className="font-semibold">{formatPrice(Math.min(...chartData.map(d => d.price)))}</span>
          </div>
          <div>
            <span>High: </span>
            <span className="font-semibold">{formatPrice(Math.max(...chartData.map(d => d.price)))}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Real-time Bitcoin Price Widget Component
const BitcoinPriceWidget = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [displayMode, setDisplayMode] = useState<'usd' | 'reno' | 'truckee'>('usd');
  const [error, setError] = useState<string | null>(null);

  // Home price data
  const homeData = {
    reno: { price: 607500, location: 'Reno' },
    truckee: { price: 1140000, location: 'Truckee' }
  };

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('https://blockchain.info/ticker');
        const data = await response.json();
        setPrice(data.USD.last);
        setError(null);
      } catch {
        setError('Failed to fetch price');
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatValue = () => {
    if (!price) return 'Loading...';
    
    switch (displayMode) {
      case 'usd':
        return `$${price.toLocaleString()}`;
      case 'reno':
        const renoRatio = price / homeData.reno.price;
        return `${renoRatio.toFixed(4)} Homes`;
      case 'truckee':
        const truckeeRatio = price / homeData.truckee.price;
        return `${truckeeRatio.toFixed(4)} Homes`;
      default:
        return `$${price.toLocaleString()}`;
    }
  };

  const getDisplayLabel = () => {
    switch (displayMode) {
      case 'usd':
        return 'BTC/USD';
      case 'reno':
        return 'BTC/HOME (Reno)';
      case 'truckee':
        return 'BTC/HOME (Truckee)';
      default:
        return 'BTC/USD';
    }
  };

  const getSubLabel = () => {
    switch (displayMode) {
      case 'reno':
        return `Median: $${homeData.reno.price.toLocaleString()}`;
      case 'truckee':
        return `Median: $${homeData.truckee.price.toLocaleString()}`;
      default:
        return 'Live Price';
    }
  };

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-6 hover:shadow-bitcoin transition-all duration-300 hover:scale-105 transition-theme">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BitcoinLogo className="text-primary text-2xl" />
          <span className="font-semibold text-card-foreground">Live Bitcoin</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setDisplayMode('usd')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              displayMode === 'usd' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            BTC/USD
          </button>
          <button
            onClick={() => setDisplayMode('reno')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              displayMode === 'reno' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            BTC/Reno
          </button>
          <button
            onClick={() => setDisplayMode('truckee')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              displayMode === 'truckee' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            BTC/Truckee
          </button>
        </div>

        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">{getDisplayLabel()}</div>
          <div className="text-2xl font-bold text-card-foreground mb-1">
            {error ? 'Error' : formatValue()}
          </div>
          <div className="text-xs text-muted-foreground">{getSubLabel()}</div>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-center">
          <button 
            onClick={() => window.location.reload()} 
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

// Ikon Pass "What If" Calculator Component
const IkonPassCalculator = () => {
  const [selectedYear, setSelectedYear] = useState('2018');
  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  // Historical Ikon Pass prices
  const ikonPrices = {
    '2018': 999,
    '2019': 999,
    '2020': 1049,
    '2021': 1149,
    '2022': 1169,
    '2023': 1159,
    '2024': 1429
  };

  // Bitcoin prices on roughly Nov 1st each year (when Ikon passes typically go on sale)
  const btcHistoricalPrices = {
    '2018': 6347,
    '2019': 9150,
    '2020': 13780,
    '2021': 61350,
    '2022': 20550,
    '2023': 34500,
    '2024': 69500
  };

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const response = await fetch('https://blockchain.info/ticker');
        const data = await response.json();
        setBtcPrice(data.USD.last);
      } catch {
        setBtcPrice(70000); // Fallback price
      }
    };

    fetchCurrentPrice();
  }, []);

  const calculateWhatIf = () => {
    const passPrice = ikonPrices[selectedYear as keyof typeof ikonPrices];
    const historicalBtcPrice = btcHistoricalPrices[selectedYear as keyof typeof btcHistoricalPrices];
    const currentBtcPrice = btcPrice || 70000;

    const btcAmount = passPrice / historicalBtcPrice;
    const currentValue = btcAmount * currentBtcPrice;
    const gainLoss = currentValue - passPrice;
    const gainLossPercent = ((currentValue - passPrice) / passPrice) * 100;

    return {
      passPrice,
      btcAmount,
      currentValue,
      gainLoss,
      gainLossPercent,
      historicalBtcPrice
    };
  };

  const results = calculateWhatIf();

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-6 hover:shadow-bitcoin transition-all duration-300 hover:scale-105 transition-theme">
      <div className="flex items-center space-x-2 mb-6">
        <div className="text-2xl">🎿</div>
        <div>
          <h3 className="text-lg font-bold text-card-foreground">Ikon Pass vs Bitcoin</h3>
          <p className="text-sm text-muted-foreground">What if you bought Bitcoin instead?</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Select Ikon Pass Year:
          </label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full p-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-theme"
          >
            {Object.entries(ikonPrices).map(([year, price]) => (
              <option key={year} value={year}>
                {year}-{parseInt(year) + 1} Season - ${price}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ikon Pass Price:</span>
            <span className="font-semibold text-card-foreground">${results.passPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">BTC Price Then:</span>
            <span className="font-semibold text-card-foreground">${results.historicalBtcPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bitcoin Amount:</span>
            <span className="font-semibold text-card-foreground">{results.btcAmount.toFixed(6)} BTC</span>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Value Today:</span>
              <span className="font-bold text-xl text-primary">${results.currentValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Gain/Loss:</span>
              <span className={`font-bold ${results.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {results.gainLoss >= 0 ? '+' : ''}${results.gainLoss.toLocaleString(undefined, {maximumFractionDigits: 0})} 
                ({results.gainLossPercent >= 0 ? '+' : ''}{results.gainLossPercent.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Historical data approximate. Past performance doesn&apos;t guarantee future results.
        </div>
      </div>
    </div>
  );
};



// Theme Toggle Component
const ThemeToggle = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Set initial theme to dark
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-card border border-border hover:bg-muted transition-all duration-300 hover:scale-110"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};

// Futuristic Blockchain Grid Background
const BlockchainGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Primary Grid Pattern */}
    <div className="absolute inset-0" style={{ opacity: 'var(--grid-opacity)' }}>
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern id="blockchainGrid" patternUnits="userSpaceOnUse" width="80" height="80">
            <rect width="80" height="80" fill="none" stroke="var(--grid-color)" strokeWidth="1"/>
            <circle cx="40" cy="40" r="3" fill="var(--grid-color)" className="animate-pulse" />
            <line x1="40" y1="0" x2="40" y2="20" stroke="var(--grid-color)" strokeWidth="2"/>
            <line x1="40" y1="60" x2="40" y2="80" stroke="var(--grid-color)" strokeWidth="2"/>
            <line x1="0" y1="40" x2="20" y2="40" stroke="var(--grid-color)" strokeWidth="2"/>
            <line x1="60" y1="40" x2="80" y2="40" stroke="var(--grid-color)" strokeWidth="2"/>
          </pattern>
          <pattern id="blockchainGridLarge" patternUnits="userSpaceOnUse" width="160" height="160">
            <rect width="160" height="160" fill="none" stroke="var(--grid-color)" strokeWidth="2" strokeDasharray="10,5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blockchainGrid)"/>
        <rect width="100%" height="100%" fill="url(#blockchainGridLarge)" opacity="0.3"/>
      </svg>
    </div>

    {/* Floating Bitcoin Nodes */}
    <div className="absolute inset-0 opacity-80">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            left: `${10 + (i % 4) * 25}%`,
            top: `${10 + Math.floor(i / 4) * 30}%`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${8 + (i % 3) * 2}s`
          }}
        >
          <div className="w-12 h-12 border-2 border-primary rounded-lg flex items-center justify-center bg-background/20 backdrop-blur-sm hover:scale-125 transition-transform duration-300">
            <BitcoinLogo className="text-lg text-primary" />
          </div>
        </div>
      ))}
    </div>

    {/* Connection Lines */}
    <div className="absolute inset-0 opacity-60">
      <svg width="100%" height="100%">
        <defs>
          <linearGradient id="connectionLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--grid-color)" stopOpacity="0.8"/>
            <stop offset="50%" stopColor="var(--grid-color)" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="var(--grid-color)" stopOpacity="0.8"/>
          </linearGradient>
        </defs>
        {[...Array(6)].map((_, i) => {
          const x1 = 10 + (i % 4) * 25;
          const y1 = 10 + Math.floor(i / 4) * 30;
          const x2 = 10 + ((i + 1) % 4) * 25;
          const y2 = 10 + Math.floor((i + 1) / 4) * 30;
          
          return (
            <line
              key={i}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="url(#connectionLine)"
              strokeWidth="2"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.8}s` }}
            />
          );
        })}
      </svg>
    </div>
  </div>
);

// Intersection Observer Hook for scroll animations
const useIntersectionObserver = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return [ref, isVisible] as const;
};

// Animated Section Wrapper
const AnimatedSection = ({ 
  children, 
  className = "", 
  animation = "fade-up",
  delay = 0 
}: { 
  children: React.ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-left" | "fade-right" | "scale-up";
  delay?: number;
}) => {
  const [ref, isVisible] = useIntersectionObserver(0.1);

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-out ${
        isVisible 
          ? animation === "fade-up" ? "opacity-100 translate-y-0" :
            animation === "fade-left" ? "opacity-100 translate-x-0" :
            animation === "fade-right" ? "opacity-100 translate-x-0" :
            "opacity-100 scale-100"
          : animation === "fade-up" ? "opacity-0 translate-y-8" :
            animation === "fade-left" ? "opacity-0 -translate-x-8" :
            animation === "fade-right" ? "opacity-0 translate-x-8" :
            "opacity-0 scale-95"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#services', label: 'Services' },
    { href: '#about', label: 'About' },
    { href: '#tools', label: 'Bitcoin Tools' },
    { href: '#resources', label: 'Resources' },
    { href: '#blog', label: 'Blog' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 group">
            <BitcoinLogo className="h-8 w-8 text-primary text-3xl group-hover:scale-110 transition-transform duration-300" />
            <div>
              <div className="font-bold text-xl lg:text-2xl text-foreground">
                <span className="text-accent">Tahoe</span> <span className="text-gradient-bitcoin">Bitcoin</span>
              </div>
              <div className="text-xs text-muted-foreground font-medium">Reno / Tahoe</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className="text-primary hover:text-primary/80 transition-all duration-300 font-semibold relative group text-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
            <ThemeToggle />
            <a
              href="#contact"
              className="bg-gradient-bitcoin text-primary-foreground px-6 py-2 rounded-full font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 shadow-bitcoin"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              className="text-foreground hover:scale-110 transition-transform duration-300"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background/95 backdrop-blur-md rounded-lg mt-2 shadow-lg">
              {navItems.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-primary hover:text-primary/80 transition-colors font-semibold animate-slide-in-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#contact"
                className="block px-3 py-2 bg-gradient-bitcoin text-primary-foreground rounded-full font-semibold text-center mt-4 animate-slide-in-left"
                style={{ animationDelay: '500ms' }}
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Hero Section Component
const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Image with Parallax */}
      <div className="absolute inset-0 z-0" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
        <Image
          src="/lake_tahoe.jpg"
          alt="Lake Tahoe"
          fill
          className="object-cover scale-110"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline with typing effect */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-6 text-white animate-fade-in-up">
            Bitcoin Consulting
          </h1>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gradient mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            In the Heart of the Sierra Nevada
          </h2>

          {/* Improved Value Proposition */}
          <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            Master Bitcoin fundamentals, self-custody, macro economics, and sound money principles from local experts. Understand why Bitcoin matters in a world of fiat currency debasement.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
            <a
              href="#contact"
              className="bg-gradient-bitcoin text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-bitcoin w-full sm:w-auto"
            >
              Book Consultation
            </a>
            <a
              href="#services"
              className="border-2 border-white text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              Our Services
            </a>
          </div>

          {/* Simple Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { icon: <BitcoinLogo className="h-8 w-8 text-primary text-3xl" />, title: "Bitcoin Only", subtitle: "No shitcoins" },
              { icon: <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, title: "Self-Custody", subtitle: "Your keys, your coins" },
              { icon: <MountainIcon className="h-8 w-8 text-accent" />, title: "Local Expert", subtitle: "Tahoe based" }
            ].map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${1200 + index * 200}ms` }}>
                <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30 hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="font-semibold text-white">{stat.title}</div>
                <div className="text-sm text-white/70">{stat.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

// Services Section Component
const ServicesSection = () => {
  const services = [
    {
      title: "Bitcoin Self-Custody",
      description: "Learn to secure your Bitcoin in cold storage with zero third-party risk.",
      icon: "🔐",
      category: "Security"
    },
    {
      title: "Multi-Signature Setup", 
      description: "Advanced security with collaborative custody and backup options.",
      icon: "🛡️",
      category: "Security"
    },
    {
      title: "Bitcoin Node Setup",
      description: "Run your own node and become part of the Bitcoin network.",
      icon: "🌐",
      category: "Technical"
    },
    {
      title: "DCA Strategy",
      description: "Set up automated dollar-cost averaging to build your stack.",
      icon: "📈",
      category: "Strategy"
    },
    {
      title: "UTXO Management",
      description: "Optimize your Bitcoin transactions and avoid high fees.",
      icon: "⚡",
      category: "Technical"
    },
    {
      title: "Seed Recovery",
      description: "Recover access to lost Bitcoin wallets safely and securely.",
      icon: "🔑",
      category: "Recovery"
    }
  ];

  return (
    <section id="services" className="py-20 lg:py-32 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden transition-theme">
      <BlockchainGrid />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            What We <span className="text-gradient">Teach</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, clear Bitcoin education and implementation
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <AnimatedSection 
              key={index} 
              delay={index * 150}
              animation="fade-up"
            >
              <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-8 hover:shadow-bitcoin hover:bg-card transition-all duration-500 hover:-translate-y-2 group transition-theme">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 text-center group-hover:animate-pulse">
                  {service.icon}
                </div>
                <div className="text-center">
                  <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full mb-4 group-hover:bg-accent/20 transition-colors duration-300">
                    {service.category}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-card-foreground group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

// Bitcoin Tools Section Component
const BitcoinToolsSection = () => (
  <section id="tools" className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-muted/20 relative overflow-hidden transition-theme">
    <BlockchainGrid />
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <AnimatedSection className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
          Bitcoin <span className="text-gradient">Tools</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Essential Bitcoin tools, education, and real-time market data
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <AnimatedSection animation="fade-right">
          <BitcoinPriceWidget />
        </AnimatedSection>
        
        <AnimatedSection animation="fade-left" delay={200}>
          <BitcoinChartWidget />
        </AnimatedSection>
        
        <AnimatedSection animation="fade-right" delay={400}>
          <IkonPassCalculator />
        </AnimatedSection>

        <AnimatedSection animation="fade-left" delay={600}>
          <BitcoinLearningWidget />
        </AnimatedSection>
      </div>

      <AnimatedSection className="text-center mt-12" delay={800}>
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-6 max-w-2xl mx-auto transition-theme">
          <h3 className="text-lg font-bold mb-3 text-card-foreground">💡 Pro Tip</h3>
          <p className="text-muted-foreground">
            Explore Bitcoin&apos;s price movements, compare to real assets, and access curated educational resources. 
            Ready to deepen your Bitcoin knowledge with personalized guidance? 
            <a href="#contact" className="text-primary hover:text-primary/80 transition-colors font-semibold ml-1">
              Schedule a consultation!
            </a>
          </p>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

// About Section Component  
const AboutSection = () => (
  <section id="about" className="py-20 lg:py-32 bg-gradient-to-br from-muted/20 via-background to-accent/5 relative overflow-hidden transition-theme">
    <BlockchainGrid />
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <AnimatedSection animation="fade-right">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            Why <span className="text-gradient">Tahoe Bitcoin</span>?
          </h2>
          
          <div className="space-y-6">
            {[
              {
                color: "accent",
                title: "Local Expertise",
                description: "Based in the Sierra Nevada, serving Reno / Tahoe with personalized, in-person Bitcoin consulting."
              },
              {
                color: "primary",
                title: "Bitcoin Only",
                description: "We focus exclusively on Bitcoin - no altcoins, no distractions, just sound money education."
              },
              {
                color: "secondary",
                title: "True Self-Custody",
                description: "Learn to hold your own keys with confidence. No third parties, no counterparty risk."
              }
            ].map((item, index) => (
              <AnimatedSection 
                key={index} 
                delay={index * 200}
                animation="fade-left"
              >
                <div className="flex items-start space-x-4 group">
                  <div className={`h-3 w-3 bg-${item.color} rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300`}></div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-left" delay={300}>
          <div className="relative group">
            <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-bitcoin hover:shadow-2xl transition-all duration-500 hover:scale-105 transition-theme">
              <Image
                src="/chandler.jpeg"
                alt="Chandler - Tahoe Bitcoin Expert"
                width={600}
                height={400}
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center space-x-4 mb-4">
                  <MountainIcon className="h-8 w-8 group-hover:animate-pulse" />
                  <BitcoinLogo className="h-8 w-8 text-2xl group-hover:animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Mountain High Security</h3>
                <p className="text-white/90 leading-relaxed">
                  Just like the granite peaks of the Sierra Nevada, your Bitcoin security should be rock solid. 
                  We teach you to build unbreakable defenses for your digital wealth.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  </section>
);

// Resources Section Component
const ResourcesSection = () => {
  const walletResources = [
    {
      name: "Electrum",
      description: "Lightweight Bitcoin wallet with advanced features",
      link: "https://electrum.org",
      icon: "⚡",
      category: "Desktop Wallet"
    },
    {
      name: "Sparrow Wallet",
      description: "Modern Bitcoin wallet focused on privacy and usability",
      link: "https://sparrowwallet.com",
      icon: "🦅",
      category: "Desktop Wallet"
    },
    {
      name: "Coldcard",
      description: "Air-gapped hardware wallet for maximum security",
      link: "https://coldcard.com",
      icon: "🧊",
      category: "Hardware Wallet"
    },
    {
      name: "Trezor",
      description: "User-friendly hardware wallet for beginners",
      link: "https://trezor.io",
      icon: "🔒",
      category: "Hardware Wallet"
    }
  ];

  const educationalResources = [
    {
      name: "Address Types Guide",
      description: "Understanding Legacy, SegWit, and Taproot addresses",
      link: "#",
      icon: "📍",
      category: "Education"
    },
    {
      name: "Seed Phrases Explained",
      description: "BIP39, entropy, and mnemonic security best practices",
      link: "#",
      icon: "🌱",
      category: "Education"
    },
    {
      name: "UTXO Management",
      description: "Coin control, consolidation, and privacy techniques",
      link: "#",
      icon: "🪙",
      category: "Education"
    },
    {
      name: "Len Sassaman Tribute",
      description: "The legendary ASCII art hidden in Bitcoin's blockchain",
      link: "#",
      icon: "🎨",
      category: "Culture"
    },
    {
      name: "Multi-Sig Explained",
      description: "2-of-3, 3-of-5 setups and collaborative custody",
      link: "#",
      icon: "🤝",
      category: "Education"
    },
    {
      name: "Dollar Debasement",
      description: "Why fiat currency loses value and Bitcoin preserves wealth",
      link: "#",
      icon: "📉",
      category: "Macro"
    }
  ];

  return (
    <section id="resources" className="py-20 lg:py-32 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden transition-theme">
      <BlockchainGrid />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Bitcoin <span className="text-gradient">Resources</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Curated tools and educational content for your Bitcoin journey
          </p>
        </AnimatedSection>

        {/* Wallet Recommendations */}
        <div className="mb-16">
          <AnimatedSection>
            <h3 className="text-2xl font-bold mb-8 text-center text-foreground">Recommended Wallets</h3>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {walletResources.map((wallet, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <a
                  href={wallet.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-6 hover:shadow-bitcoin hover:bg-card transition-all duration-500 hover:-translate-y-2 hover:scale-105 group block transition-theme"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 text-center group-hover:animate-bounce">
                    {wallet.icon}
                  </div>
                  <div className="text-center">
                    <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                      {wallet.category}
                    </div>
                    <h4 className="text-lg font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors duration-300">
                      {wallet.name}
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {wallet.description}
                    </p>
                  </div>
                </a>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Educational Resources */}
        <div>
          <AnimatedSection>
            <h3 className="text-2xl font-bold mb-8 text-center text-foreground">Educational Resources</h3>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {educationalResources.map((resource, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <a
                  href={resource.link}
                  className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-6 hover:shadow-bitcoin hover:bg-card transition-all duration-500 hover:-translate-y-2 hover:scale-105 group block transition-theme"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 text-center group-hover:animate-pulse">
                    {resource.icon}
                  </div>
                  <div className="text-center">
                    <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full mb-3 group-hover:bg-accent/20 transition-colors duration-300">
                      {resource.category}
                    </div>
                    <h4 className="text-lg font-bold mb-2 text-card-foreground group-hover:text-primary transition-colors duration-300">
                      {resource.name}
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {resource.description}
                    </p>
                  </div>
                </a>
              </AnimatedSection>
            ))}
          </div>
        </div>

        <AnimatedSection className="text-center mt-12" delay={600}>
          <a
            href="#contact"
            className="inline-flex items-center px-8 py-4 bg-gradient-bitcoin text-primary-foreground rounded-full font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-bitcoin"
          >
            Need Help Getting Started?
            <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
};

// Blog Section Component
const BlogSection = () => {
  const blogPosts = [
    {
      title: "Why Lake Tahoe is Perfect for Bitcoin",
      excerpt: "The parallels between the clarity of Lake Tahoe and the transparency of Bitcoin are striking. Both represent purity in their respective domains.",
      date: "December 15, 2024",
      readTime: "5 min read",
      category: "Philosophy",
      image: "🏔️"
    },
    {
      title: "Setting Up Your First Hardware Wallet",
      excerpt: "A beginner's guide to choosing and configuring a hardware wallet for maximum security. Step-by-step instructions included.",
      date: "December 10, 2024", 
      readTime: "8 min read",
      category: "Tutorial",
      image: "🔐"
    },
    {
      title: "Multi-Sig: Why 2-of-3 is Your Best Friend",
      excerpt: "Learn how multi-signature wallets provide the perfect balance between security and accessibility for your Bitcoin holdings.",
      date: "December 5, 2024",
      readTime: "6 min read", 
      category: "Security",
      image: "🛡️"
    }
  ];

  return (
    <section id="blog" className="py-20 lg:py-32 bg-gradient-to-br from-accent/5 via-background to-muted/20 relative overflow-hidden transition-theme">
      <BlockchainGrid />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Latest from the <span className="text-gradient">Summit</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bitcoin insights from the mountains
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <AnimatedSection key={index} delay={index * 150}>
              <article className="bg-card/95 backdrop-blur-sm border border-border rounded-xl overflow-hidden hover:shadow-bitcoin hover:bg-card transition-all duration-500 hover:-translate-y-2 hover:scale-105 group cursor-pointer transition-theme">
                <div className="p-8">
                  <div className="text-6xl mb-6 text-center group-hover:scale-110 transition-transform duration-300 group-hover:animate-bounce">
                    {post.image}
                  </div>
                  
                  <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full mb-4 group-hover:bg-accent/20 transition-colors duration-300">
                    {post.category}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-card-foreground group-hover:text-primary transition-colors duration-300">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="text-center mt-12" delay={500}>
          <a
            href="#contact"
            className="inline-flex items-center px-8 py-4 bg-gradient-tahoe text-accent-foreground rounded-full font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-bitcoin group"
          >
            Read All Posts
            <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
};

// Contact Section Component
const ContactSection = () => (
  <section id="contact" className="py-20 lg:py-32 bg-gradient-to-br from-muted/10 via-background to-primary/5 relative overflow-hidden transition-theme">
    <BlockchainGrid />
    
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <AnimatedSection>
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
          Ready to Start Your <span className="text-gradient">Bitcoin Journey</span>?
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Book a consultation and learn Bitcoin the right way
        </p>
      </AnimatedSection>

      <AnimatedSection delay={300}>
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl p-8 lg:p-12 shadow-bitcoin hover:shadow-2xl hover:scale-105 transition-all duration-500 transition-theme">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <AnimatedSection delay={500}>
              <div className="text-center group">
                <div className="h-16 w-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                  <MountainIcon className="h-8 w-8 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-accent transition-colors duration-300 text-card-foreground">Reno / Tahoe</h3>
                <p className="text-muted-foreground">Serving the Sierra Nevada region with local Bitcoin expertise</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={700}>
              <div className="text-center group">
                <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <BitcoinLogo className="h-8 w-8 text-3xl group-hover:animate-bounce" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-300 text-card-foreground">Bitcoin Only</h3>
                <p className="text-muted-foreground">Focused exclusively on Bitcoin education and security</p>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={900}>
            <a
              href="mailto:hello@tahoebitcoin.com"
              className="inline-flex items-center px-12 py-4 bg-gradient-sunset text-white rounded-full font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-bitcoin group"
            >
              Get Started Today
              <svg className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.324a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </AnimatedSection>
        </div>
      </AnimatedSection>
    </div>
  </section>
);

// Footer Component
const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground py-12 relative overflow-hidden transition-theme">
    <BlockchainGrid />
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AnimatedSection>
          <div className="group">
            <div className="flex items-center space-x-3 mb-4">
              <BitcoinLogo className="h-8 w-8 text-primary text-2xl group-hover:animate-pulse" />
              <div>
                <div className="font-bold text-xl">
                  <span className="text-accent">Tahoe</span> <span className="text-primary">Bitcoin</span>
                </div>
                <div className="text-xs text-secondary-foreground/60">Reno / Tahoe</div>
              </div>
            </div>
            <p className="text-secondary-foreground/80">
              Bitcoin consulting in the heart of the Sierra Nevada
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-secondary-foreground/80 text-sm">
              <li className="hover:text-primary transition-colors duration-300">Self-Custody Setup</li>
              <li className="hover:text-primary transition-colors duration-300">Multi-Sig Security</li>
              <li className="hover:text-primary transition-colors duration-300">Node Configuration</li>
              <li className="hover:text-primary transition-colors duration-300">DCA Strategy</li>
            </ul>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={400}>
          <div>
            <h4 className="font-semibold mb-4">Location</h4>
            <ul className="space-y-2 text-secondary-foreground/80 text-sm">
              <li className="hover:text-accent transition-colors duration-300">Reno / Tahoe</li>
              <li className="hover:text-accent transition-colors duration-300">Reno, Nevada</li>
              <li className="hover:text-accent transition-colors duration-300">Sierra Nevada Region</li>
            </ul>
          </div>
        </AnimatedSection>
      </div>

      <AnimatedSection delay={600}>
        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-secondary-foreground/60">
          <p>&copy; 2024 Tahoe Bitcoin. All rights reserved.</p>
        </div>
      </AnimatedSection>
    </div>
  </footer>
);

// Bitcoin Learning Center Widget - Actually Useful for Visitors
const BitcoinLearningWidget = () => {
  const [activeSection, setActiveSection] = useState('wallets');
  
  const sections = [
    { id: 'wallets', label: 'Wallets', icon: '🔐', desc: 'Secure Bitcoin Storage' },
    { id: 'learn', label: 'Learn', icon: '📚', desc: 'Bitcoin Fundamentals' },
    { id: 'tools', label: 'Tools', icon: '🛠️', desc: 'Practical Resources' }
  ];

  const wallets = [
    {
      name: 'Electrum',
      type: 'Desktop/Mobile',
      security: '⭐⭐⭐⭐⭐',
      difficulty: 'Intermediate',
      description: 'Lightweight, fast, and secure desktop wallet',
      link: 'https://electrum.org/',
      features: ['Hardware wallet support', 'Multi-sig', 'Lightning Network']
    },
    {
      name: 'Sparrow Wallet',
      type: 'Desktop',
      security: '⭐⭐⭐⭐⭐',
      difficulty: 'Advanced',
      description: 'Feature-rich desktop wallet for power users',
      link: 'https://sparrowwallet.com/',
      features: ['UTXO management', 'Hardware wallet support', 'Privacy features']
    },
    {
      name: 'Blue Wallet',
      type: 'Mobile',
      security: '⭐⭐⭐⭐',
      difficulty: 'Beginner',
      description: 'User-friendly mobile wallet with Lightning',
      link: 'https://bluewallet.io/',
      features: ['Lightning Network', 'Watch-only wallets', 'Simple interface']
    },
    {
      name: 'Coldcard',
      type: 'Hardware',
      security: '⭐⭐⭐⭐⭐',
      difficulty: 'Advanced',
      description: 'Air-gapped hardware wallet for maximum security',
      link: 'https://coldcard.com/',
      features: ['Air-gapped signing', 'Dice entropy', 'Multi-sig ready']
    }
  ];

  const learningTopics = [
    {
      title: 'What is Bitcoin?',
      description: 'Understand the basics of digital money and why Bitcoin matters',
      level: 'Beginner',
      time: '15 min read'
    },
    {
      title: 'Private Keys & Seed Phrases',
      description: 'Learn how Bitcoin ownership actually works',
      level: 'Beginner',
      time: '10 min read'
    },
    {
      title: 'Address Types',
      description: 'Legacy, SegWit, Taproot - understanding Bitcoin addresses',
      level: 'Intermediate',
      time: '20 min read'
    },
    {
      title: 'Multi-Signature Security',
      description: 'Advanced security using multiple keys',
      level: 'Advanced',
      time: '25 min read'
    },
    {
      title: 'Dollar Debasement',
      description: 'Why fiat money loses value and Bitcoin preserves it',
      level: 'Beginner',
      time: '12 min read'
    },
    {
      title: 'Lightning Network',
      description: 'Fast, cheap Bitcoin payments',
      level: 'Intermediate',
      time: '18 min read'
    }
  ];

  const tools = [
    {
      name: 'Mempool.space',
      description: 'Bitcoin network explorer and fee estimator',
      link: 'https://mempool.space/',
      category: 'Network Info'
    },
    {
      name: 'Bitcoin Block Explorer',
      description: 'Track transactions and addresses',
      link: 'https://blockstream.info/',
      category: 'Blockchain Explorer'
    },
    {
      name: 'Clark Moody Dashboard',
      description: 'Real-time Bitcoin market data and metrics',
      link: 'https://bitcoin.clarkmoody.com/dashboard/',
      category: 'Market Data'
    },
    {
      name: 'Bisq Network',
      description: 'Decentralized Bitcoin exchange',
      link: 'https://bisq.network/',
      category: 'Trading'
    },
    {
      name: 'Bitcoin Core',
      description: 'Run your own Bitcoin node',
      link: 'https://bitcoincore.org/',
      category: 'Node Software'
    },
    {
      name: 'Casa Node',
      description: 'Plug-and-play Bitcoin node',
      link: 'https://casa.io/',
      category: 'Node Hardware'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'wallets':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Choose the right wallet for your needs. Remember: &ldquo;Not your keys, not your Bitcoin!&rdquo;
            </p>
            {wallets.map((wallet, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-card-foreground">{wallet.name}</h4>
                    <p className="text-xs text-muted-foreground">{wallet.type} • {wallet.difficulty}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Security</div>
                    <div className="text-sm">{wallet.security}</div>
                  </div>
                </div>
                <p className="text-sm text-card-foreground mb-3">{wallet.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {wallet.features.map((feature, idx) => (
                    <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
                <a
                  href={wallet.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Learn More →
                </a>
              </div>
            ))}
          </div>
        );

      case 'learn':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Build your Bitcoin knowledge with these essential topics.
            </p>
            {learningTopics.map((topic, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-card-foreground">{topic.title}</h4>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{topic.level}</div>
                    <div className="text-xs text-primary">{topic.time}</div>
                  </div>
                </div>
                <p className="text-sm text-card-foreground mb-3">{topic.description}</p>
                <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Start Learning →
                </button>
              </div>
            ))}
          </div>
        );

      case 'tools':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Essential tools for Bitcoin users and enthusiasts.
            </p>
            {tools.map((tool, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-card-foreground">{tool.name}</h4>
                    <p className="text-xs text-primary">{tool.category}</p>
                  </div>
                </div>
                <p className="text-sm text-card-foreground mb-3">{tool.description}</p>
                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Visit Tool →
                </a>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-6 hover:shadow-bitcoin transition-all duration-300 hover:scale-105 transition-theme">
      <div className="flex items-center space-x-2 mb-6">
        <div className="text-2xl">🎓</div>
        <div>
          <h3 className="text-lg font-bold text-card-foreground">Bitcoin Learning Center</h3>
          <p className="text-sm text-muted-foreground">Essential resources for your Bitcoin journey</p>
        </div>
      </div>

      {/* Section Selection */}
      <div className="grid grid-cols-1 gap-2 mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`p-3 rounded-lg text-left transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-primary text-primary-foreground scale-105'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{section.icon}</span>
              <div>
                <div className="font-semibold">{section.label}</div>
                <div className="text-xs opacity-80">{section.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="min-h-[400px] max-h-[500px] overflow-y-auto">
        {renderContent()}
      </div>

      <div className="mt-6 text-center">
        <div className="text-xs text-muted-foreground mb-2">
          Need personalized guidance?
        </div>
        <a
          href="#contact"
          className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-semibold"
        >
          Schedule a Bitcoin Consultation →
        </a>
      </div>
    </div>
  );
};

// Main Page Component
export default function Home() {
  return (
    <main className="min-h-screen transition-theme">
      <Navigation />
      <HeroSection />
      <ServicesSection />
      <BitcoinToolsSection />
      <AboutSection />
      <ResourcesSection />
      <BlogSection />
      <ContactSection />
      <Footer />
      <style jsx global>{`
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </main>
  );
}
