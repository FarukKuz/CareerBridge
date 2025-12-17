import { Suspense, lazy } from "react";


const MapView = lazy(() => import("./pages/MapView"));


function LoadingSpinner() {
  return (
    <div 
      role="status" 
      aria-label="Sayfa yükleniyor"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}
    >
      <div 
        style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MapView />
    </Suspense>
  );
}

export default App;
