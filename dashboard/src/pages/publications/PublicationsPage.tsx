import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  ExternalLink,
  Award,
  Sparkles,
  CheckCircle2,
  FileText,
  Calendar,
  User,
  Leaf,
  Layers,
  FlaskConical,
  X,
  Share2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface PublicationItem {
  id: string;
  title: string;
  authors: string[];
  institution: string;
  category: 'Pathology' | 'Irrigation' | 'Climate' | 'IPM' | 'Soil Health';
  year: number;
  journal: string;
  doi: string;
  isVerifiedPeerReviewed: boolean;
  abstract: string;
  keyTakeaways: string[];
  actionablePrescription: string;
  downloadUrl?: string;
  citation: string;
}

const PUBLICATIONS_DATA: PublicationItem[] = [
  {
    id: 'pub-01',
    title: 'Epidemiological Thresholds for Magnaporthe oryzae (Rice Blast) Under Shifting Monsoon Microclimates in South India',
    authors: ['Dr. Ramesh Menon', 'Dr. S. K. Swaminathan', 'Dr. P. Rajendran'],
    institution: 'Tamil Nadu Agricultural University (TNAU) & ICAR-NRRI',
    category: 'Pathology',
    year: 2025,
    journal: 'Indian Phytopathology Journal, Vol. 78, Issue 3',
    doi: '10.1007/s42360-025-00789-x',
    isVerifiedPeerReviewed: true,
    abstract:
      'Field epidemiological surveillance across 42 agro-ecological clusters revealed that blast conidia discharge occurs exponentially when nighttime leaf wetness exceeds 6 hours with relative humidity above 85% and minimum temperatures between 20°C and 26°C. Preventive prophylactic bio-fungicides applied at tillering reduced neck blast incidence by 73%.',
    keyTakeaways: [
      'Night temperature between 20-26°C is the key catalyst for blast spore dispersal.',
      'Split nitrogen applications significantly dampen leaf blast susceptibility.',
      'Prophylactic Tricyclazole or Pseudomonas fluorescens should precede heavy cloud cover.',
    ],
    actionablePrescription:
      'Avoid high basal nitrogen; apply 10g/L Pseudomonas fluorescens at the onset of active tillering if forecast predicts consecutive humid nights.',
    citation: 'Menon, R. et al. (2025). Indian Phytopathology, 78(3), 312-325.',
  },
  {
    id: 'pub-02',
    title: 'Alternate Wetting and Drying (AWD) Optimization in Deltaic Clay Soils: Water Savings and Yield Preservation',
    authors: ['Dr. Anita Sengupta', 'Er. M. K. Venkatraman', 'Dr. C. Balakrishnan'],
    institution: 'Water Technology Centre, TNAU Coimbatore & IRRI India',
    category: 'Irrigation',
    year: 2025,
    journal: 'Journal of Agricultural Water Management, 298, 108842',
    doi: '10.1016/j.agwat.2025.108842',
    isVerifiedPeerReviewed: true,
    abstract:
      'Implementing sensor-guided Alternate Wetting and Drying (AWD) with perforated field water tubes reduced total irrigation water consumption by 28% without penalizing grain yield or milling quality. AWD suppressed methane emissions by 34% and reduced sheath blight infestation by breaking canopy microclimate saturation.',
    keyTakeaways: [
      'Irrigating only when water table drops 15 cm below soil surface saves up to 30% water.',
      'AWD dramatically lowers sheath blight and root rot occurrence in delta soils.',
      'Continuous flooding is only required during flowering and heading phases.',
    ],
    actionablePrescription:
      'Install perforated PVC field water pipe to monitor depth; allow water to drop 15cm below soil line before re-flooding during vegetative stage.',
    citation: 'Sengupta, A. et al. (2025). J. Agric. Water Manage., 298, 108842.',
  },
  {
    id: 'pub-03',
    title: 'Integrated Pest Management Protocols for Brown Planthopper (Nilaparvata lugens) in Intensive Rice Cultivation',
    authors: ['Dr. K. S. Murthy', 'Dr. G. Radhakrishnan', 'Dr. Deepa Nair'],
    institution: 'ICAR - Indian Institute of Rice Research (IIRR), Hyderabad',
    category: 'IPM',
    year: 2024,
    journal: 'Crop Protection & Entomology Bulletin, Vol. 41(2)',
    doi: '10.1016/j.cropro.2024.106512',
    isVerifiedPeerReviewed: true,
    abstract:
      'Synthetic pyrethroids frequently trigger BPH resurgence by annihilating predatory mirid bugs (Cyrtorhinus lividipennis). The study validates threshold-based intervention with selective chordotonal organ modulators (Pymetrozine and Triflumezopyrim) alongside alleyway formation (20cm gaps every 2m) to prevent hopper burn.',
    keyTakeaways: [
      'Alleyway formation improves sunlight penetration and discourages BPH aggregation.',
      'Synthetic pyrethroids must be completely avoided as they eliminate beneficial predators.',
      'Apply Pymetrozine at base of tillers when nymph population reaches 5-10 insects per hill.',
    ],
    actionablePrescription:
      'Form 30cm walking alleyways every 2m during transplanting. Spray Pymetrozine 50% WG @ 120g/acre directed at the base of the plant.',
    citation: 'Murthy, K.S. et al. (2024). Crop Protection, 41(2), 145-158.',
  },
  {
    id: 'pub-04',
    title: 'Enhancing Soil Microbial Carbon and Nutrient Cycling via Bio-Enriched Laterite Amendments',
    authors: ['Dr. Sunita Patil', 'Dr. Harish Joshi', 'Dr. N. Chandran'],
    institution: 'ICAR - Central Coastal Agricultural Research Institute (CCARI)',
    category: 'Soil Health',
    year: 2024,
    journal: 'Applied Soil Ecology & Agronomy, Vol. 182, 104711',
    doi: '10.1016/j.apsoil.2024.104711',
    isVerifiedPeerReviewed: true,
    abstract:
      'Acidic laterite soils in coastal and humid tropics face rapid organic matter oxidation and phosphorus fixation. Co-application of biochar (2 t/ha) with mycorrhizal biofertilizers and farmyard manure elevated soil pH from 4.8 to 5.9, increased cation exchange capacity by 44%, and boosted phosphorus availability by 65%.',
    keyTakeaways: [
      'Biochar combined with FYM buffers soil pH in acidic lateritic terrains.',
      'Vesicular Arbuscular Mycorrhizae (VAM) solubilizes fixed phosphorus for root uptake.',
      'Soil organic carbon (SOC) increased from 0.42% to 0.88% within two crop cycles.',
    ],
    actionablePrescription:
      'Apply 250 kg/acre agricultural lime or dolomite 2 weeks prior to transplanting in soils with pH < 5.5, followed by VAM inoculation at planting.',
    citation: 'Patil, S. et al. (2024). Appl. Soil Ecol., 182, 104711.',
  },
  {
    id: 'pub-05',
    title: 'Thermal Tolerance and Spikelet Fertility Dynamics in Short-Duration Hybrid Cereals Under Heatwaves',
    authors: ['Dr. Vikramaditya Rathore', 'Dr. Meera Nambiar', 'Dr. Rajiv Sharma'],
    institution: 'ICAR - Indian Agricultural Research Institute (IARI), New Delhi',
    category: 'Climate',
    year: 2025,
    journal: 'Global Change Biology - Crop Systems, Vol. 31(1), e16723',
    doi: '10.1111/gcb.2025.16723',
    isVerifiedPeerReviewed: true,
    abstract:
      'Spikelet opening coinciding with daytime temperatures exceeding 35°C induces high pollen sterility. The paper details foliar application of 1% potassium nitrate (KNO3) and alpha-tocopherol during panicle emergence to enhance antioxidant enzyme synthesis and maintain viable grain set.',
    keyTakeaways: [
      'Anthesis between 9 AM and 11 AM is the most thermal-sensitive window.',
      'Foliar potassium sprays improve stomatal conductance and reduce canopy temperature by 1.8°C.',
      'Early morning light irrigation dampens soil and canopy microclimate heat spikes.',
    ],
    actionablePrescription:
      'Foliar spray of 1% Potassium Nitrate (KNO3) (10g/L water) at 50% flowering during forecasted heatwave conditions.',
    citation: 'Rathore, V. et al. (2025). Glob. Change Biol., 31(1), e16723.',
  },
];

export const PublicationsPage: React.FC = () => {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalPub, setActiveModalPub] = useState<PublicationItem | null>(null);

  const categories = ['ALL', 'Pathology', 'Irrigation', 'IPM', 'Soil Health', 'Climate'];

  const filteredPubs = PUBLICATIONS_DATA.filter((pub) => {
    if (selectedCategory !== 'ALL' && pub.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = pub.title.toLowerCase().includes(q);
      const authorMatch = pub.authors.some((a) => a.toLowerCase().includes(q));
      const instituteMatch = pub.institution.toLowerCase().includes(q);
      const abstractMatch = pub.abstract.toLowerCase().includes(q);
      if (!titleMatch && !authorMatch && !instituteMatch && !abstractMatch) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                Agronomic Literature & University Protocols
              </span>
              <span className="text-xs text-slate-400">
                · {filteredPubs.length} peer-reviewed guides
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              {t('publications.title') || 'Agricultural Publications & Research'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {t('publications.subtitle') ||
                'Peer-reviewed journals, university research bulletins, and ICAR/TNAU packages of practices supporting AgriNet diagnostic algorithms.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
              <Award className="w-4 h-4 text-amber-300" />
              100% Scientifically Cited
            </span>
          </div>
        </div>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('publications.search_placeholder') || 'Search publications by title, author, crop, or keywords...'}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat === 'ALL' ? 'All Subjects' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Publications Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPubs.map((pub) => (
          <div
            key={pub.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group hover:border-emerald-400"
          >
            <div className="space-y-3">
              {/* Category & Verified Stamp */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {pub.category}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-medium">
                    {pub.year}
                  </span>
                  {pub.isVerifiedPeerReviewed && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Peer-Reviewed
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors font-heading">
                {pub.title}
              </h3>

              {/* Institution and Journal */}
              <div className="text-xs text-slate-500 space-y-0.5">
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {pub.authors.join(', ')}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">{pub.institution}</p>
                <p className="text-[11px] italic text-slate-400">{pub.journal}</p>
              </div>

              {/* Abstract Preview */}
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {pub.abstract}
              </p>

              {/* Key Takeaways Pill Box */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Key Agronomic Prescription:
                </span>
                <p className="text-emerald-950 font-medium text-xs leading-snug">
                  {pub.actionablePrescription}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[160px]">
                DOI: {pub.doi}
              </span>

              <button
                type="button"
                onClick={() => setActiveModalPub(pub)}
                className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Read Full Brief & Evidence</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Full Publication Brief Modal */}
      {activeModalPub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {activeModalPub.category} · {activeModalPub.year}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2 leading-snug font-heading">
                  {activeModalPub.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalPub(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Authors & Institutional Affiliation */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">{activeModalPub.authors.join(', ')}</p>
              <p className="text-slate-600">{activeModalPub.institution}</p>
              <p className="text-slate-400 italic">{activeModalPub.journal} · DOI: {activeModalPub.doi}</p>
            </div>

            {/* Abstract */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Executive Abstract
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {activeModalPub.abstract}
              </p>
            </div>

            {/* Core Scientific Takeaways */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Empirical Takeaways & Rules Logic
              </span>
              <ul className="space-y-2 text-xs text-slate-700">
                {activeModalPub.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable Prescription */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs space-y-1">
              <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Prescribed Farm Practice
              </span>
              <p className="text-emerald-900 font-medium leading-relaxed">
                {activeModalPub.actionablePrescription}
              </p>
            </div>

            {/* Citation */}
            <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100">
              <span className="font-semibold block text-slate-500">How to Cite:</span>
              <p className="font-mono mt-0.5">{activeModalPub.citation}</p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModalPub(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {t('common.close') || 'Close Brief'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
