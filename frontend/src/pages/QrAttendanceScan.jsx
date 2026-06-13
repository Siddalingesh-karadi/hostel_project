import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  HiQrcode, HiCheckCircle, HiXCircle, HiClock,
  HiSparkles, HiRefresh, HiLightningBolt
} from 'react-icons/hi';

const QrAttendanceScan = () => {
  const [scanResult, setScanResult] = useState(null); // { success, message, data }
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const scannerRef = useRef(null);
  const scannerContainerRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch student's QR attendance history
  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/qr-attendance/my-history', { headers });
      setHistory(res.data.data);
    } catch (err) {
      console.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        try { scannerRef.current.clear(); } catch (e) {}
      }
    };
  }, []);

  // Submit the scanned token to the server
  const submitAttendance = async (sessionToken) => {
    setScanResult(null);
    try {
      const res = await axios.post('/api/qr-attendance/mark', { session_token: sessionToken }, { headers });
      setScanResult({ success: true, message: res.data.message, data: res.data.data });
      fetchHistory(); // Refresh history after marking
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark attendance.';
      setScanResult({ success: false, message: msg });
    }
  };

  // Start the camera QR scanner
  const startScanner = () => {
    setScanning(true);
    setScanResult(null);

    // Small delay to let the container render
    setTimeout(() => {
      if (scannerRef.current) {
        try { scannerRef.current.clear(); } catch (e) {}
      }

      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        aspectRatio: 1.0,
      }, /* verbose */ false);

      scanner.render(
        (decodedText) => {
          // On success scan
          submitAttendance(decodedText);
          try { scanner.clear(); } catch (e) {}
          setScanning(false);
        },
        (errorMessage) => {
          // Ignore scan errors (camera focus etc)
        }
      );

      scannerRef.current = scanner;
    }, 300);
  };

  // Stop scanner
  const stopScanner = () => {
    if (scannerRef.current) {
      try { scannerRef.current.clear(); } catch (e) {}
    }
    setScanning(false);
  };

  // Handle manual code submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      submitAttendance(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <header className="mb-10 text-center">
          <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <HiQrcode className="text-4xl text-indigo-500" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Scan QR Attendance</h1>
          <p className="text-slate-400">Scan the QR code displayed by your warden to mark your attendance.</p>
        </header>

        {/* Scan Result Banner */}
        {scanResult && (
          <div className={`mb-8 glass-card p-8 text-center border-2 ${
            scanResult.success ? 'border-emerald-500/30' : 'border-rose-500/30'
          }`}>
            {scanResult.success ? (
              <>
                <HiCheckCircle className="text-7xl text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-white mb-2">Attendance Marked!</h2>
                <p className="text-emerald-400 font-bold">{scanResult.data?.session_title}</p>
                <p className="text-slate-500 text-sm mt-2">
                  Marked at {new Date(scanResult.data?.marked_at).toLocaleTimeString()}
                </p>
              </>
            ) : (
              <>
                <HiXCircle className="text-7xl text-rose-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-white mb-2">Cannot Mark Attendance</h2>
                <p className="text-rose-400">{scanResult.message}</p>
              </>
            )}
            <button
              onClick={() => setScanResult(null)}
              className="mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-sm font-bold transition-all"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scanner Area */}
        {!scanResult && (
          <div className="mb-10">
            {!scanning ? (
              <div className="glass-card p-12 text-center border-2 border-indigo-500/20">
                <div className="w-32 h-32 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-indigo-500/30">
                  <HiQrcode className="text-6xl text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Ready to Scan</h3>
                <p className="text-slate-400 text-sm mb-6">Point your camera at the QR code or enter the code manually below.</p>
                <button
                  onClick={startScanner}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] flex items-center gap-2 mx-auto"
                >
                  <HiLightningBolt /> Open Camera Scanner
                </button>
              </div>
            ) : (
              <div className="glass-card p-6 border-2 border-indigo-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Camera Active
                  </h3>
                  <button
                    onClick={stopScanner}
                    className="text-rose-400 hover:text-rose-300 text-sm font-bold"
                  >
                    Stop Scanner
                  </button>
                </div>
                <div id="qr-reader" className="rounded-2xl overflow-hidden"></div>
              </div>
            )}

            {/* Manual Entry */}
            <div className="mt-6">
              <p className="text-center text-slate-500 text-xs uppercase font-black tracking-widest mb-4">Or enter code manually</p>
              <form onSubmit={handleManualSubmit} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Paste attendance code here..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all text-sm"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Attendance History */}
        <div className="mt-10">
          <h3 className="text-white font-black text-lg mb-6 flex items-center gap-2">
            <HiClock className="text-indigo-500" /> Your QR Attendance History
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl py-12 text-center text-slate-500">
              <p className="font-bold">No QR attendance records yet.</p>
              <p className="text-sm mt-1">Scan a QR code to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record, i) => (
                <div key={record.record_id} className="flex justify-between items-center bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all">
                  <div>
                    <p className="text-white font-bold text-sm">{record.title}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      By {record.created_by_name} • {new Date(record.session_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase px-2 py-1 rounded-full border border-emerald-500/20">
                      Present
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {new Date(record.marked_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default QrAttendanceScan;
