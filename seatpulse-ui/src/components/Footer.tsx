export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 py-8 bg-[#07090E]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="font-display font-extrabold tracking-tight text-lg">
          <span className="text-white">Seat</span><span className="text-[#E8D5B5]">Pulse</span>
        </p>
        <p className="text-[#969BA5] text-sm font-medium">
          Precision for every seat. Confidence for every moment.
        </p>
      </div>
    </footer>
  );
}