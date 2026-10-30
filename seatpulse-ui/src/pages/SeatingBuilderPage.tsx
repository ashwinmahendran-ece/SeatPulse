import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, LayoutGrid, Tag, Loader2, Lock, Spline, Trash2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/seatPulseApi';
import type { SeatPlanItem } from '../types';

// Helper to convert row index to alphabet (0 = A, 1 = B, 26 = AA, etc.)
const getRowLabel = (index: number) => {
  let label = '';
  let i = index;
  while (i >= 0) {
    label = String.fromCharCode(65 + (i % 26)) + label;
    i = Math.floor(i / 26) - 1;
  }
  return label;
};

export default function SeatingBuilderPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // FIX: Properly extract the array if the backend returns a paginated object (e.g., .content or .data)
  const { data: rawEventsData } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api.events.getAll(),
  });
  const eventsList = Array.isArray(rawEventsData) ? rawEventsData : (rawEventsData?.content || rawEventsData?.data || []);
  const currentEvent = eventsList.find((e: any) => e.eventId === Number(eventId));
  const formSeatCount = currentEvent?.totalSeats || 0;

  const { data: rawSeats = [], isSuccess: isExistingLoaded } = useQuery({
    queryKey: ['event-seats', eventId],
    queryFn: () => api.seats.getForEvent(Number(eventId)),
    enabled: !!eventId
  });
  const existingSeats = Array.isArray(rawSeats) ? rawSeats : (rawSeats?.data || []);

  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(15);

  // Paintbrush State
  const [selectedCategory, setSelectedCategory] = useState('REGULAR');
  const [bulkPrice, setBulkPrice] = useState('500');

  // Bulk Row Assigner State
  const [startRow, setStartRow] = useState(0);
  const [endRow, setEndRow] = useState(2);
  const [bulkRowCategory, setBulkRowCategory] = useState('VIP');
  const [bulkRowPrice, setBulkRowPrice] = useState('2000');

  const [seatMap, setSeatMap] = useState<SeatPlanItem[]>([]);
  const [walkwayCol, setWalkwayCol] = useState(8);

  useEffect(() => {
    if (!hasInitialized && isExistingLoaded) {
      const hasSavedPathways = existingSeats.some((s: any) => (s.seatCategory === 'BLOCKED' || s.category === 'BLOCKED'));
      const isCustomLayout = existingSeats.length > 0 && hasSavedPathways;

      if (isCustomLayout) {
        const loadedCols = cols || 15;
        const loadedRows = Math.ceil(existingSeats.length / loadedCols) || 10;
        setCols(loadedCols);
        setRows(loadedRows);

        const restoredMap = existingSeats.map((seat: any) => {
          const rawStatus = seat.seatStatus || seat.status || 'AVAILABLE';
          return {
            seatNo: seat.seatNo || '',
            category: seat.seatCategory || seat.category || 'BLOCKED',
            price: seat.price || 0,
            status: String(rawStatus).toUpperCase()
          };
        });
        setSeatMap(restoredMap);
      } else {
        setRows(10);
        setCols(15);
        const blankMap = Array(10 * 15).fill(null).map(() => ({
          seatNo: '',
          category: 'REGULAR',
          price: 500,
          status: 'AVAILABLE'
        }));
        renumberSeats(blankMap, 10, 15);
      }
      setHasInitialized(true);
    }
  }, [hasInitialized, isExistingLoaded, existingSeats, cols]);

  const handleGridResize = (newRows: number, newCols: number) => {
    setRows(newRows);
    setCols(newCols);

    const newTotal = newRows * newCols;
    const updatedMap = [...seatMap];

    if (newTotal > updatedMap.length) {
      const toAdd = newTotal - updatedMap.length;
      for(let i=0; i<toAdd; i++) updatedMap.push({ seatNo: '', category: 'REGULAR', price: 500, status: 'AVAILABLE' });
    } else {
       updatedMap.splice(newTotal);
    }
    renumberSeats(updatedMap, newRows, newCols);
  };

  const insertWalkwayColumn = (targetCol: number) => {
    const colIndex = targetCol - 1;
    if (colIndex < 0 || colIndex >= cols) {
      toast.error("Invalid column number.");
      return;
    }
    const updated = [...seatMap];
    for (let r = 0; r < rows; r++) {
      const index = (r * cols) + colIndex;
      if (updated[index].status !== 'BOOKED') {
        updated[index] = { ...updated[index], category: 'BLOCKED', price: 0 };
      }
    }
    renumberSeats(updated, rows, cols);
    toast.success(`Aisle inserted at column ${targetCol}`);
  };

  const renumberSeats = (mapToRenumber: SeatPlanItem[], currentRowCount: number, currentColCount: number) => {
    for (let r = 0; r < currentRowCount; r++) {
      const rowLetter = getRowLabel(r);
      let currentNumber = 1;
      for (let c = 0; c < currentColCount; c++) {
        const idx = r * currentColCount + c;
        if (!mapToRenumber[idx]) continue;

        if (mapToRenumber[idx].category !== 'BLOCKED') {
          mapToRenumber[idx].seatNo = `${rowLetter}${currentNumber++}`;
        } else {
          mapToRenumber[idx].seatNo = '';
        }
      }
    }
    setSeatMap(mapToRenumber);
  };

  const applyBulkRowSettings = () => {
    if (startRow > endRow) {
      toast.error("Start row must be before or equal to End row.");
      return;
    }

    const updated = [...seatMap];
    let addedCount = 0;

    for (let r = startRow; r <= endRow; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (updated[idx].status !== 'BOOKED' && updated[idx].category !== 'BLOCKED') {
          updated[idx] = { ...updated[idx], category: bulkRowCategory, price: Number(bulkRowPrice) || 0 };
          addedCount++;
        }
      }
    }
    renumberSeats(updated, rows, cols);
    toast.success(`Updated ${addedCount} seats in Rows ${getRowLabel(startRow)} to ${getRowLabel(endRow)}`);
  };

  const updateSingleSeat = (index: number) => {
    const updated = [...seatMap];

    if (updated[index].status === 'BOOKED') {
      toast.error("🔒 Cannot modify a seat that is already booked!");
      return;
    }

    const currentCategory = updated[index].category;
    const isAddingSeat = currentCategory === 'BLOCKED' && selectedCategory !== 'BLOCKED';
    const isRemovingSeat = currentCategory === selectedCategory && selectedCategory !== 'BLOCKED';
    const isChangingSeatTier = currentCategory !== 'BLOCKED' && selectedCategory !== 'BLOCKED' && currentCategory !== selectedCategory;

    if (isAddingSeat) {
      updated[index] = { ...updated[index], category: selectedCategory, price: Number(bulkPrice) || 0 };
    }
    else if (isRemovingSeat || selectedCategory === 'BLOCKED') {
      updated[index] = { ...updated[index], category: 'BLOCKED', price: 0 };
    } else if (isChangingSeatTier) {
      updated[index] = { ...updated[index], category: selectedCategory, price: Number(bulkPrice) || 0 };
    }

    renumberSeats(updated, rows, cols);
  };

  const validSeats = seatMap.filter(s => s.category !== 'BLOCKED');
  const mappedSeatCount = validSeats.length;

  const handleSave = async () => {
    if (!eventId) return;

    // FIX: Only block the save if formSeatCount > 0, otherwise let it bypass to prevent getting stuck
    if (formSeatCount > 0 && mappedSeatCount > formSeatCount) {
      toast.error(`Map has ${mappedSeatCount} seats, but event capacity is only ${formSeatCount}. Please remove seats or increase capacity in Event Settings.`);
      return;
    }

    setIsLoading(true);
    try {
      const formattedSeats = seatMap.map(seat => ({
        seatNo: String(seat.seatNo),
        seatCategory: seat.category,
        category: seat.category,
        seatStatus: seat.status,
        status: seat.status,
        price: seat.price
      }));

      await api.events.saveSeatingPlan(Number(eventId), formattedSeats);
      toast.success('Seating plan saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-events', 'event-seats'] });
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save seating plan');
    } finally {
      setIsLoading(false);
    }
  };

  // UNIFORM MINIMAL SEAT COLORS (No Pink, Green, Yellow)
  const getAdminSeatColor = (category: string, status: string) => {
    // Booked/Unavailable
    if (status === 'BOOKED') return 'bg-transparent border border-slate-700 text-slate-600 cursor-not-allowed opacity-50';

    // Walkway/Empty
    if (category === 'BLOCKED') return 'border border-dashed border-slate-800 bg-transparent text-slate-700 hover:bg-slate-800/50 hover:border-slate-600';

    // Available/Configured (All categories share the same clean look)
    return 'bg-transparent border border-slate-400 text-slate-300 hover:border-indigo-400 hover:text-indigo-400 transition-colors shadow-sm';
  };

  // Group rows by their dominant category so we can apply sticky headers per group
  const groupedRows: { category: string, price: number, rows: any[] }[] = [];
  let currentGroup: any = null;

  Array.from({ length: rows }).forEach((_, r) => {
    const rowSeats = seatMap.slice(r * cols, (r + 1) * cols);
    const firstValidSeat = rowSeats.find(s => s.category !== 'BLOCKED');

    // Determine the category for this row. If the row is fully blocked, inherit the previous group's category.
    const rowCat = firstValidSeat?.category || (currentGroup ? currentGroup.category : 'REGULAR');
    const rowPrice = firstValidSeat?.price || (currentGroup ? currentGroup.price : 0);

    const rowDataObj = {
      rowIndex: r,
      rowLabel: getRowLabel(r),
      seats: rowSeats,
    };

    if (!currentGroup || currentGroup.category !== rowCat) {
      currentGroup = {
        category: rowCat,
        price: rowPrice,
        rows: []
      };
      groupedRows.push(currentGroup);
    }
    currentGroup.rows.push(rowDataObj);
  });

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
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Layout
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-5 pt-8 lg:px-16 flex flex-col xl:flex-row gap-8">
        <aside className="w-full xl:w-[360px] flex-shrink-0 space-y-6">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white mb-2">
              Seating Canvas
            </h1>
            <p className="text-slate-400 text-sm">Design rows and configure pricing tiers.</p>
          </div>

          <div className="p-5 rounded-2xl border bg-slate-900 border-slate-800 shadow-lg">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Capacity Mapped</p>
                <p className={`font-display text-2xl font-black ${formSeatCount > 0 && mappedSeatCount > formSeatCount ? 'text-red-400' : 'text-white'}`}>
                  {mappedSeatCount} <span className="text-sm font-medium text-slate-500">/ {formSeatCount}</span>
                </p>
              </div>
              {formSeatCount > 0 && mappedSeatCount > formSeatCount && <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded border border-red-500/30">EXCEEDED</span>}
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${formSeatCount > 0 && mappedSeatCount > formSeatCount ? 'bg-red-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(100, (mappedSeatCount / (formSeatCount || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-indigo-400" /> 1. Grid Dimensions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Total Rows</label>
                  <input type="number" min="1" max="100" value={rows} onChange={(e) => handleGridResize(Number(e.target.value), cols)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Seats Per Row</label>
                  <input type="number" min="1" max="100" value={cols} onChange={(e) => handleGridResize(rows, Number(e.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500" />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-800 w-full"></div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> 2. Row Tiers & Pricing
              </h3>
              <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Start Row</label>
                    <select value={startRow} onChange={(e) => setStartRow(Number(e.target.value))} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white font-bold outline-none focus:border-indigo-500">
                      {Array.from({length: rows}).map((_, i) => <option key={i} value={i}>{getRowLabel(i)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">End Row</label>
                    <select value={endRow} onChange={(e) => setEndRow(Number(e.target.value))} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white font-bold outline-none focus:border-indigo-500">
                      {Array.from({length: rows}).map((_, i) => <option key={i} value={i}>{getRowLabel(i)}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Category</label>
                    <select value={bulkRowCategory} onChange={(e) => setBulkRowCategory(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-bold text-white outline-none focus:border-indigo-500">
                      <option value="VIP">VIP</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="BALCONY">Balcony</option>
                      <option value="REGULAR">Regular</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Price (₹)</label>
                    <input type="number" value={bulkRowPrice} onChange={(e) => setBulkRowPrice(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-bold text-white outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <button onClick={applyBulkRowSettings} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2.5 rounded-lg transition-colors shadow-sm">
                  Apply to Rows
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-800 w-full"></div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Spline className="w-4 h-4 text-indigo-400" /> 3. Add Walkways
              </h3>
              <div className="flex gap-2">
                <input type="number" min="1" max={cols} value={walkwayCol} onChange={(e) => setWalkwayCol(Number(e.target.value))} className="w-24 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500" placeholder="Col #" />
                <button onClick={() => insertWalkwayColumn(walkwayCol)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4 text-slate-400" /> Drop Aisle
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-800 w-full"></div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" /> 4. Fine Tune (Paintbrush)
              </h3>
              <div className="flex gap-2">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500">
                  <option value="REGULAR">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="BALCONY">Balcony</option>
                  <option value="BLOCKED">🛑 Remove Seat</option>
                </select>
                <input type="number" value={bulkPrice} disabled={selectedCategory === 'BLOCKED'} onChange={(e) => setBulkPrice(e.target.value)} className="w-20 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500 disabled:opacity-50" placeholder="₹" />
              </div>

              {/* MINIMAL LEGEND */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-2"><div className="h-3 w-3 rounded-[4px] bg-transparent border border-slate-400"></div> Available</span>
                <span className="flex items-center gap-2"><div className="h-3 w-3 rounded-[4px] bg-transparent border border-slate-700 opacity-50"></div> Booked</span>
                <span className="flex items-center gap-2"><div className="h-3 w-3 rounded-[4px] border border-dashed border-slate-700"></div> Empty</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAP CANVAS (BOOKMYSHOW STYLE FULL GRID WITH STICKY CATEGORIES) */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-y-auto overflow-x-hidden min-h-[600px] flex flex-col items-center justify-start relative custom-scrollbar pb-10">

          <div className="w-2/3 h-8 mt-6 bg-slate-800 rounded-t-3xl border-t border-x border-slate-700 mb-12 flex items-center justify-center shadow-[0_-10px_30px_rgba(255,255,255,0.02)] flex-shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Stage</span>
          </div>

          <div className="flex flex-col w-full max-w-4xl px-6">
            {groupedRows.map((group, gIdx) => (
              <div key={gIdx} className="w-full mb-8 relative">

                {/* STICKY BOOKMYSHOW-STYLE DIVIDER */}
                <div className="sticky top-0 z-10 w-full bg-slate-900/95 backdrop-blur-md py-4 mb-4 flex justify-center items-center shadow-[0_10px_10px_-10px_rgba(0,0,0,0.3)]">
                  <h3 className="font-display text-sm font-bold text-slate-300 uppercase tracking-[0.1em]">
                    {group.category} : ₹{group.price}
                  </h3>
                </div>

                {/* SEAT ROWS FOR THIS CATEGORY */}
                <div className="flex flex-col gap-2">
                  {group.rows.map((row) => (
                    <div key={row.rowIndex} className="flex items-center gap-4 sm:gap-6 w-full justify-center my-1">

                      {/* Left Row Indicator */}
                      <div className="w-6 text-right text-[11px] font-black text-slate-500 uppercase">{row.rowLabel}</div>

                      {/* Row Seats */}
                      <div className="flex gap-1.5 sm:gap-2">
                        {row.seats.map((seat: any, c: number) => {
                          const index = row.rowIndex * cols + c;
                          const isBooked = seat.status === 'BOOKED';
                          const isBlocked = seat.category === 'BLOCKED';

                          return (
                            <button
                              key={index}
                              onClick={() => updateSingleSeat(index)}
                              disabled={isBooked}
                              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-[6px] flex items-center justify-center text-[8px] sm:text-[9px] transition-all
                                ${getAdminSeatColor(seat.category, seat.status)}
                              `}
                              title={isBooked ? `${seat.seatNo} (Booked)` : isBlocked ? `Empty Col ${(c) + 1}` : `${seat.seatNo} - ${seat.category} (₹${seat.price})`}
                            >
                              {isBooked ? <Lock className="w-3 h-3" /> : isBlocked ? null : seat.seatNo}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Row Indicator */}
                      <div className="w-6 text-left text-[11px] font-black text-slate-500 uppercase hidden md:block">{row.rowLabel}</div>

                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}