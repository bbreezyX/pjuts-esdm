"use client";

export default function OfflinePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center">
            <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-lg">
                <div className="mb-6 text-6xl">📡</div>
                <h1 className="mb-4 text-2xl font-bold text-white">
                    Anda Sedang Offline
                </h1>
                <p className="mb-6 text-slate-300">
                    Perangkat Anda tidak terhubung ke internet. Periksa koneksi Anda dan
                    coba lagi.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    Coba Lagi
                </button>
            </div>
        </div>
    );
}
