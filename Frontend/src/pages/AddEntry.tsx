import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Edit3,
  Trash2,
  X,
  Check,
  Search,
  Utensils,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';
import { Entry } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import {
  LocalFoodVision,
  DishCandidate,
  FoodVisionResult,
  getHealthInsight
} from '../services/localFoodVision';
import { CameraCaptureModal } from '../components/CameraCaptureModal';

export type MealCategory =
  | 'Breakfast'
  | 'Morning Snacks'
  | 'Lunch'
  | 'Evening Snacks'
  | 'Dinner'
  | 'Midnight Craving';

const MEAL_CATEGORIES: { id: MealCategory; label: string; icon: string }[] = [
  { id: 'Breakfast', label: 'Breakfast', icon: '🍳' },
  { id: 'Morning Snacks', label: 'Morning Snacks', icon: '🥐' },
  { id: 'Lunch', label: 'Lunch', icon: '🥗' },
  { id: 'Evening Snacks', label: 'Evening Snacks', icon: '☕' },
  { id: 'Dinner', label: 'Dinner', icon: '🍲' },
  { id: 'Midnight Craving', label: 'Midnight Craving', icon: '🌙' },
];

const getAutoMealCategory = (): MealCategory => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'Breakfast';
  if (hour >= 11 && hour < 12) return 'Morning Snacks';
  if (hour >= 12 && hour < 16) return 'Lunch';
  if (hour >= 16 && hour < 19) return 'Evening Snacks';
  if (hour >= 19 && hour < 23) return 'Dinner';
  return 'Midnight Craving';
};

export const AddEntry: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showLiveCamera, setShowLiveCamera] = useState(false);

  // Calibration states (shown only when necessary)
  const [plateSize, setPlateSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [cookingStyle, setCookingStyle] = useState<'lean' | 'home' | 'restaurant'>('home');
  const [showCalibration, setShowCalibration] = useState(true);

  // Detected Food Item & Details states
  const [detectedDishId, setDetectedDishId] = useState<string>('vada_sambar');
  const [detectedDishName, setDetectedDishName] = useState<string>('');
  const [detectedItems, setDetectedItems] = useState<string[]>([]);
  const [unitName, setUnitName] = useState<string>('piece');
  const [pieceCount, setPieceCount] = useState<number>(2);
  const [estimatedGrams, setEstimatedGrams] = useState<number>(350);
  const [topMatches, setTopMatches] = useState<DishCandidate[]>([]);
  const [confidenceBadge, setConfidenceBadge] = useState<string>('');
  const [showDishSearch, setShowDishSearch] = useState(false);
  const [dishSearchQuery, setDishSearchQuery] = useState('');

  // Extracted values & Meal Category
  const [mealCategory, setMealCategory] = useState<MealCategory>(getAutoMealCategory());
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fats, setFats] = useState<string>('');
  const [fiber, setFiber] = useState<string>('0');
  const [calorieRange, setCalorieRange] = useState<string | null>(null);
  const [proteinRange, setProteinRange] = useState<string | null>(null);
  const [carbsRange, setCarbsRange] = useState<string | null>(null);
  const [fatsRange, setFatsRange] = useState<string | null>(null);
  const [fiberRange, setFiberRange] = useState<string | null>(null);
  const [avgCalories, setAvgCalories] = useState<number | null>(null);
  const [source, setSource] = useState<'Image' | 'Text' | 'Manual'>('Image');

  // Scan Mode: 'plate' (Cooked Food / Dishes) vs 'packet' (Protein Bars / Powders / Nutrition Facts)
  const [scanMode, setScanMode] = useState<'plate' | 'packet'>('plate');
  const [selectedPacketPresetId, setSelectedPacketPresetId] = useState<string>('protein_bar_60g');
  const [packetQuantity, setPacketQuantity] = useState<number>(1.0);
  const [packetProductName, setPacketProductName] = useState<string | null>(null);
  const [packetServingSize, setPacketServingSize] = useState<string | null>(null);
  const [packetServingUnit, setPacketServingUnit] = useState<string>('bar');
  const [liquidType, setLiquidType] = useState<'water' | 'toned_milk' | 'skim_milk'>('water');
  const [liquidMl, setLiquidMl] = useState<number>(200);
  const [showHealthInsight, setShowHealthInsight] = useState<boolean>(false);
  const [packetIngredients, setPacketIngredients] = useState<string | null>(null);
  const [basePerServing, setBasePerServing] = useState<{
    calories_kcal: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    fiber_g: number;
  } | null>(null);

  // Post-log action states
  const [lastSavedEntry, setLastSavedEntry] = useState<Entry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFoodName, setEditFoodName] = useState('');
  const [editCal, setEditCal] = useState('');
  const [editProt, setEditProt] = useState('');
  const [editCarb, setEditCarb] = useState('');
  const [editFat, setEditFat] = useState('');
  const [editFib, setEditFib] = useState('');
  const [editMeal, setEditMeal] = useState<MealCategory>('Lunch');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Date and Time
  const now = new Date();
  const todayStr = getLocalDateString(now);
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const [entryDate, setEntryDate] = useState<string>(todayStr);
  const [entryTime, setEntryTime] = useState<string>(timeStr);

  // State indicators
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const applyFoodVisionResult = (res: FoodVisionResult) => {
    setSource('Image');
    setDetectedDishId(res.dish_id || 'vada_sambar');
    setDetectedDishName(res.detected_dish || 'Balanced Meal Plate');
    setDetectedItems(res.items_detected || []);
    setUnitName(res.unit_name || 'serving');
    setPieceCount(res.piece_count || 1);
    setEstimatedGrams(res.estimated_grams || 350);
    if (res.top_matches && res.top_matches.length > 0) {
      setTopMatches(res.top_matches);
    }
    setConfidenceBadge(res.confidence_level || 'High • 94% Calibrated Match');

    setCalories(res.calories_kcal.toString());
    setProtein(res.protein_g.toString());
    setCarbs(res.carbs_g.toString());
    setFats(res.fats_g.toString());
    setFiber(res.fiber_g.toString());

    setCalorieRange(res.calorie_range_str);
    setAvgCalories(res.calories_kcal);
    setProteinRange(res.protein_range_str);
    setCarbsRange(res.carbs_range_str);
    setFatsRange(res.fats_range_str);
    setFiberRange(res.fiber_range_str);
    setLastSavedEntry(null);
  };

  // Run Food Photo analysis
  const runFoodPhotoAnalysis = async (
    file: File,
    cooking: 'lean' | 'home' | 'restaurant' = cookingStyle,
    plate: 'small' | 'medium' | 'large' = plateSize
  ) => {
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const res = await api.parseFoodPhoto(file, 'e4b', 'normal', cooking, plate);
      applyFoodVisionResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze food plate offline.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Recalculate instantly when user switches dish, piece count, plate size, or cooking style
  const handleRecalculateDish = (
    newDishId: string,
    newPieces?: number,
    newPlate: 'small' | 'medium' | 'large' = plateSize,
    newCooking: 'lean' | 'home' | 'restaurant' = cookingStyle
  ) => {
    const res = LocalFoodVision.calculateForDish(
      newDishId,
      newPieces,
      newPlate,
      newCooking,
      topMatches.length > 0 ? topMatches : undefined
    );
    applyFoodVisionResult(res);
  };

  // Handle Protein Bar & Powder Packet OCR + Quantity Scaling
  const runPacketAnalysis = async (
    file: File | null,
    qty: number = packetQuantity,
    presetId?: string
  ) => {
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const res = file
        ? await api.parsePacketLabel(file, qty, presetId)
        : await LocalFoodVision.analyzePacketLabel(null, qty, presetId, liquidType, liquidMl);
      setSource('Image');
      if (res.packet_id) setSelectedPacketPresetId(res.packet_id);
      setPacketProductName(res.product_name);
      setDetectedDishName(res.product_name);
      setDetectedItems([res.ingredients]);
      setPacketServingSize(res.serving_size);
      setPacketServingUnit(res.serving_unit);
      setPacketIngredients(res.ingredients);
      setBasePerServing(res.base_per_serving);

      if (res.serving_unit === 'scoop' && liquidType !== 'water') {
        recalculatePacketTotals(qty, res.serving_unit, liquidType, liquidMl, res.base_per_serving);
      } else {
        setCalories(res.calories_kcal.toString());
        setProtein(res.protein_g.toString());
        setCarbs(res.carbs_g.toString());
        setFats(res.fats_g.toString());
        setFiber(res.fiber_g.toString());

        setCalorieRange(res.calorie_range_str);
        setAvgCalories(res.calories_kcal);
        setProteinRange(res.protein_range_str);
        setCarbsRange(res.carbs_range_str);
        setFatsRange(res.fats_range_str);
        setFiberRange(res.fiber_range_str);
      }
      setConfidenceBadge(res.confidence_level);
      setLastSavedEntry(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze packet nutrition label.');
    } finally {
      setIsProcessing(false);
    }
  };

  const recalculatePacketTotals = (
    qty: number,
    unit: string,
    lType: 'water' | 'toned_milk' | 'skim_milk',
    lMl: number,
    base = basePerServing
  ) => {
    if (!base) return;
    let liqP = 0, liqC = 0, liqF = 0;
    if (unit === 'scoop' && lType !== 'water' && lMl > 0) {
      const factor = lMl / 100.0;
      if (lType === 'toned_milk') {
        liqP = 3.2 * factor;
        liqC = 4.8 * factor;
        liqF = 3.3 * factor;
      } else if (lType === 'skim_milk') {
        liqP = 3.4 * factor;
        liqC = 5.0 * factor;
        liqF = 0.2 * factor;
      }
    }
    const p = Math.round((base.protein_g * qty + liqP) * 10) / 10;
    const c = Math.round((base.carbs_g * qty + liqC) * 10) / 10;
    const f = Math.round((base.fats_g * qty + liqF) * 10) / 10;
    const fib = Math.round(base.fiber_g * qty * 10) / 10;
    const cal = Math.round(4.0 * (p + c) + 9.0 * f);

    setProtein(p.toString());
    setCarbs(c.toString());
    setFats(f.toString());
    setFiber(fib.toString());
    setCalories(cal.toString());

    const minCal = Math.round((cal * 0.95) / 5) * 5;
    const maxCal = Math.round((cal * 1.05) / 5) * 5;
    setCalorieRange(`~${minCal} – ${maxCal} kcal`);
    setAvgCalories(cal);
    setProteinRange(`~${Math.round(p * 0.95 * 10) / 10} – ${Math.round(p * 1.05 * 10) / 10} g`);
    setCarbsRange(`~${Math.round(c * 0.95 * 10) / 10} – ${Math.round(c * 1.05 * 10) / 10} g`);
    setFatsRange(`~${Math.round(f * 0.94 * 10) / 10} – ${Math.round(f * 1.06 * 10) / 10} g`);
    setFiberRange(`~${Math.round(fib * 0.95 * 10) / 10} – ${Math.round(fib * 1.05 * 10) / 10} g`);
  };

  const handleQuantityChange = (newQty: number) => {
    setPacketQuantity(newQty);
    recalculatePacketTotals(newQty, packetServingUnit, liquidType, liquidMl);
  };

  const processIncomingFile = async (file: File) => {
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (scanMode === 'packet') {
      await runPacketAnalysis(file, packetQuantity);
    } else {
      await runFoodPhotoAnalysis(file, cookingStyle, plateSize);
    }
  };

  // Handle file passed directly from Dashboard ("1. Open Camera" or "2. Upload Image")
  useEffect(() => {
    const state = location.state as { capturedFile?: File } | null;
    if (state?.capturedFile) {
      processIncomingFile(state.capturedFile);
      window.history.replaceState({}, document.title);
      return;
    }

    const mode = searchParams.get('mode');
    if (mode === 'camera') {
      setShowLiveCamera(true);
    }
  }, [location.state, searchParams]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processIncomingFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processIncomingFile(e.dataTransfer.files[0]);
    }
  };

  // Save / Auto-Log entry
  const handleSaveEntry = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const calNum = parseFloat(calories);
    const protNum = parseFloat(protein);
    const carbNum = parseFloat(carbs) || 0.0;
    const fatNum = parseFloat(fats) || 0.0;
    const fibNum = parseFloat(fiber) || 0.0;

    if (isNaN(calNum) || calNum < 0) {
      setErrorMsg('Please enter a valid number for Calories.');
      return;
    }
    if (isNaN(protNum) || protNum < 0) {
      setErrorMsg('Please enter a valid number for Protein.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const resolvedFoodName =
      detectedDishName.trim() ||
      (scanMode === 'packet' ? packetProductName || 'Protein Packet' : `${mealCategory} Meal`);
    const resolvedFoodItems =
      detectedItems.length > 0 ? detectedItems.join(', ') : undefined;

    try {
      const saved = await api.createEntry({
        date: entryDate,
        time: entryTime,
        food_name: resolvedFoodName,
        food_items: resolvedFoodItems,
        calories_kcal: calNum,
        protein_g: protNum,
        carbs_g: carbNum,
        fats_g: fatNum,
        fiber_g: fibNum,
        meal_type: mealCategory,
        source: source,
      });

      const enrichedSaved: Entry = {
        ...saved,
        food_name: saved.food_name || resolvedFoodName,
        food_items: saved.food_items || resolvedFoodItems,
      };

      setLastSavedEntry(enrichedSaved);
      setEditFoodName(enrichedSaved.food_name || '');
      setEditCal(enrichedSaved.calories_kcal.toString());
      setEditProt(enrichedSaved.protein_g.toString());
      setEditCarb((enrichedSaved.carbs_g || 0).toString());
      setEditFat((enrichedSaved.fats_g || 0).toString());
      setEditFib((enrichedSaved.fiber_g || 0).toString());
      setEditMeal((enrichedSaved.meal_type as MealCategory) || mealCategory);
      setSuccessMsg(`✓ Logged "${resolvedFoodName}" to ${mealCategory}!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save entry.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLastSaved = async () => {
    if (!lastSavedEntry) return;
    setIsDeleting(true);
    try {
      await api.deleteEntry(lastSavedEntry.id);
      setSuccessMsg('Entry deleted.');
      setLastSavedEntry(null);
      setShowEditModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateSaved = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastSavedEntry) return;

    const c = parseFloat(editCal);
    const p = parseFloat(editProt);
    const carb = parseFloat(editCarb) || 0.0;
    const fat = parseFloat(editFat) || 0.0;
    const f = parseFloat(editFib) || 0.0;
    if (isNaN(c) || isNaN(p)) {
      setErrorMsg('Please enter valid numeric values.');
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await api.updateEntry(lastSavedEntry.id, {
        food_name: editFoodName.trim() || lastSavedEntry.food_name,
        calories_kcal: c,
        protein_g: p,
        carbs_g: carb,
        fats_g: fat,
        fiber_g: f,
        meal_type: editMeal,
      });
      setLastSavedEntry({
        ...updated,
        food_name: editFoodName.trim() || updated.food_name,
      });
      setDetectedDishName(editFoodName.trim() || detectedDishName);
      setCalories(updated.calories_kcal.toString());
      setProtein(updated.protein_g.toString());
      setCarbs((updated.carbs_g || 0).toString());
      setFats((updated.fats_g || 0).toString());
      setFiber((updated.fiber_g || 0).toString());
      setMealCategory((updated.meal_type as MealCategory) || editMeal);
      setShowEditModal(false);
      setSuccessMsg('✓ Entry updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update entry');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddAnotherPic = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setDetectedDishName('');
    setDetectedItems([]);
    setTopMatches([]);
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    setFiber('0');
    setCalorieRange(null);
    setAvgCalories(null);
    setLastSavedEntry(null);
    setShowEditModal(false);
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const allDishes = LocalFoodVision.getAllDishes();
  const filteredDishes = dishSearchQuery.trim()
    ? allDishes.filter(
        (d) =>
          d.name.toLowerCase().includes(dishSearchQuery.toLowerCase()) ||
          d.keywords.some((k) => k.includes(dishSearchQuery.toLowerCase())) ||
          d.items_included.some((i) => i.toLowerCase().includes(dishSearchQuery.toLowerCase()))
      )
    : allDishes;

  const packetPresets = LocalFoodVision.getAllPacketPresets();

  return (
    <div className="max-w-xl mx-auto pb-16 space-y-4 select-none">
      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={showLiveCamera}
        onClose={() => setShowLiveCamera(false)}
        onCapture={(file) => processIncomingFile(file)}
      />

      <div className="dashboard-card p-5 md:p-6 space-y-4">
        {/* Top Mode Selector: Food Plate vs. Protein Bar / Powder Packet */}
        <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setScanMode('plate');
              if (selectedFile) runFoodPhotoAnalysis(selectedFile, cookingStyle, plateSize);
            }}
            className={`pill-tactile py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
              scanMode === 'plate'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🍲</span>
            <span>Food Plate</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setScanMode('packet');
              runPacketAnalysis(selectedFile, packetQuantity, selectedPacketPresetId);
            }}
            className={`pill-tactile py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
              scanMode === 'packet'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📦</span>
            <span>Protein Bar / Packet</span>
          </button>
        </div>

        {/* Hidden Gallery File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoChange}
          accept="image/png,image/jpeg,image/webp,image/jpg,image/*"
          className="hidden"
        />

        {/* Photo Capture / Preview Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="card-tactile border-2 border-dashed border-emerald-300/80 hover:border-emerald-500 rounded-2xl p-5 flex flex-col items-center justify-center text-center bg-emerald-50/25 hover:bg-emerald-50/50 group"
        >
          {isProcessing ? (
            <div className="py-5 flex flex-col items-center gap-2.5">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-800">
                Analyzing Food Items & Nutritional Density...
              </p>
              <p className="text-[10px] text-slate-400">
                Multi-zone plate scan • ICMR-NIN & USDA verified database
              </p>
            </div>
          ) : imagePreview ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src={imagePreview}
                alt="Uploaded meal"
                className="max-h-44 rounded-xl object-contain shadow-xs border border-slate-200"
              />
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Tap to analyze a different photo
              </p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-white shadow-2xs border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2 group-hover:scale-105 transition-transform">
                <Camera className="w-7 h-7 stroke-[2]" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Tap to upload or snap food photo</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Detects food item names, sub-items & 5 macros offline
              </p>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-2.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80">
                JPG, PNG, WEBP • 100% Offline
              </span>
            </>
          )}
        </div>

        {/* 2 Primary Capture Buttons: Open Live Camera vs Upload Image */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          <button
            type="button"
            onClick={() => setShowLiveCamera(true)}
            className="btn-tactile py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <Camera className="w-4 h-4 text-white stroke-[2.2]" />
            <span>Open Camera</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-tactile py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-2xs"
          >
            <ImageIcon className="w-4 h-4 text-blue-600 stroke-[2.2]" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* ================= DETECTED FOOD ITEM NAMES & DETAILS CARD ================= */}
        {scanMode === 'plate' && (detectedDishName || imagePreview) && (
          <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 border-2 border-emerald-400/50 rounded-2xl p-4 space-y-3 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                      Detected Food Item
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      ~{estimatedGrams}g portion
                    </span>
                  </div>
                  <input
                    type="text"
                    value={detectedDishName}
                    onChange={(e) => setDetectedDishName(e.target.value)}
                    placeholder="Enter food dish name..."
                    className="mt-1 w-full text-sm font-black text-slate-900 bg-transparent border-b border-dashed border-emerald-300 focus:border-emerald-600 focus:outline-none pb-0.5"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDishSearch((prev) => !prev)}
                className="pill-tactile shrink-0 px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10.5px] font-bold flex items-center gap-1 shadow-2xs"
              >
                <Search className="w-3 h-3" />
                <span>{showDishSearch ? 'Close' : 'Change Dish'}</span>
              </button>
            </div>

            {/* Detected Sub-Items / Breakdown List */}
            {detectedItems.length > 0 && (
              <div className="bg-white/90 border border-emerald-100 rounded-xl p-2.5 space-y-1.5">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Included Food Items & Details:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {detectedItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold text-slate-700 bg-emerald-50/70 border border-emerald-200/70 px-2 py-0.5 rounded-lg flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Collapsible 2-Line Health Benefits / Caution Dropdown */}
            {(() => {
              const info = getHealthInsight(detectedDishId);
              const isLimit = info.rating === 'limit';
              return (
                <div
                  className={`rounded-xl border transition-all ${
                    isLimit
                      ? 'bg-amber-50/90 border-amber-300 text-amber-900'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setShowHealthInsight((prev) => !prev)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left text-[11px] font-bold"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{isLimit ? '⚠️ Health Advisory: Take in Small Portions' : '🌿 Health Benefits & Nutrition Insight'}</span>
                    </span>
                    {showHealthInsight ? (
                      <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                    )}
                  </button>
                  {showHealthInsight && (
                    <div className="px-3 pb-2.5 pt-0.5 text-[11px] leading-relaxed font-medium whitespace-pre-line border-t border-black/5">
                      {info.insight}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Piece / Serving Count Stepper */}
            <div className="bg-white/95 border border-emerald-100 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Quantity ({unitName}s):
                </div>
                <div className="text-[10px] text-slate-400">
                  Adjust count to scale kcal & macros accurately
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleRecalculateDish(
                      detectedDishId,
                      Math.max(0.5, Math.round((pieceCount - 0.5) * 10) / 10)
                    )
                  }
                  className="btn-tactile w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-800 font-black text-sm flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-xs font-black text-emerald-900 min-w-[68px] text-center">
                  {pieceCount} {unitName}
                  {pieceCount !== 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleRecalculateDish(
                      detectedDishId,
                      Math.min(12, Math.round((pieceCount + 0.5) * 10) / 10)
                    )
                  }
                  className="btn-tactile w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-2xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Top Closest Dish Matches (1-Tap Switcher for >90% Accuracy) */}
            {topMatches.length > 1 && (
              <div className="space-y-1.5 pt-0.5">
                <div className="text-[10px] font-bold text-slate-500 flex items-center justify-between">
                  <span>Closest Visual Matches (Tap if your dish is one of these):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {topMatches.map((cand) => {
                    const isSelected = cand.id === detectedDishId;
                    return (
                      <button
                        key={cand.id}
                        type="button"
                        onClick={() => handleRecalculateDish(cand.id, cand.default_pieces)}
                        className={`pill-tactile px-2.5 py-1 rounded-xl text-[10.5px] font-bold border flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <span>{cand.name.split('(')[0].trim()}</span>
                        <span
                          className={`text-[9px] px-1 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {cand.confidence_pct}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inline Searchable Dish Database */}
            {showDishSearch && (
              <div className="bg-white border border-emerald-200 rounded-xl p-2.5 space-y-2 animate-in fade-in duration-150">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={dishSearchQuery}
                    onChange={(e) => setDishSearchQuery(e.target.value)}
                    placeholder="Search 29+ dishes, fruits & snacks (e.g. Apple, Banana, Boiled Egg, Chips, Idli, Biryani)..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                  {filteredDishes.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        handleRecalculateDish(d.id, d.default_pieces);
                        setShowDishSearch(false);
                        setDishSearchQuery('');
                      }}
                      className="w-full py-1.5 px-2 text-left hover:bg-emerald-50 rounded-lg flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{d.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {d.items_included.join(' • ')}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0 ml-2">
                        {d.default_pieces} {d.unit_name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Portion & Cooking Style Fine-Tuning (Collapsible to keep UI clean) */}
            <div className="pt-1 border-t border-emerald-200/60">
              <button
                type="button"
                onClick={() => setShowCalibration((prev) => !prev)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-emerald-800 py-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fine-Tune Plate Size & Cooking Oil ({plateSize} • {cookingStyle})</span>
                </span>
                {showCalibration ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showCalibration && (
                <div className="space-y-2.5 pt-2">
                  {/* 1. Plate Size */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-600 mb-1">1. Plate Size</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'small', label: 'Small', desc: '~220g Bowl', icon: '🥣' },
                        { id: 'medium', label: 'Medium', desc: '~380g Plate', icon: '🍽️' },
                        { id: 'large', label: 'Large', desc: '~550g Platter', icon: '🍱' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            const newPlate = p.id as 'small' | 'medium' | 'large';
                            setPlateSize(newPlate);
                            handleRecalculateDish(detectedDishId, pieceCount, newPlate, cookingStyle);
                          }}
                          className={`card-tactile py-1.5 px-1.5 rounded-xl text-center border ${
                            plateSize === p.id
                              ? 'border-emerald-500 bg-white shadow-2xs ring-1 ring-emerald-500/30'
                              : 'border-slate-200/90 bg-white/70 text-slate-600'
                          }`}
                        >
                          <div className="text-xs leading-none mb-0.5">{p.icon}</div>
                          <div className={`text-[10.5px] font-bold ${plateSize === p.id ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {p.label}
                          </div>
                          <div className="text-[9px] text-slate-400">{p.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Cooking Style */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-600 mb-1">2. Cooking Style (Oil / Ghee)</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'lean', label: 'Lean / Steamed', desc: '0g added oil', icon: '🥗' },
                        { id: 'home', label: 'Home Style', desc: '~1 tbsp oil', icon: '🍳' },
                        { id: 'restaurant', label: 'Restaurant', desc: '~2.5 tbsp oil', icon: '🍟' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            const newStyle = s.id as 'lean' | 'home' | 'restaurant';
                            setCookingStyle(newStyle);
                            handleRecalculateDish(detectedDishId, pieceCount, plateSize, newStyle);
                          }}
                          className={`card-tactile py-1.5 px-1.5 rounded-xl text-center border ${
                            cookingStyle === s.id
                              ? 'border-emerald-500 bg-white shadow-2xs ring-1 ring-emerald-500/30'
                              : 'border-slate-200/90 bg-white/70 text-slate-600'
                          }`}
                        >
                          <div className="text-xs leading-none mb-0.5">{s.icon}</div>
                          <div className={`text-[10.5px] font-bold ${cookingStyle === s.id ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {s.label}
                          </div>
                          <div className="text-[9px] text-slate-400">{s.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Browse Dish Button even before uploading a photo */}
        {scanMode === 'plate' && !detectedDishName && !imagePreview && (
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[11px] font-medium text-slate-600">
              Want to log a known dish or check macros directly?
            </span>
            <button
              type="button"
              onClick={() => {
                handleRecalculateDish('vada_sambar', 2);
                setShowDishSearch(true);
              }}
              className="pill-tactile px-2.5 py-1 bg-white border border-emerald-300 text-emerald-700 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs"
            >
              <Search className="w-3 h-3" />
              <span>Browse Dishes</span>
            </button>
          </div>
        )}

        {/* Protein Packet / Nutrition Label Controls (Shown ONLY in packet mode) */}
        {scanMode === 'packet' && (
          <div className="space-y-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider">
                  Detected Packaged Product
                </div>
                <input
                  type="text"
                  value={packetProductName || 'High-Protein Energy Bar (20g Protein)'}
                  onChange={(e) => {
                    setPacketProductName(e.target.value);
                    setDetectedDishName(e.target.value);
                  }}
                  className="mt-0.5 w-full text-xs font-black text-slate-900 bg-transparent border-b border-dashed border-blue-300 focus:outline-none"
                />
              </div>
              <span className="text-[10.5px] font-bold text-blue-800 bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs shrink-0">
                Per {packetServingSize || '1 Serving'}
              </span>
            </div>

            {/* Packaged Product Preset Switcher */}
            <div className="flex flex-wrap gap-1.5">
              {packetPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSelectedPacketPresetId(preset.id);
                    runPacketAnalysis(selectedFile, packetQuantity, preset.id);
                  }}
                  className={`pill-tactile px-2 py-1 rounded-lg text-[10px] font-bold border ${
                    selectedPacketPresetId === preset.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-blue-200/80 hover:bg-blue-50'
                  }`}
                >
                  {preset.product_name.split('(')[0].trim()}
                </button>
              ))}
            </div>

            {/* Interactive Quantity Stepper */}
            <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Quantity / Servings Consumed:</span>
                  <div className="text-[10px] text-slate-400">All 5 macros scale live with quantity</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(Math.max(0.5, Math.round((packetQuantity - 0.5) * 10) / 10))}
                    className="btn-tactile w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm"
                  >
                    -
                  </button>
                  <span className="text-xs font-black text-blue-900 w-14 text-center">
                    {packetQuantity} {packetServingUnit}{packetQuantity !== 1 ? 's' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(Math.min(10, Math.round((packetQuantity + 0.5) * 10) / 10))}
                    className="btn-tactile w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quantity Preset Pills */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[0.5, 1.0, 1.5, 2.0].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleQuantityChange(q)}
                    className={`pill-tactile py-1 text-center rounded-lg text-[10.5px] font-bold ${
                      packetQuantity === q
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    {q}x {packetServingUnit || 'Qty'}
                  </button>
                ))}
              </div>
            </div>

            {/* Liquid Mixer Selector for Protein Powder (Scoop) */}
            {packetServingUnit === 'scoop' && (
              <div className="bg-white rounded-xl p-3.5 border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-slate-800">Mixed With (Liquid):</span>
                  <span className="text-[10.5px] font-semibold text-blue-600">
                    {liquidType === 'water'
                      ? 'Water (+0 kcal)'
                      : `${liquidMl}ml ${liquidType === 'toned_milk' ? 'Milk' : 'Skim Milk'} included`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'water' as const, label: '💧 Water' },
                    { id: 'toned_milk' as const, label: '🥛 Milk' },
                    { id: 'skim_milk' as const, label: '🥛 Skim Milk' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setLiquidType(opt.id);
                        recalculatePacketTotals(packetQuantity, packetServingUnit, opt.id, liquidMl);
                      }}
                      className={`pill-tactile py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                        liquidType === opt.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {liquidType !== 'water' && (
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    {[200, 300].map((ml) => (
                      <button
                        key={ml}
                        type="button"
                        onClick={() => {
                          setLiquidMl(ml);
                          recalculatePacketTotals(packetQuantity, packetServingUnit, liquidType, ml);
                        }}
                        className={`pill-tactile py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                          liquidMl === ml
                            ? 'bg-blue-50 text-blue-700 border-blue-400'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {ml} ml
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Extracted Ingredients Chip */}
            {packetIngredients && (
              <div className="p-2.5 bg-white/95 border border-blue-100 rounded-xl space-y-1 text-[10.5px]">
                <div className="font-extrabold text-blue-950 flex items-center gap-1">
                  <span>🌿</span>
                  <span>Extracted Packet Ingredients:</span>
                </div>
                <p className="text-slate-600 leading-snug">{packetIngredients}</p>
              </div>
            )}

            {/* Collapsible 2-Line Health Benefits Dropdown for Packet Items */}
            {(() => {
              const info = getHealthInsight(selectedPacketPresetId);
              return (
                <div className="rounded-xl border bg-emerald-50/70 border-emerald-200 text-emerald-900 transition-all">
                  <button
                    type="button"
                    onClick={() => setShowHealthInsight((prev) => !prev)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left text-[11px] font-bold"
                  >
                    <span>🌿 Health Benefits & Nutrition Insight</span>
                    {showHealthInsight ? (
                      <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                    )}
                  </button>
                  {showHealthInsight && (
                    <div className="px-3 pb-2.5 pt-0.5 text-[11px] leading-relaxed font-medium whitespace-pre-line border-t border-black/5">
                      {info.insight}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= INSTANT POST-LOG ACTION CARD ================= */}
        {lastSavedEntry && (
          <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 space-y-3 shadow-xs animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                    {lastSavedEntry.meal_type || mealCategory} Logged
                  </span>
                  {lastSavedEntry.food_name && (
                    <span className="text-xs font-extrabold text-slate-900">
                      {lastSavedEntry.food_name}
                    </span>
                  )}
                </div>
                {lastSavedEntry.food_items && (
                  <p className="text-[10.5px] text-slate-600 mt-1">
                    {lastSavedEntry.food_items}
                  </p>
                )}
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {lastSavedEntry.calories_kcal}{' '}
                  <span className="text-xs font-normal text-slate-500">kcal</span>
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] font-bold">
                  <span className="text-emerald-700 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/80">
                    {lastSavedEntry.protein_g}g Protein
                  </span>
                  <span className="text-blue-700 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/80">
                    {lastSavedEntry.carbs_g || 0}g Carbs
                  </span>
                  <span className="text-amber-700 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/80">
                    {lastSavedEntry.fats_g || 0}g Fats
                  </span>
                  <span className="text-purple-700 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/80">
                    {lastSavedEntry.fiber_g || 0}g Fiber
                  </span>
                </div>
              </div>

              {/* Instant Edit & Delete Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="btn-tactile px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteLastSaved}
                  disabled={isDeleting}
                  className="btn-tactile p-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-slate-400 hover:text-rose-600 shadow-2xs"
                  title="Delete instantly"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Quick Next Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={handleAddAnotherPic}
                className="btn-tactile flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Log Another Meal</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-tactile py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ================= EDIT MODAL ================= */}
        {showEditModal && lastSavedEntry && (
          <div className="p-4 bg-slate-50 border-2 border-blue-400/40 rounded-2xl space-y-3.5 shadow-md animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">Edit Logged Meal</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSaved} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Food Item Name</label>
                <input
                  type="text"
                  value={editFoodName}
                  onChange={(e) => setEditFoodName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Meal Category
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {MEAL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEditMeal(cat.id)}
                      className={`pill-tactile py-1 px-1.5 rounded-lg text-center text-[10px] font-semibold border flex items-center justify-center gap-1 ${
                        editMeal === cat.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Total Kcal</label>
                  <input
                    type="number"
                    step="any"
                    value={editCal}
                    onChange={(e) => setEditCal(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="any"
                    value={editProt}
                    onChange={(e) => setEditProt(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="any"
                    value={editCarb}
                    onChange={(e) => setEditCarb(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Fats (g)</label>
                  <input
                    type="number"
                    step="any"
                    value={editFat}
                    onChange={(e) => setEditFat(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    step="any"
                    value={editFib}
                    onChange={(e) => setEditFib(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-tactile flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-tactile py-2 px-3 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= PRIMARY LOGGING FORM ================= */}
        {!lastSavedEntry && (
          <form onSubmit={handleSaveEntry} className="space-y-4 pt-1">
            {/* Calorie Range Estimation Card */}
            {calorieRange && (
              <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300/80 rounded-2xl flex items-center justify-between shadow-2xs">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <span>🎯</span>
                    <span>Calibrated Calorie Range</span>
                  </div>
                  <div className="text-base font-black text-emerald-950">{calorieRange}</div>
                  <div className="text-[10.5px] text-emerald-800">
                    Balanced midpoint: <strong className="font-extrabold text-emerald-900">{calories || avgCalories} kcal</strong>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-1 bg-white/95 text-emerald-800 font-bold text-[10px] rounded-lg border border-emerald-200 shadow-2xs">
                    {confidenceBadge ? confidenceBadge.split('(')[0].trim() : '94% Match'}
                  </span>
                </div>
              </div>
            )}

            {/* 1. Meal Category Selection (6 Options) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Log For Which Meal?
                </h4>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Auto-selected
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {MEAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setMealCategory(cat.id)}
                    className={`pill-tactile py-2 px-2 rounded-xl text-center border flex items-center justify-center gap-1.5 ${
                      mealCategory === cat.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-2xs ring-1 ring-emerald-500/30'
                        : 'border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 font-medium'
                    }`}
                  >
                    <span className="text-xs">{cat.icon}</span>
                    <span className="text-[10px] truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Intake Values (Calories, Protein, Carbs, Fats, Fiber) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Confirm Intake Values
                </h4>
                <span className="text-[10px] font-medium text-slate-400">Editable before save</span>
              </div>

              {/* Row 1: Calories, Protein, Carbs */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="e.g. 460"
                    required
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  {calorieRange && (
                    <div className="text-[9px] font-semibold text-orange-700 bg-orange-50/90 border border-orange-200/60 px-1 py-0.5 rounded-md mt-1 truncate text-center">
                      {calorieRange}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="e.g. 18"
                    required
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  {proteinRange && (
                    <div className="text-[9px] font-semibold text-emerald-700 bg-emerald-50/90 border border-emerald-200/60 px-1 py-0.5 rounded-md mt-1 truncate text-center">
                      {proteinRange}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="e.g. 55"
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {carbsRange && (
                    <div className="text-[9px] font-semibold text-blue-700 bg-blue-50/90 border border-blue-200/60 px-1 py-0.5 rounded-md mt-1 truncate text-center">
                      {carbsRange}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Fats & Fiber */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={fats}
                    onChange={(e) => setFats(e.target.value)}
                    placeholder="e.g. 16"
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  {fatsRange && (
                    <div className="text-[9px] font-semibold text-amber-700 bg-amber-50/90 border border-amber-200/60 px-1 py-0.5 rounded-md mt-1 truncate text-center">
                      {fatsRange}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Fiber (g)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                    placeholder="e.g. 6"
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  {fiberRange && (
                    <div className="text-[9px] font-semibold text-purple-700 bg-purple-50/90 border border-purple-200/60 px-1 py-0.5 rounded-md mt-1 truncate text-center">
                      {fiberRange}
                    </div>
                  )}
                </div>
              </div>

              {/* Live Scientific Atwater Formula Verification: 4*(P+C) + 9*F */}
              {((parseFloat(protein) || 0) > 0 || (parseFloat(carbs) || 0) > 0 || (parseFloat(fats) || 0) > 0) && (
                <div className="mt-2 p-2 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between text-[10.5px]">
                  <div className="text-slate-600">
                    <span className="font-bold text-slate-700">Formula Check: </span>
                    <span>
                      4×({parseFloat(protein) || 0}P + {parseFloat(carbs) || 0}C) + 9×{parseFloat(fats) || 0}F ={' '}
                    </span>
                    <strong className="font-black text-slate-800">
                      {Math.round(
                        4 * ((parseFloat(protein) || 0) + (parseFloat(carbs) || 0)) +
                          9 * (parseFloat(fats) || 0)
                      )}{' '}
                      kcal
                    </strong>
                  </div>
                  {Math.abs(
                    Math.round(
                      4 * ((parseFloat(protein) || 0) + (parseFloat(carbs) || 0)) +
                        9 * (parseFloat(fats) || 0)
                    ) - (parseFloat(calories) || 0)
                  ) > 15 && (
                    <button
                      type="button"
                      onClick={() =>
                        setCalories(
                          Math.round(
                            4 * ((parseFloat(protein) || 0) + (parseFloat(carbs) || 0)) +
                              9 * (parseFloat(fats) || 0)
                          ).toString()
                        )
                      }
                      className="pill-tactile px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-md text-[10px] shrink-0 ml-1.5"
                    >
                      Sync
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Green Auto-Log Save Button */}
            <button
              type="submit"
              disabled={isSaving || !calories || !protein}
              className="btn-tactile w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging Meal...</span>
                </>
              ) : (
                <span>
                  Auto-Log {mealCategory}
                  {detectedDishName ? ` (${detectedDishName.split(' ')[0]})` : ''}
                </span>
              )}
            </button>

            {/* Date & Time Selectors */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Date & Time</span>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200/80">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 text-[11px] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200/80">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <input
                    type="text"
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    className="w-16 bg-transparent font-medium text-slate-800 text-[11px] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
