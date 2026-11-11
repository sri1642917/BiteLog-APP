import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Info,
  Edit3,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { Entry } from '../types';

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
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Auto-launch camera or file picker if launched via Dashboard 2-option sheet
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'camera') {
      setTimeout(() => cameraInputRef.current?.click(), 200);
    } else if (mode === 'upload') {
      setTimeout(() => fileInputRef.current?.click(), 200);
    }
  }, [searchParams]);

  // Food Photo AI options (Google Gemma 3n + 90% Calibrated Accuracy Engine)
  const [modelTier, setModelTier] = useState<'e2b' | 'e4b'>('e2b');
  const [plateSize, setPlateSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [cookingStyle, setCookingStyle] = useState<'lean' | 'home' | 'restaurant'>('home');
  const [portionSize, setPortionSize] = useState<'small' | 'normal' | 'large'>('normal');
  const [aiDisclaimer, setAiDisclaimer] = useState<string | null>(null);
  const [aiModelUsed, setAiModelUsed] = useState<string | null>(null);

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
  const [note, setNote] = useState<string | null>(null);

  // Post-log action states
  const [lastSavedEntry, setLastSavedEntry] = useState<Entry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
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
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const [entryDate, setEntryDate] = useState<string>(todayStr);
  const [entryTime, setEntryTime] = useState<string>(timeStr);

  // State indicators
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Food Photo AI analysis (Google Gemma 3n E2B / E4B + 90% Calibration Engine)
  const runFoodPhotoAnalysis = async (
    file: File,
    tier: 'e2b' | 'e4b' = modelTier,
    portion: 'small' | 'normal' | 'large' = portionSize,
    cooking: 'lean' | 'home' | 'restaurant' = cookingStyle,
    plate: 'small' | 'medium' | 'large' = plateSize
  ) => {
    setErrorMsg(null);
    setNote(null);
    setIsProcessing(true);

    try {
      const res = await api.parseFoodPhoto(file, tier, portion, cooking, plate);
      setSource('Image');
      setCalories(res.calories_kcal.toString());
      setProtein(res.protein_g.toString());
      setCarbs(
        res.carbs_g !== undefined && res.carbs_g !== null
          ? res.carbs_g.toString()
          : Math.max(0, Math.round((res.calories_kcal - (res.protein_g * 4 + 20 * 9)) / 4)).toString()
      );
      setFats(
        res.fats_g !== undefined && res.fats_g !== null
          ? res.fats_g.toString()
          : '20'
      );
      setFiber(
        res.fiber_g !== undefined && res.fiber_g !== null
          ? res.fiber_g.toString()
          : '4'
      );
      if (res.calorie_range_str) {
        setCalorieRange(res.calorie_range_str);
        setAvgCalories(res.calories_kcal);
      }
      const pNum = res.protein_g;
      const cNum = res.carbs_g;
      const fNum = res.fats_g;
      const fibNum = res.fiber_g;
      setProteinRange(res.protein_range_str || `~${Math.round(pNum * 0.9)} – ${Math.round(pNum * 1.1)} g`);
      setCarbsRange(res.carbs_range_str || `~${Math.round(cNum * 0.9)} – ${Math.round(cNum * 1.1)} g`);
      setFatsRange(res.fats_range_str || `~${Math.round(fNum * 0.88)} – ${Math.round(fNum * 1.12)} g`);
      setFiberRange(res.fiber_range_str || `~${Math.round(fibNum * 0.9)} – ${Math.round(fibNum * 1.1)} g`);
      setNote(`${res.confidence_level} • ${res.portion_notes}`);
      setAiDisclaimer(res.disclaimer);
      setAiModelUsed(res.model_used);
      setLastSavedEntry(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze food plate offline.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    await runFoodPhotoAnalysis(file, modelTier, portionSize, cookingStyle, plateSize);
  };

  // Handle Drag & Drop for Food Photo
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (fileInputRef.current) fileInputRef.current.files = e.dataTransfer.files;
      handlePhotoChange({ target: { files: e.dataTransfer.files } } as any);
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

    try {
      const saved = await api.createEntry({
        date: entryDate,
        time: entryTime,
        calories_kcal: calNum,
        protein_g: protNum,
        carbs_g: carbNum,
        fats_g: fatNum,
        fiber_g: fibNum,
        meal_type: mealCategory,
        source: source,
      });

      setLastSavedEntry(saved);
      setEditCal(saved.calories_kcal.toString());
      setEditProt(saved.protein_g.toString());
      setEditCarb((saved.carbs_g || 0).toString());
      setEditFat((saved.fats_g || 0).toString());
      setEditFib((saved.fiber_g || 0).toString());
      setEditMeal((saved.meal_type as MealCategory) || mealCategory);
      setSuccessMsg(`✓ Successfully Logged to ${mealCategory}!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save entry.');
    } finally {
      setIsSaving(false);
    }
  };

  // Instant Delete for recently saved entry
  const handleDeleteLastSaved = async () => {
    if (!lastSavedEntry) return;
    setIsDeleting(true);
    try {
      await api.deleteEntry(lastSavedEntry.id);
      setSuccessMsg('Entry deleted instantly.');
      setLastSavedEntry(null);
      setShowEditModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  // Instant Edit for recently saved entry
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
        calories_kcal: c,
        protein_g: p,
        carbs_g: carb,
        fats_g: fat,
        fiber_g: f,
        meal_type: editMeal,
      });
      setLastSavedEntry(updated);
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

  // Add one more pic instantly (resets photo picker)
  const handleAddAnotherPic = () => {
    setSelectedFile(null);
    setImagePreview(null);
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
    setNote(null);
    setAiDisclaimer(null);

    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    }, 150);
  };

  return (
    <div className="max-w-xl mx-auto pb-16 space-y-4">
      <div className="dashboard-card p-5 md:p-6 space-y-4">
        {/* Dedicated Food Photo Dropzone & Hidden Inputs */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handlePhotoChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoChange}
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-emerald-300/80 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-emerald-50/25 hover:bg-emerald-50/50 group"
        >
          {isProcessing ? (
            <div className="py-5 flex flex-col items-center gap-2.5">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-800">
                Analyzing Food Photo with Google Gemma 3n ({modelTier.toUpperCase()})...
              </p>
              <p className="text-[10px] text-slate-400">Estimating calories, protein, and dietary fiber</p>
            </div>
          ) : imagePreview ? (
            <div className="flex flex-col items-center gap-2.5">
              <img
                src={imagePreview}
                alt="Uploaded meal"
                className="max-h-44 rounded-xl object-contain shadow-xs border border-slate-200"
              />
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Tap to analyze a different food photo
              </p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-white shadow-2xs border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2 group-hover:scale-105 transition-transform">
                <Camera className="w-7 h-7 stroke-[2]" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Tap to upload or snap food photo</h4>
              <p className="text-xs text-slate-400 mt-0.5">Instant offline calorie & macro estimation</p>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-2.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80">
                JPG, PNG, WEBP • 100% Offline
              </span>
            </>
          )}
        </div>

        {/* 2 Quick Selection Buttons: Open Camera vs Upload Image */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
            <span>Open Camera</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-blue-600 stroke-[2.2]" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* 90%+ Calibrated Accuracy Controls (Plate size & Cooking style fine-tuning) */}
        <div className="space-y-3 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Fine-Tune Portion Calibration</span>
            </div>
            {/* Offline Model Tier */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setModelTier('e2b');
                  if (selectedFile) runFoodPhotoAnalysis(selectedFile, 'e2b', portionSize, cookingStyle, plateSize);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  modelTier === 'e2b' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                E2B (Fast)
              </button>
              <button
                type="button"
                onClick={() => {
                  setModelTier('e4b');
                  if (selectedFile) runFoodPhotoAnalysis(selectedFile, 'e4b', portionSize, cookingStyle, plateSize);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  modelTier === 'e4b' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                E4B (High Precision)
              </button>
            </div>
          </div>

          {/* 1. Plate Size (3 Intuitive Options: Small, Medium, Large) */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-bold text-slate-700">1. Plate Size</span>
              <span className="text-[10px] text-slate-400">Scale Reference</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'small', label: 'Small', desc: 'Bowl / Salad Plate', icon: '🥣' },
                { id: 'medium', label: 'Medium', desc: 'Standard Plate', icon: '🍽️' },
                { id: 'large', label: 'Large', desc: 'Platter / Takeout', icon: '🍱' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    const newPlate = p.id as 'small' | 'medium' | 'large';
                    setPlateSize(newPlate);
                    if (selectedFile) runFoodPhotoAnalysis(selectedFile, modelTier, portionSize, cookingStyle, newPlate);
                  }}
                  className={`py-2 px-1.5 rounded-xl text-center border transition-all ${
                    plateSize === p.id
                      ? 'border-emerald-500 bg-white shadow-sm ring-1 ring-emerald-500/30'
                      : 'border-slate-200/90 bg-white/70 hover:bg-white text-slate-600'
                  }`}
                >
                  <div className="text-sm leading-none mb-1">{p.icon}</div>
                  <div className={`text-[11px] font-bold ${plateSize === p.id ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {p.label}
                  </div>
                  <div className="text-[9px] text-slate-400 leading-tight truncate mt-0.5">
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Dynamic Plate Size Hint Banner */}
            <div className="mt-2 p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-[10.5px] text-emerald-950 flex items-start gap-1.5 shadow-2xs">
              <span className="text-sm shrink-0 mt-0.5">💡</span>
              <div className="leading-snug">
                <span className="font-extrabold text-emerald-900">
                  {plateSize === 'small' && 'Small Plate Hint (~150 – 250g):'}
                  {plateSize === 'medium' && 'Medium Plate Hint (~350 – 450g):'}
                  {plateSize === 'large' && 'Large Plate Hint (~550 – 750g+):'}
                </span>{' '}
                <span className="text-slate-700">
                  {plateSize === 'small' && 'Best for light breakfast or snacks (e.g. 2–3 Idlis, 1 Dosa, 2 eggs with toast, a fruit bowl, or soup).'}
                  {plateSize === 'medium' && 'Best for standard full meals (e.g. Standard Indian Thali, Rice with Dal & Curry, pasta bowl, or meat & veggies).'}
                  {plateSize === 'large' && 'Best for buffets, large platters & heavy takeout (e.g. Full biryani box, feast platter, or double portions).'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Cooking Style (Hidden Oil & Fat Compensation) */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-bold text-slate-700">2. Cooking Style</span>
              <span className="text-[10px] text-slate-400">Hidden Oil & Fat</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'lean', label: 'Lean / Steamed', desc: '0g added oil', icon: '🥗' },
                { id: 'home', label: 'Home Style', desc: '~1 tbsp oil', icon: '🍳' },
                { id: 'restaurant', label: 'Restaurant / Rich', desc: '~2.5 tbsp oil', icon: '🍟' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    const newStyle = s.id as 'lean' | 'home' | 'restaurant';
                    setCookingStyle(newStyle);
                    if (selectedFile) runFoodPhotoAnalysis(selectedFile, modelTier, portionSize, newStyle, plateSize);
                  }}
                  className={`py-2 px-1.5 rounded-xl text-center border transition-all ${
                    cookingStyle === s.id
                      ? 'border-emerald-500 bg-white shadow-sm ring-1 ring-emerald-500/30'
                      : 'border-slate-200/90 bg-white/70 hover:bg-white text-slate-600'
                  }`}
                >
                  <div className="text-sm leading-none mb-1">{s.icon}</div>
                  <div className={`text-[11px] font-bold ${cookingStyle === s.id ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {s.label}
                  </div>
                  <div className="text-[9px] text-slate-400 leading-tight truncate mt-0.5">
                    {s.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Dynamic Cooking Style Hint Banner */}
            <div className="mt-2 p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[10.5px] text-amber-950 flex items-start gap-1.5 shadow-2xs">
              <span className="text-sm shrink-0 mt-0.5">💡</span>
              <div className="leading-snug">
                <span className="font-extrabold text-amber-900">
                  {cookingStyle === 'lean' && 'Lean / Steamed (0g added fat):'}
                  {cookingStyle === 'home' && 'Home Style (~10–12g fat / ~1 tbsp oil):'}
                  {cookingStyle === 'restaurant' && 'Restaurant / Rich (~24g fat / ~2.5 tbsp oil):'}
                </span>{' '}
                <span className="text-slate-700">
                  {cookingStyle === 'lean' && 'Steamed idlis, boiled eggs, fresh raw fruits/salads, or oil-free grilled dishes.'}
                  {cookingStyle === 'home' && 'Standard home cooking with light tadka, homemade roti/sabzi, or shallow pan sear.'}
                  {cookingStyle === 'restaurant' && 'Deep-fried dishes (samosas, pakoras, vadas), restaurant curries with butter/cream.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Note / Disclaimer Banner */}
        {aiDisclaimer && (
          <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">{aiModelUsed}</p>
              <p className="leading-relaxed text-amber-800">{aiDisclaimer}</p>
            </div>
          </div>
        )}

        {note && !errorMsg && !aiDisclaimer && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{note}</span>
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
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                  {lastSavedEntry.meal_type || mealCategory} Logged
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {lastSavedEntry.calories_kcal} <span className="text-xs font-normal text-slate-500">kcal</span>
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
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteLastSaved}
                  disabled={isDeleting}
                  className="p-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-slate-400 hover:text-rose-600 shadow-2xs active:scale-95 transition-all"
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
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Add One More Pic</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ================= EDIT MODAL (Quick Tweak Calories, Protein, Carbs, Fats, Fiber, Category) ================= */}
        {showEditModal && lastSavedEntry && (
          <div className="p-4 bg-slate-50 border-2 border-blue-400/40 rounded-2xl space-y-3.5 shadow-md animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">Edit Logged Meal Values</h4>
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
              {/* Category selector */}
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
                      className={`py-1 px-1.5 rounded-lg text-center text-[10px] font-semibold border flex items-center justify-center gap-1 ${
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

              {/* Nutrients: Calories, Protein, Carbs, Fats, Fiber */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Total Kcal</label>
                  <input
                    type="number"
                    step="any"
                    value={editCal}
                    onChange={(e) => setEditCal(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="any"
                    value={editProt}
                    onChange={(e) => setEditProt(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="any"
                    value={editCarb}
                    onChange={(e) => setEditCarb(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    step="any"
                    value={editFib}
                    onChange={(e) => setEditFib(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="py-2 px-3 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl"
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
                    <span>Estimated Calorie Range</span>
                  </div>
                  <div className="text-base font-black text-emerald-950">
                    {calorieRange}
                  </div>
                  <div className="text-[10.5px] text-emerald-800">
                    Logged with balanced average: <strong className="font-extrabold text-emerald-900">{calories || avgCalories} kcal</strong>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-1 bg-white/95 text-emerald-800 font-bold text-[10px] rounded-lg border border-emerald-200 shadow-2xs">
                    ±8–10% Variance
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
                    className={`py-2 px-2 rounded-xl text-center border transition-all flex items-center justify-center gap-1.5 ${
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
                {/* Calories */}
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
                    <div className="text-[9px] font-semibold text-orange-700 bg-orange-50/90 border border-orange-200/60 px-1 py-0.5 rounded-md mt-1 truncate text-center" title={`Range: ${calorieRange}`}>
                      {calorieRange}
                    </div>
                  )}
                </div>

                {/* Protein */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="e.g. 10"
                    required
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  {proteinRange && (
                    <div className="text-[9px] font-semibold text-emerald-700 bg-emerald-50/90 border border-emerald-200/60 px-1 py-0.5 rounded-md mt-1 truncate text-center" title={`Range: ${proteinRange}`}>
                      {proteinRange}
                    </div>
                  )}
                </div>

                {/* Carbs */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {carbsRange && (
                    <div className="text-[9px] font-semibold text-blue-700 bg-blue-50/90 border border-blue-200/60 px-1 py-0.5 rounded-md mt-1 truncate text-center" title={`Range: ${carbsRange}`}>
                      {carbsRange}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Fats & Fiber */}
              <div className="grid grid-cols-2 gap-2">
                {/* Fats */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={fats}
                    onChange={(e) => setFats(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  {fatsRange && (
                    <div className="text-[9px] font-semibold text-amber-700 bg-amber-50/90 border border-amber-200/60 px-1 py-0.5 rounded-md mt-1 truncate text-center" title={`Range: ${fatsRange}`}>
                      {fatsRange}
                    </div>
                  )}
                </div>

                {/* Fiber */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Fiber (g)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                    placeholder="e.g. 3"
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  {fiberRange && (
                    <div className="text-[9px] font-semibold text-purple-700 bg-purple-50/90 border border-purple-200/60 px-1 py-0.5 rounded-md mt-1 truncate text-center" title={`Range: ${fiberRange}`}>
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
                    <span>4×({parseFloat(protein) || 0}P + {parseFloat(carbs) || 0}C) + 9×{parseFloat(fats) || 0}F = </span>
                    <strong className="font-black text-slate-800">
                      {Math.round(4 * ((parseFloat(protein) || 0) + (parseFloat(carbs) || 0)) + 9 * (parseFloat(fats) || 0))} kcal
                    </strong>
                  </div>
                  {Math.abs(Math.round(4 * ((parseFloat(protein) || 0) + (parseFloat(carbs) || 0)) + 9 * (parseFloat(fats) || 0)) - (parseFloat(calories) || 0)) > 15 && (
                    <button
                      type="button"
                      onClick={() => setCalories(Math.round(4 * ((parseFloat(protein) || 0) + (parseFloat(carbs) || 0)) + 9 * (parseFloat(fats) || 0)).toString())}
                      className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-md text-[10px] transition-colors shrink-0 ml-1.5"
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
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging Meal...</span>
                </>
              ) : (
                <span>Auto-Log {mealCategory}</span>
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
