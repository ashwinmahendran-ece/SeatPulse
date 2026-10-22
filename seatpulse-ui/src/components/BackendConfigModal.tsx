import { X } from 'lucide-react';
import { saveSettings, useSettings } from '../settings';
export default function BackendConfigModal({ onClose }: { onClose: () => void }) {
  const s = useSettings();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-md space-y-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Developer settings</h2>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <label className="flex items-center justify-between rounded-xl bg-badge p-3 text-sm font-medium">
          Live API (localhost:8080)
          <input type="checkbox" checked={s.live} onChange={(e) => saveSettings({ ...s, live: e.target.checked })} className="h-4 w-4 accent-brand" />
        </label>
        <label className="block text-sm font-medium">JWT token
          <textarea rows={3} value={s.token} onChange={(e) => saveSettings({ ...s, token: e.target.value.trim() })} className="input mt-1 font-mono text-xs" placeholder="eyJhbGciOi..." />
        </label>
        <label className="block text-sm font-medium">User ID
          <input type="number" value={s.userId} onChange={(e) => saveSettings({ ...s, userId: Number(e.target.value) })} className="input mt-1" />
        </label>
        <div className="text-sm font-medium">Hold timer
          <div className="mt-1 grid grid-cols-2 gap-2">
            {([['30', '30s (RabbitMQ TTL)'], ['preview', '08:42 preview']] as const).map(([v, l]) => (
              <button key={v} onClick={() => saveSettings({ ...s, timer: v })} className={`rounded-xl border px-3 py-2 text-sm ${s.timer === v ? 'border-brand bg-brandLight text-brandDeep' : 'border-line'}`}>{l}</button>
            ))}
          </div>
        </div>
        <button className="btn w-full" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
