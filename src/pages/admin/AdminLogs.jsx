import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/axios';

const ACTION_TYPES = [
  'ALL',
  'CONFIG_UPDATE',
  'BAN_USER',
  'UNBAN_USER',
  'MANUAL_ACTIVATE',
  'EXTEND_PRACTICE',
  'COMPRESS_TREE',
  'APPROVE_WITHDRAWAL',
  'REJECT_WITHDRAWAL',
  'TRIGGER_DRAW',
  'TREASURY_WITHDRAW_FEE',
  'ANNOUNCEMENT',
];

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 50 };
      if (actionFilter !== 'ALL') params.action = actionFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const { data } = await api.get('/api/admin/logs', { params });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [page, actionFilter, fromDate, toDate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalPages = Math.max(1, Math.ceil(total / 50));

  const clearFilters = () => {
    setActionFilter('ALL');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="font-orbitron text-[0.55rem] tracking-[0.3em] text-pink uppercase mb-1">
          🛡️ ADMIN
        </div>
        <h1 className="font-russo text-[2rem] text-gradient-gold">Logs</h1>
        <p className="text-white/40 text-[0.7rem] mt-1">
          Audit trail of every admin action · {total} total entries
        </p>
      </div>

      {/* Filters */}
      <div className="card-glass rounded-2xl p-4 mb-4 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[0.55rem] font-orbitron text-white/40 mb-1 tracking-[0.1em]">
              ACTION TYPE
            </label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.65rem] focus:outline-none focus:border-gold/50"
            >
              {ACTION_TYPES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[0.55rem] font-orbitron text-white/40 mb-1 tracking-[0.1em]">
              FROM DATE
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.65rem] focus:outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-[0.55rem] font-orbitron text-white/40 mb-1 tracking-[0.1em]">
              TO DATE
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-orbitron text-[0.65rem] focus:outline-none focus:border-gold/50"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem] hover:border-gold/30 hover:text-gold"
            >
              CLEAR FILTERS
            </button>
          </div>
        </div>
      </div>

      {/* Logs table */}
      <div className="card-glass rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-white/40 font-orbitron text-[0.7rem]">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-white/30 font-orbitron text-[0.7rem]">
            No log entries match the current filters
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[0.65rem]">
              <thead className="bg-white/5 border-b border-white/10 sticky top-0">
                <tr className="text-left text-white/40 font-orbitron text-[0.55rem] tracking-[0.1em]">
                  <th className="py-3 px-3">TIMESTAMP</th>
                  <th className="py-3 px-3">ADMIN</th>
                  <th className="py-3 px-3">ACTION</th>
                  <th className="py-3 px-3">TARGET</th>
                  <th className="py-3 px-3">OLD → NEW</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-white/5 hover:bg-white/3 align-top">
                    <td className="py-2.5 px-3 font-orbitron text-white/40 text-[0.55rem] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-orbitron text-cyan text-[0.55rem]">
                      {log.adminWallet
                        ? `${log.adminWallet.slice(0, 6)}...${log.adminWallet.slice(-4)}`
                        : '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="py-2.5 px-3 font-orbitron text-white/60 text-[0.55rem] max-w-[150px] truncate">
                      {log.target || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-[0.55rem] max-w-[400px]">
                      {log.oldValue !== undefined && log.oldValue !== null && (
                        <div>
                          <span className="text-pink font-orbitron">old: </span>
                          <span className="text-white/50 font-orbitron break-all">
                            {formatValue(log.oldValue)}
                          </span>
                        </div>
                      )}
                      {log.newValue !== undefined && log.newValue !== null && (
                        <div>
                          <span className="text-green font-orbitron">new: </span>
                          <span className="text-white/70 font-orbitron break-all">
                            {formatValue(log.newValue)}
                          </span>
                        </div>
                      )}
                      {(log.oldValue === null || log.oldValue === undefined) &&
                        (log.newValue === null || log.newValue === undefined) && (
                          <span className="text-white/20">—</span>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem] disabled:opacity-30"
          >
            ← PREV
          </button>
          <span className="font-orbitron text-[0.65rem] text-white/50 px-3">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 font-orbitron text-[0.6rem] disabled:opacity-30"
          >
            NEXT →
          </button>
        </div>
      )}
    </AdminLayout>
  );
}

function ActionBadge({ action }) {
  const styles = {
    CONFIG_UPDATE: 'bg-cyan/10 border-cyan/30 text-cyan',
    BAN_USER: 'bg-pink/10 border-pink/30 text-pink',
    UNBAN_USER: 'bg-green/10 border-green/30 text-green',
    MANUAL_ACTIVATE: 'bg-gold/10 border-gold/30 text-gold',
    EXTEND_PRACTICE: 'bg-purple/10 border-purple/30 text-purple',
    COMPRESS_TREE: 'bg-purple/10 border-purple/30 text-purple',
    APPROVE_WITHDRAWAL: 'bg-green/10 border-green/30 text-green',
    REJECT_WITHDRAWAL: 'bg-pink/10 border-pink/30 text-pink',
    TRIGGER_DRAW: 'bg-gold/10 border-gold/30 text-gold',
    TREASURY_WITHDRAW_FEE: 'bg-gold/10 border-gold/30 text-gold',
    ANNOUNCEMENT: 'bg-cyan/10 border-cyan/30 text-cyan',
  };
  const style = styles[action] || 'bg-white/5 border-white/20 text-white/60';
  return (
    <span className={`px-2 py-0.5 rounded-full font-orbitron text-[0.5rem] border whitespace-nowrap ${style}`}>
      {action}
    </span>
  );
}

function formatValue(v) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}
