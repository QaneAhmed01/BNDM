"use client";

interface HallEntry {
  name: string;
  timestamp: string;
  context?: string;
}

interface Props {
  entries: HallEntry[];
}

export function HallOfFamePanel({ entries }: Props) {
  return (
    <section className="soft-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-preg-rose font-semibold">
            Hall of fame
          </p>
          <p className="text-sm text-slate-500">
            Favorites your circles crowned.
          </p>
        </div>
        <span className="text-[11px] text-slate-400">
          {entries.length} saved
        </span>
      </div>
      <div className="space-y-2 max-h-60 overflow-auto pr-1">
        {entries.length === 0 && (
          <p className="text-[12px] text-slate-400">
            Run a reveal to save your first champion.
          </p>
        )}
        {entries.map((entry, idx) => (
          <div
            key={`${entry.timestamp}-${entry.name}-${idx}`}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[12px]"
          >
            <div>
              <p className="font-semibold text-slate-900">{entry.name}</p>
              {entry.context && (
                <p className="text-slate-400">{entry.context}</p>
              )}
            </div>
            <span className="text-slate-400">
              {new Date(entry.timestamp).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
