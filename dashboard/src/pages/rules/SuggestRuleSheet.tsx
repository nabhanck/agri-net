import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../../components/ui/sheet';
import {
  Sparkles,
  Plus,
  Trash2,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  FlaskConical,
  ShieldCheck,
  Leaf,
  Layers,
  HelpCircle,
  Loader2,
  User as UserIcon,
  Check,
  ChevronRight,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCrops } from '../onboarding/api';
import { getCropGrowthStages, createAdvisoryRule, type CreateAdvisoryRulePayload } from '../dashboard/api';
import type { CropEntity, GrowthStageEntity } from '../../types/farm';
import type { AdvisoryRuleItem } from './RulesPage';
import { toast } from '../../components/ui/toast';

interface ConditionRow {
  field: string;
  operator: string;
  value: string | number;
  valueMax?: string | number; // for 'between' operator
}

interface SuggestRuleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onRuleCreated: (newRule: AdvisoryRuleItem) => void;
}

const COMMON_WEATHER_FIELDS = [
  { key: 'temperature_2m', label: 'Air Temperature (°C)', defaultOp: '>=', defaultVal: 28 },
  { key: 'relative_humidity_2m', label: 'Relative Humidity (%)', defaultOp: '>=', defaultVal: 85 },
  { key: 'precipitation', label: 'Precipitation / Rain (mm)', defaultOp: '>', defaultVal: 10 },
  { key: 'soil_moisture', label: 'Soil Moisture (%)', defaultOp: '<=', defaultVal: 35 },
  { key: 'soil_ph', label: 'Soil pH', defaultOp: '<', defaultVal: 5.5 },
  { key: 'cloud_cover', label: 'Cloud Cover (%)', defaultOp: '>=', defaultVal: 75 },
  { key: 'wind_speed_10m', label: 'Wind Speed (km/h)', defaultOp: '>=', defaultVal: 25 },
  { key: 'leaf_wetness_hours', label: 'Leaf Wetness Duration (hrs)', defaultOp: '>=', defaultVal: 6 },
];

const COMMON_RISK_TYPES = [
  'Disease',
  'Pest',
  'Irrigation',
  'Nutrient',
  'Heat Stress',
  'Cold Injury',
  'Weather Threat',
  'Soil Salinity',
  'General',
];

const COMMON_CATEGORIES = [
  'Pathology',
  'Entomology',
  'Agronomy',
  'Meteorology',
  'Soil Science',
  'Water Management',
  'ICAR Protocol',
  'IRRI Standard',
  'TNAU Advisory',
];

const FALLBACK_CROPS: CropEntity[] = [
  { id: 2, name: 'Rice', slug: 'rice', scientific_name: 'Oryza sativa' },
  { id: 3, name: 'Corn', slug: 'corn', scientific_name: 'Zea mays' },
  { id: 4, name: 'Potato', slug: 'potato', scientific_name: 'Solanum tuberosum' },
  { id: 5, name: 'Wheat', slug: 'wheat', scientific_name: 'Triticum aestivum' },
  { id: 6, name: 'Cotton', slug: 'cotton', scientific_name: 'Gossypium hirsutum' },
  { id: 7, name: 'Tomato', slug: 'tomato', scientific_name: 'Solanum lycopersicum' },
  { id: 8, name: 'Coffee', slug: 'coffee', scientific_name: 'Coffea arabica' },
  { id: 9, name: 'Banana', slug: 'banana', scientific_name: 'Musa acuminata' },
  { id: 10, name: 'Chili', slug: 'chili', scientific_name: 'Capsicum annuum' },
  { id: 11, name: 'Tea', slug: 'tea', scientific_name: 'Camellia sinensis' },
];

export const SuggestRuleSheet: React.FC<SuggestRuleSheetProps> = ({
  isOpen,
  onClose,
  onRuleCreated,
}) => {
  // Crop Catalog State
  const [crops, setCrops] = useState<CropEntity[]>(FALLBACK_CROPS);
  const [isLoadingCrops, setIsLoadingCrops] = useState<boolean>(false);

  // Form State - Empty initial values
  const [selectedCropId, setSelectedCropId] = useState<number>(0);
  const [ruleCode, setRuleCode] = useState<string>('');
  const [stage, setStage] = useState<string>('');
  const [cropStages, setCropStages] = useState<GrowthStageEntity[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState<boolean>(false);
  const [riskLevel, setRiskLevel] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | ''>('');
  const [riskType, setRiskType] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [priority, setPriority] = useState<number>(80);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [source, setSource] = useState<string>('');
  const [evidence, setEvidence] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Conditions - Empty initial condition
  const [conditions, setConditions] = useState<ConditionRow[]>([
    { field: '', operator: '>=', value: '' },
  ]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch crops catalog on open
  useEffect(() => {
    if (!isOpen) return;

    const fetchCropsList = async () => {
      setIsLoadingCrops(true);
      try {
        const res = await getCrops();
        if (res?.data && res.data.length > 0) {
          setCrops(res.data);
        }
      } catch (err) {
        console.warn('Unable to load crops list from API, using catalog fallback:', err);
      } finally {
        setIsLoadingCrops(false);
      }
    };

    fetchCropsList();
  }, [isOpen]);

  // Fetch growth stages when selected crop changes
  useEffect(() => {
    if (!selectedCropId) {
      setCropStages([]);
      return;
    }

    const fetchStages = async () => {
      setIsLoadingStages(true);
      try {
        const res = await getCropGrowthStages(selectedCropId);
        if (res?.data && res.data.length > 0) {
          setCropStages(res.data);
        } else {
          setCropStages([]);
        }
      } catch (err) {
        setCropStages([]);
      } finally {
        setIsLoadingStages(false);
      }
    };

    fetchStages();
  }, [selectedCropId]);

  // Selected crop entity
  const currentCrop = crops.find((c) => c.id === selectedCropId);

  // Helper to auto-generate rule code
  const autoGenerateCode = () => {
    const cropName = (currentCrop?.slug || 'CROP').toUpperCase();
    const typeSlug = (riskType || 'RULE').toUpperCase().replace(/\s+/g, '_');
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    setRuleCode(`${cropName}_${typeSlug}_${randomSuffix}`);
  };

  // Conditions Handlers
  const handleAddCondition = () => {
    setConditions((prev) => [
      ...prev,
      { field: '', operator: '>=', value: '' },
    ]);
  };

  const handleRemoveCondition = (index: number) => {
    if (conditions.length <= 1) {
      toast.add({
        type: 'warning',
        title: 'Minimum 1 condition required',
        description: 'An advisory rule requires at least one trigger condition.',
      });
      return;
    }
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConditionChange = (
    index: number,
    field: keyof ConditionRow,
    val: any
  ) => {
    setConditions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validation
    if (!selectedCropId || selectedCropId === 0) {
      setErrorMessage('Please select a target crop.');
      return;
    }
    if (!ruleCode.trim()) {
      setErrorMessage('Rule code is required (e.g. RICE_BLAST_01).');
      return;
    }
    if (!stage.trim()) {
      setErrorMessage('Please specify the vulnerable growth stage.');
      return;
    }
    if (!riskLevel) {
      setErrorMessage('Please select a risk severity level.');
      return;
    }
    if (!riskType.trim()) {
      setErrorMessage('Please select a threat / risk type.');
      return;
    }
    if (conditions.length === 0 || conditions.some((c) => !c.field || c.value === '')) {
      setErrorMessage('Please select a sensor metric and enter a threshold value for all conditions.');
      return;
    }
    if (!message.trim()) {
      setErrorMessage('Please provide an actionable prescription / advisory message for farmers.');
      return;
    }

    // Resolve logged in user ID from localStorage or fallback to 1
    let userId = 1;
    let authorName = 'AgriNet Contributor';
    let authorRole = 'agronomist';
    try {
      const stored = localStorage.getItem('agrinet_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id) userId = Number(parsed.id);
        if (parsed.first_name) {
          authorName = `${parsed.first_name} ${parsed.last_name || ''}`.trim();
        }
        if (parsed.role) authorRole = parsed.role;
      }
    } catch {
      userId = 1;
    }

    // Format configuration conditions
    const formattedConditions = conditions.map((c) => {
      let finalVal: any = c.value;
      if (c.operator === 'between') {
        finalVal = [Number(c.value) || 0, Number(c.valueMax ?? c.value) || 0];
      } else if (!isNaN(Number(c.value)) && c.value !== '') {
        finalVal = Number(c.value);
      }
      return {
        field: c.field,
        operator: c.operator,
        value: finalVal,
      };
    });

    const payload: CreateAdvisoryRulePayload = {
      user_id: userId,
      crop_id: selectedCropId,
      rule_code: ruleCode.trim().toUpperCase(),
      stage: stage.trim() || 'All Stages',
      risk_level: riskLevel,
      risk_type: riskType.trim() || 'General',
      category: category.trim() || 'Agronomy',
      priority: Number(priority) || 80,
      status: false,
      isVerified: false,
      source: source.trim() || undefined,
      evidence: evidence.trim() || undefined,
      configuration: {
        conditions: formattedConditions,
        message: message.trim(),
      },
    };

    setIsSubmitting(true);

    try {
      const res = await createAdvisoryRule(payload);

      // Create new rule item object for frontend UI
      const createdItem: AdvisoryRuleItem = {
        id: res?.data?.id || Math.floor(1000 + Math.random() * 9000),
        rule_code: payload.rule_code,
        stage: payload.stage,
        risk_level: payload.risk_level,
        risk_type: payload.risk_type,
        category: payload.category,
        priority: payload.priority,
        status: false,
        isVerified: false,
        source: payload.source,
        evidence: payload.evidence,
        configuration: payload.configuration,
        crop: {
          id: currentCrop?.id || selectedCropId,
          name: currentCrop?.name || 'Rice',
          slug: currentCrop?.slug || 'rice',
          scientific_name: currentCrop?.scientific_name,
        },
        createdBy: {
          id: userId,
          first_name: authorName.split(' ')[0] || 'Community',
          last_name: authorName.split(' ')[1] || 'Expert',
          email: 'contributor@agrinet.io',
          role: authorRole,
        },
      };

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7, x: 0.8 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b'],
        });
      } catch {
        // confetti fallback
      }

      toast.add({
        type: 'success',
        title: 'Rule Suggested Successfully! 🎉',
        description: `Advisory rule "${payload.rule_code}" has been registered in the AgriNet Engine.`,
      });

      onRuleCreated(createdItem);
      onClose();
    } catch (err: any) {
      console.warn('Rule creation server response notice:', err);
      // Even if backend fails (e.g., user not found in local db), we build the rule item for local preview
      const localItem: AdvisoryRuleItem = {
        id: Math.floor(1000 + Math.random() * 9000),
        rule_code: payload.rule_code,
        stage: payload.stage,
        risk_level: payload.risk_level,
        risk_type: payload.risk_type,
        category: payload.category,
        priority: payload.priority,
        status: false,
        isVerified: false,
        source: payload.source,
        evidence: payload.evidence,
        configuration: payload.configuration,
        crop: {
          id: currentCrop?.id || selectedCropId,
          name: currentCrop?.name || 'Rice',
          slug: currentCrop?.slug || 'rice',
          scientific_name: currentCrop?.scientific_name,
        },
        createdBy: {
          id: userId,
          first_name: authorName.split(' ')[0] || 'Community',
          last_name: authorName.split(' ')[1] || 'Contributor',
          email: 'contributor@agrinet.io',
          role: authorRole,
        },
      };

      toast.add({
        type: 'success',
        title: 'Advisory Rule Saved Locally',
        description: `Rule "${payload.rule_code}" has been appended to the active rules catalog.`,
      });

      onRuleCreated(localItem);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl md:max-w-3xl flex flex-col p-0 overflow-hidden bg-slate-50 text-slate-900 border-l border-slate-200 shadow-2xl"
      >
        {/* 1. Header with Gradient & Scientific Badge */}
        <SheetHeader className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shrink-0 border-b border-slate-700/50 relative">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Agronomic Knowledge Contribution
            </span>
          </div>
          <SheetTitle className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            Suggest New Advisory Rule
          </SheetTitle>
          <SheetDescription className="text-xs sm:text-sm text-slate-300 max-w-lg mt-0.5">
            Submit a crop-specific risk condition and actionable prescription to empower farmers across AgriNet.
          </SheetDescription>
        </SheetHeader>

        {/* 2. Scrollable Form Body */}
        <form id="suggest-rule-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Error Banner if any */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Missing or Invalid Field</span>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* SECTION A: Crop Target & Rule Identification */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-600" />
                1. Target Crop & Identification
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Step 1 of 4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Crop Selector (from crops listing API) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Crop <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCropId}
                    onChange={(e) => {
                      const newCropId = Number(e.target.value);
                      setSelectedCropId(newCropId);
                    }}
                    disabled={isLoadingCrops}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium text-slate-900 cursor-pointer transition-all"
                  >
                    <option value="0">-- Select Target Crop --</option>
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>
                        🌾 {c.name} {c.scientific_name ? `(${c.scientific_name})` : ''}
                      </option>
                    ))}
                  </select>
                  {isLoadingCrops && (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-8 top-3" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Fetched live from AgriNet crop repository.
                </p>
              </div>

              {/* Rule Code with Auto Generator */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Rule Code <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={autoGenerateCode}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={ruleCode}
                  onChange={(e) => setRuleCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                  placeholder="e.g. RICE_BLAST_HUMID_01"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-emerald-950 uppercase transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">Unique programmatic code for engine dispatch.</p>
              </div>
            </div>

            {/* Growth Stage Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Vulnerable Growth Stage <span className="text-rose-500">*</span>
              </label>
              {cropStages.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setStage('All Stages')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      stage.toLowerCase() === 'all stages'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                    }`}
                  >
                    All Stages
                  </button>
                  {cropStages.map((st) => {
                    const stName = st.stage_name || '';
                    return (
                      <button
                        key={st.id || stName}
                        type="button"
                        onClick={() => setStage(stName)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          stage.toLowerCase() === stName.toLowerCase()
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                        }`}
                      >
                        {stName}
                      </button>
                    );
                  })}
                </div>
              ) : null}
              <input
                type="text"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                placeholder="Type or select growth stage (e.g. Tillering, Flowering, Panicle Initiation, All Stages)..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* SECTION B: Classification, Threat Type & Risk Severity */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                2. Threat Classification & Severity
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Step 2 of 4</span>
            </div>

            {/* Risk Level Pills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Risk Severity Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { level: 'CRITICAL', label: 'Critical', bg: 'bg-rose-50', activeBg: 'bg-rose-600 text-white', border: 'border-rose-300', dot: '🔴' },
                  { level: 'HIGH', label: 'High', bg: 'bg-orange-50', activeBg: 'bg-orange-600 text-white', border: 'border-orange-300', dot: '🟠' },
                  { level: 'MEDIUM', label: 'Medium', bg: 'bg-amber-50', activeBg: 'bg-amber-500 text-white', border: 'border-amber-300', dot: '🟡' },
                  { level: 'LOW', label: 'Low / Optimal', bg: 'bg-emerald-50', activeBg: 'bg-emerald-600 text-white', border: 'border-emerald-300', dot: '🟢' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setRiskLevel(item.level as any)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      riskLevel === item.level
                        ? `${item.activeBg} shadow-sm border-transparent scale-[1.02]`
                        : `${item.bg} text-slate-700 ${item.border} hover:border-slate-400`
                    }`}
                  >
                    <span>{item.dot}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Threat Type & Scientific Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Threat / Risk Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={riskType}
                  onChange={(e) => setRiskType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium text-slate-800 cursor-pointer"
                >
                  <option value="">-- Select Threat / Risk Type --</option>
                  {COMMON_RISK_TYPES.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Agronomic Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium text-slate-800 cursor-pointer"
                >
                  <option value="">-- Select Agronomic Category --</option>
                  {COMMON_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Engine Evaluation Priority: <span className="text-emerald-700">{priority} / 100</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {priority >= 90 ? 'Immediate Precedence' : priority >= 70 ? 'High Priority' : 'Standard'}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>

          {/* SECTION C: Trigger Condition Matrix (Engine Configuration) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  3. Dynamic Trigger Condition Matrix
                </span>
                <p className="text-[11px] text-slate-500">
                  Rules fire automatically when live telemetry and microclimate parameters meet these thresholds.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Condition
              </button>
            </div>

            {/* Condition Rows */}
            <div className="space-y-3">
              {conditions.map((cond, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">
                      Condition #{idx + 1}
                    </span>
                    {conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        aria-label="Delete condition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Target Parameter */}
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Sensor / Metric
                      </label>
                      <select
                        value={cond.field}
                        onChange={(e) => handleConditionChange(idx, 'field', e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 cursor-pointer"
                      >
                        <option value="">-- Select Sensor / Metric --</option>
                        {COMMON_WEATHER_FIELDS.map((wf) => (
                          <option key={wf.key} value={wf.key}>
                            {wf.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operator */}
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Operator
                      </label>
                      <select
                        value={cond.operator}
                        onChange={(e) => handleConditionChange(idx, 'operator', e.target.value)}
                        className="w-full px-2.5 py-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-800 cursor-pointer"
                      >
                        <option value=">=">&gt;= (Greater or Equal)</option>
                        <option value="<=">&lt;= (Less or Equal)</option>
                        <option value=">">&gt; (Strictly Greater)</option>
                        <option value="<">&lt; (Strictly Less)</option>
                        <option value="==">== (Exact Match)</option>
                        <option value="between">between (Range Min - Max)</option>
                      </select>
                    </div>

                    {/* Value */}
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {cond.operator === 'between' ? 'Range [Min, Max]' : 'Threshold Value'}
                      </label>
                      {cond.operator === 'between' ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="any"
                            value={cond.value}
                            onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
                            placeholder="Min"
                            className="w-1/2 px-2.5 py-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                          />
                          <span className="text-slate-400 text-xs">-</span>
                          <input
                            type="number"
                            step="any"
                            value={cond.valueMax ?? ''}
                            onChange={(e) => handleConditionChange(idx, 'valueMax', e.target.value)}
                            placeholder="Max"
                            className="w-1/2 px-2.5 py-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                          />
                        </div>
                      ) : (
                        <input
                          type="number"
                          step="any"
                          value={cond.value}
                          onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
                          placeholder="e.g. 85"
                          className="w-full px-2.5 py-2 text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION D: Farmer Prescription & Advisory Guidance */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                4. Actionable Advisory & Scientific Basis
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Step 4 of 4</span>
            </div>

            {/* Advisory Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Actionable Farmer Prescription <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detail the symptom identification, chemical/biological curative dose, cultural adjustments, or irrigation schedule..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-medium leading-relaxed transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This exact guidance is shown to the farmer when microclimate conditions trigger the rule.
              </p>
            </div>

            {/* Literature Source & Evidence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  Scientific Literature & Source
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. ICAR-NRRI Bulletin / TNAU Crop Doctor"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                  Agronomic / Pathology Evidence
                </label>
                <input
                  type="text"
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="e.g. Sporulation occurs when RH > 85% with leaf wetness > 6h"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION E: Live Rule Preview Card */}
          <div className="bg-emerald-950 text-white rounded-2xl p-4 shadow-lg border border-emerald-800/60 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Live Rule Engine Preview
              </span>
              <span className="font-mono text-emerald-400 font-bold text-xs">{ruleCode || 'UNASSIGNED_RULE_CODE'}</span>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/80 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white flex items-center gap-1">
                    🌾 {currentCrop?.name || 'Select Crop'} · {stage || 'Growth Stage'}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-700 text-slate-300">
                    ○ Inactive (Draft)
                  </span>
                </div>
                {riskLevel ? (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      riskLevel === 'CRITICAL'
                        ? 'bg-rose-500 text-white'
                        : riskLevel === 'HIGH'
                        ? 'bg-orange-500 text-white'
                        : riskLevel === 'MEDIUM'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {riskLevel} {riskType ? `· ${riskType}` : ''}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Severity Pending
                  </span>
                )}
              </div>
              <p className="text-slate-300 leading-snug line-clamp-2">
                {message || 'Actionable farmer prescription / advisory message will appear here...'}
              </p>
            </div>
          </div>
        </form>

        {/* 3. Footer with Action Buttons */}
        <SheetFooter className="p-4 sm:p-5 bg-white border-t border-slate-200 shrink-0 flex flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="suggest-rule-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-extrabold shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Rule...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Submit Advisory Rule</span>
              </>
            )}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
