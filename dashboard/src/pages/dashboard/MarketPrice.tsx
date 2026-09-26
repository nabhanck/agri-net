import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Store,
  MapPin,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  TrendingDown,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFarm } from '../../context/FarmContext';
import { getMarketPrices, type MarketPriceRecord, type MarketPriceResponse } from './api';
import { CropIcon } from '@/utils/helpers';

const POPULAR_COMMODITIES = [
  'Rice',
  'Wheat',
  'Tomato',
  'Potato',
  'Onion',
  'Maize',
  'Cotton',
  'Soyabean',
  'Mustard',
  'Banana',
];

const MAJOR_STATES = [
  'All',
  'Kerala',
  'Tamil Nadu',
  'Karnataka',
  'Andhra Pradesh',
  'Maharashtra',
  'Punjab',
  'Haryana',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Rajasthan',
  'Gujarat',
  'West Bengal',
  'Odisha',
  'Bihar',
];

interface MarketPriceProps {
  state?: any;
}

export const MarketPrice: React.FC<MarketPriceProps> = () => {
  const { t } = useTranslation();
  const { farm, selectedFarmDetails } = useFarm();

  // Determine initial commodity from active farm crop
  const defaultCropName = useMemo(() => {
    const activeCrop =
      selectedFarmDetails?.crops?.[0]?.crop?.name ||
      selectedFarmDetails?.crops?.[0]?.variety ||
      farm.crop.cropName ||
      'Rice';

    // Normalize common crop names
    if (activeCrop.toLowerCase().includes('paddy') || activeCrop.toLowerCase().includes('rice')) {
      return 'Rice';
    }
    if (activeCrop.toLowerCase().includes('wheat')) return 'Wheat';
    if (activeCrop.toLowerCase().includes('tomato')) return 'Tomato';
    if (activeCrop.toLowerCase().includes('potato')) return 'Potato';
    if (activeCrop.toLowerCase().includes('onion')) return 'Onion';
    if (activeCrop.toLowerCase().includes('maize') || activeCrop.toLowerCase().includes('corn')) return 'Maize';
    if (activeCrop.toLowerCase().includes('cotton')) return 'Cotton';
    return activeCrop;
  }, [selectedFarmDetails, farm.crop.cropName]);

  const defaultState = useMemo(() => {
    return (
      (selectedFarmDetails as any)?.state ||
      (selectedFarmDetails as any)?.location?.state ||
      farm.location?.state ||
      'All'
    );
  }, [selectedFarmDetails, farm.location?.state]);

  const [selectedCommodity, setSelectedCommodity] = useState<string>(defaultCropName);
  const [customCommodityInput, setCustomCommodityInput] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>(defaultState);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'market_asc' | 'date_desc'>('price_desc');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<MarketPriceResponse | null>(null);

  // Sync with farm crop changes
  useEffect(() => {
    if (defaultCropName) {
      setSelectedCommodity(defaultCropName);
    }
  }, [defaultCropName]);

  useEffect(() => {
    if (defaultState && defaultState !== 'All') {
      setSelectedState(defaultState);
    }
  }, [defaultState]);

  // Fetch prices when commodity, state or farm changes
  const fetchPrices = async (isManualRefresh = false) => {
    if (!selectedCommodity.trim()) return;

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const activeFarmId = selectedFarmDetails?.id;
      const activeCropId = selectedFarmDetails?.crops?.[0]?.crop_id || selectedFarmDetails?.crops?.[0]?.crop?.id;
      const activeFarmCropId = selectedFarmDetails?.crops?.[0]?.id;

      const res = await getMarketPrices({
        commodity: selectedCommodity.trim(),
        state: selectedState === 'All' ? undefined : selectedState,
        farm_id: activeFarmId,
        crop_id: activeCropId,
        farm_crop_id: activeFarmCropId,
        limit: 100,
        force_refresh: isManualRefresh,
      });

      if (res?.data) {
        setPriceData(res.data);
      } else if (res?.error) {
        setError(res.error.message || 'Unable to fetch government market prices');
      }
    } catch (err: any) {
      console.error('Error fetching market prices:', err);
      setError(err?.message || 'Failed to connect to Mandi pricing service');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices(false);
  }, [selectedCommodity, selectedState]);

  const handleSelectCommodity = (commodity: string) => {
    setSelectedCommodity(commodity);
    setCustomCommodityInput('');
  };

  const handleCustomCommoditySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCommodityInput.trim()) {
      setSelectedCommodity(customCommodityInput.trim());
    }
  };

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    if (!priceData?.records) return [];

    let records = [...priceData.records];

    // Search query filter (market, district, variety, state)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.market?.toLowerCase().includes(q) ||
          r.district?.toLowerCase().includes(q) ||
          r.variety?.toLowerCase().includes(q) ||
          r.state?.toLowerCase().includes(q)
      );
    }

    // Sorting
    records.sort((a, b) => {
      const priceA = Number(a.modal_price) || 0;
      const priceB = Number(b.modal_price) || 0;

      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'market_asc') return (a.market || '').localeCompare(b.market || '');
      if (sortBy === 'date_desc') {
        const dateA = a.arrival_date || '';
        const dateB = b.arrival_date || '';
        return dateB.localeCompare(dateA);
      }
      return 0;
    });

    return records;
  }, [priceData, searchQuery, sortBy]);

  const averageModalPrice = priceData?.averageModalPrice || 0;
  const minModalPrice = priceData?.minModalPrice || 0;
  const maxModalPrice = priceData?.maxModalPrice || 0;
  const totalCount = priceData?.total || priceData?.records?.length || 0;
  const dataSource = priceData?.source || 'live_government_api';

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/80 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              {t('dashboard.market_prices_title', 'Government Mandi Crop Prices')}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {dataSource === 'live_government_api'
                ? 'Agmarknet Live'
                : dataSource === 'cache'
                ? 'Cached Gov Data'
                : 'Mandi Sync'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {t(
              'dashboard.market_prices_subtitle',
              'Real-time modal trading rates from Agricultural Produce Market Committees (APMC) across India via data.gov.in'
            )}
          </p>
        </div>

        {/* Refresh & Gov Source Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ministry of Agriculture</span>
          </span>
          <button
            onClick={() => fetchPrices(true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Mandi Prices from Government API"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? t('common.loading', 'Updating...') : t('dashboard.refresh_mandi', 'Sync Live Prices')}</span>
          </button>
        </div>
      </div>

      {/* Commodity Selector Chips & Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('dashboard.select_commodity', 'Select Crop Commodity')}</span>
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Active: <strong className="text-emerald-700 font-bold">{selectedCommodity}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {POPULAR_COMMODITIES.map((commodity) => {
            const isSelected = selectedCommodity.toLowerCase() === commodity.toLowerCase();
            return (
              <button
                key={commodity}
                onClick={() => handleSelectCommodity(commodity)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 scale-102 border border-emerald-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{CropIcon(commodity)}</span>
                <span>{commodity}</span>
              </button>
            );
          })}

          {/* Custom Commodity write-in input */}
          <form onSubmit={handleCustomCommoditySubmit} className="relative flex items-center">
            <input
              type="text"
              value={customCommodityInput}
              onChange={(e) => setCustomCommodityInput(e.target.value)}
              placeholder={t('dashboard.other_commodity', 'Other crop (e.g. Chilli)...')}
              className="pl-3 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-44"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-1 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Filter Row: State Select & Search & Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
        {/* State Dropdown */}
        <div className="sm:col-span-4 relative">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            {t('dashboard.filter_state', 'State / Region')}
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
            >
              {MAJOR_STATES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All India (All Mandis)' : st}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Search Mandi / District */}
        <div className="sm:col-span-5 relative">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            {t('dashboard.search_mandi', 'Search Market / District')}
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Aluva, Palakkad, Khanna, Nashik..."
              className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="sm:col-span-3 relative">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            {t('dashboard.sort_by', 'Sort Mandis')}
          </label>
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-9 pr-8 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="price_desc">Highest Price (₹)</option>
              <option value="price_asc">Lowest Price (₹)</option>
              <option value="market_asc">Market Name (A-Z)</option>
              <option value="date_desc">Latest Arrival</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Average Modal Price */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            {t('dashboard.avg_modal_price', 'Average Modal Price')}
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-heading">
              ₹{averageModalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">/ Qtl</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
            ~ ₹{(averageModalPrice / 100).toFixed(2)} per kg
          </span>
        </div>

        {/* Min Price */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            {t('dashboard.min_market_price', 'Minimum Price')}
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-slate-800 font-heading">
              ₹{minModalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-500">/ Qtl</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
            Lowest mandi floor
          </span>
        </div>

        {/* Max Price */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
            {t('dashboard.max_market_price', 'Maximum Price')}
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-amber-950 font-heading">
              ₹{maxModalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-amber-800 font-semibold">/ Qtl</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
            Peak premium rate
          </span>
        </div>

        {/* Mandis Count */}
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200">
          <span className="text-[11px] font-bold text-sky-900 uppercase tracking-wider block">
            {t('dashboard.reporting_mandis', 'Active Mandis')}
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-sky-950 font-heading">
              {filteredRecords.length}
            </span>
            <span className="text-[11px] text-sky-700 font-medium">
              of {totalCount} records
            </span>
          </div>
          <span className="text-[11px] text-sky-700 font-medium block mt-0.5">
            {selectedState === 'All' ? 'Nationwide Mandis' : `${selectedState} Mandis`}
          </span>
        </div>
      </div>

      {/* Main Mandi Records Listing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Mandi Live Trading Table</span>
            <span className="text-xs font-normal text-slate-500">
              ({filteredRecords.length} markets found)
            </span>
          </h3>
          <span className="text-xs text-slate-400">
            Standard Unit: <strong>1 Quintal (100 kg)</strong>
          </span>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              Fetching real-time Mandi market prices for {selectedCommodity}...
            </p>
            <p className="text-xs text-slate-400">Connecting to Agmarknet (data.gov.in)...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold">Failed to load Mandi rates</h4>
              <p className="text-xs">{error}</p>
              <button
                onClick={() => fetchPrices(true)}
                className="mt-2 text-xs font-semibold px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                Retry Request
              </button>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <Store className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">
              No mandi price records found for {selectedCommodity} {selectedState !== 'All' ? `in ${selectedState}` : ''}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Mandis may not have reported arrivals for this commodity today, or you may broaden your state filter to All India.
            </p>
            {selectedState !== 'All' && (
              <button
                onClick={() => setSelectedState('All')}
                className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
              >
                View Nationwide Mandi Rates
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredRecords.map((record, index) => {
              const modalPrice = Number(record.modal_price) || 0;
              const minPrice = Number(record.min_price) || modalPrice;
              const maxPrice = Number(record.max_price) || modalPrice;
              const isAboveAverage = averageModalPrice > 0 && modalPrice >= averageModalPrice;

              return (
                <div
                  key={`${record.market}-${record.district}-${index}`}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    {/* Card Top: Market & State */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{record.market}</span>
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{record.district}, <strong className="text-slate-700">{record.state}</strong></span>
                        </p>
                      </div>

                      {/* Variety / Grade Pill */}
                      {record.variety && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold shrink-0 border border-slate-200">
                          {record.variety}
                        </span>
                      )}
                    </div>

                    {/* Modal Price Highlight */}
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                          Modal Price
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-extrabold text-emerald-950 font-heading">
                            ₹{modalPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">/ Quintal</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Estimated</span>
                        <span className="text-xs font-bold text-slate-800">
                          ₹{(modalPrice / 100).toFixed(2)}/kg
                        </span>
                      </div>
                    </div>

                    {/* Price Range & Visual Spread */}
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Min: ₹{minPrice.toLocaleString('en-IN')}</span>
                        <span>Max: ₹{maxPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{
                            width: maxPrice > minPrice
                              ? `${Math.max(10, Math.min(100, ((modalPrice - minPrice) / (maxPrice - minPrice)) * 100))}%`
                              : '100%',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Arrival Date & Comparison */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{record.arrival_date || 'Today'}</span>
                    </span>

                    {averageModalPrice > 0 && (
                      <span
                        className={`font-semibold flex items-center gap-1 ${
                          isAboveAverage ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {isAboveAverage ? (
                          <>
                            <TrendingUp className="w-3 h-3" />
                            <span>+₹{(modalPrice - averageModalPrice).toFixed(0)} vs avg</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3" />
                            <span>-₹{(averageModalPrice - modalPrice).toFixed(0)} vs avg</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info & Official Agmarknet Attribution */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Prices are published daily by APMC Mandis and synchronized with the Government of India National Data Portal (data.gov.in).
          </span>
        </div>
        <a
          href="https://agmarknet.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold shrink-0"
        >
          <span>Agmarknet Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
