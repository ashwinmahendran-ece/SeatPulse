import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, LayoutGrid, DollarSign, Tag, Loader2, Info, Eraser } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/seatPulseApi';
import type { SeatPlanItem } from '../types';

export default function SeatingBuilderPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Fetch Event Capacity (Safely pulls from your Event table, not the Seat table)
  const { data: events = [] } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api.events.getAll(),
  });
  const currentEvent = Array.isArray(events) ? events.find((e: any) => e.eventId === Number(eventId)) : null;
  const formSeatCount = currentEvent?.totalSeats || 0;

  // 2. Fetch Existing Seats
  const { data: existingSeats = [], isSuccess: isExistingLoaded } = useQuery({
    queryKey: ['event-seats', eventId],
    queryFn: () => api.seats.getForEvent(Number(eventId)),
    enabled: !!eventId
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState('REGULAR');
  const [bulkPrice, setBulkPrice] = useState('500');
  const [seatMap, setSeatMap] = useState<SeatPlanItem[]>([]);

  // 3. INITIALIZE 10x10 BLANK GRID OR LOAD CUSTOM SAVED GRID
  useEffect(() => {
    if (!hasInitialized && isExistingLoaded) {
      const hasSavedPathways = existingSeats.some((s: any) => (s.seatCategory === 'BLOCKED' || s.category === 'BLOCKED'));
      const isCustomLayout = existingSeats.length > 0 && hasSavedPathways;

      if (isCustomLayout) {
        // Restore custom layout from backend
        const loadedCols = 10;
        const loadedRows = Math.ceil(existingSeats.length / loadedCols) || 10;
        setCols(loadedCols);
        setRows(loadedRows);

        const restoredMap = existingSeats.map((seat: any) => ({
          seatNo: seat.seatNo || 0,
          category: seat.seatCategory || seat.category || 'BLOCKED',
          price: seat.price || 0
        }));
        setSeatMap(restoredMap);
      } else {
        // Create completely blank 10x10 canvas initially
        setRows(10);
        setCols(10);
        const blankMap = Array(10 * 10).fill(null).map(() => ({
          seatNo: 0,
          category: 'BLOCKED',
          price: 0
        }));
        setSeatMap(blankMap);
      }
      setHasInitialized(true);
    }
  }, [hasInitialized, isExistingLoaded, existingSeats]);

  const handleGridResize = (newRows: number, newCols: number) => {
    setRows(newRows);
    setCols(newCols);

    const newTotal = newRows * newCols;
    const updatedMap = [...seatMap];

    if (newTotal > updatedMap.length) {
       const toAdd = newTotal - updatedMap.length;
       for(let i=0; i<toAdd; i++) updatedMap.push({ seatNo: 0, category: 'BLOCKED', price: 0 });
    } else {
       updatedMap.splice(newTotal);
    }
    setSeatMap(updatedMap);
  };

  const validSeats = seatMap.filter(s => s.category !== 'BLOCKED');

  const updateSeat = (index: number) => {
    const updated = [...seatMap];
    const currentCategory = updated[index].category;

    // TOGGLE DESELECT: Erase the seat if clicked with the matching brush
    if (currentCategory === selectedCategory && selectedCategory !== 'BLOCKED') {
      updated[index] = { ...updated[index], category: 'BLOCKED', price: 0 };
    } else {

      // CAPACITY CHECK USING FORM DATA
      const isTryingToAdd = selectedCategory !== 'BLOCKED';
      const isEmptySpace = currentCategory === 'BLOCKED';

      if (isTryingToAdd && isEmptySpace) {
        if (formSeatCount > 0 && validSeats.length >= formSeatCount) {
          toast.error(`Limit Reached! Maximum event capacity is ${formSeatCount}.`);
          return;
        }
      }

      // PAINT THE SEAT
      updated[index] = {
        ...updated[index],
        category: selectedCategory,
        price: isTryingToAdd ? (Number(bulkPrice) || 0) : 0
      };
    }

    // SEQUENTIAL RENUMBERING
    let currentNumber = 1;
    updated.forEach(seat => {
      if (seat.category !== 'BLOCKED') {
        seat.seatNo = currentNumber++;
      } else {
        seat.seatNo = 0;
      }
    });

    setSeatMap(updated);
  };

  const handleSave = async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      await api.events.saveSeatingPlan(Number(eventId), seatMap);
      toast.success('Seating plan saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-events', 'event-seats'] });
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save seating plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-indigo-500/30">

      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 lg:px-16">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors font-semibold text-sm">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Layout
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-5 pt-8 lg:px-16 flex flex-col xl:flex-row gap-8">

        <aside className="w-full xl:w-80 flex-shrink-0 space-y-6">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white mb-2">
              Seating Canvas
            </h1>
            <p className="text-slate-400 text-sm">Design the venue layout and configure pricing tiers.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-indigo-400" /> Dimensions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Rows</label>
                  <input
                    type="number"
                    min="1" max="50"
                    value={rows}
                    onChange={(e) => handleGridResize(Number(e.target.value), cols)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Columns</label>
                  <input
                    type="number"
                    min="1" max="50"
                    value={cols}
                    onChange={(e) => handleGridResize(rows, Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-800 w-full"></div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" /> Active Paintbrush
              </h3>
              <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="BALCONY">Balcony</option>
                    <option value="BLOCKED">🛑 Pathway / Empty</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Price (₹)
                  </label>
                  <input
                    type="number"
                    value={bulkPrice}
                    disabled={selectedCategory === 'BLOCKED'}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Select your category and click an empty space to add a seat. Click an existing seat with the same brush to erase it.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl p-8 overflow-auto min-h-[600px] flex flex-col items-center justify-start relative custom-scrollbar">

          <div className="w-3/4 h-8 bg-slate-800 rounded-t-3xl border-t border-x border-slate-700 mb-12 flex items-center justify-center shadow-[0_-10px_30px_rgba(255,255,255,0.05)]">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stage</span>
          </div>

          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {seatMap.map((seat, index) => {
              const isVIP = seat.category === 'VIP';
              const isBalcony = seat.category === 'BALCONY';
              const isBlocked = seat.category === 'BLOCKED';

              return (
                <button
                  key={index}
                  onClick={() => updateSeat(index)}
                  className={`w-10 h-10 flex items-center justify-center text-[10px] font-bold transition-all hover:-translate-y-1 hover:shadow-lg ${
                    isBlocked
                      ? 'border-2 border-dashed border-slate-700 bg-slate-900/30 text-slate-600 rounded-md hover:bg-slate-800 hover:text-slate-400 hover:border-slate-500'
                      : isVIP
                      ? 'border-b-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/40 rounded-t-xl rounded-b-md hover:bg-emerald-500/30'
                      : isBalcony
                      ? 'border-b-4 bg-amber-500/20 text-amber-400 border-amber-500/40 rounded-t-xl rounded-b-md hover:bg-amber-500/30'
                      : 'border-b-4 bg-indigo-500/20 text-indigo-400 border-indigo-500/40 rounded-t-xl rounded-b-md hover:bg-indigo-500/30'
                  }`}
                  title={isBlocked ? 'Empty Space' : `${seat.category} - ₹${seat.price}`}
                >
                  {isBlocked ? <Eraser className="w-4 h-4 opacity-30" /> : seat.seatNo}
                </button>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}