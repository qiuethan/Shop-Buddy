import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import SearchForm from './components/SearchForm.tsx';
import SolutionDisplay from './components/SolutionDisplay.tsx';
import ProductBrowser from './components/ProductBrowser.tsx';
import InstructionsPlaceholder from './components/InstructionsPlaceholder.tsx';
import { LoadingSpinner, ErrorMessage } from './components/common';
import { useSearch } from './hooks/useSearch';
import './App.css';

function App() {
  const { 
    searchResult, 
    loading, 
    error, 
    search, 
    clearError 
  } = useSearch();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [browserTrayOpen, setBrowserTrayOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const appMainRef = useRef<HTMLDivElement>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile && searchResult?.solution) {
      setSidebarCollapsed(true);
    }
  }, [isMobile, searchResult?.solution]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && !sidebarCollapsed && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarCollapsed(true);
      }
    };

    if (isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, sidebarCollapsed]);

  // Handle touch gestures for mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isMobile) return;

      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Swipe right to open sidebar (only if starting from left edge)
      if (deltaX > 50 && Math.abs(deltaY) < 100 && touchStartX < 50 && sidebarCollapsed) {
        setSidebarCollapsed(false);
      }

      // Swipe left to close sidebar
      if (deltaX < -50 && Math.abs(deltaY) < 100 && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [isMobile, sidebarCollapsed]);

  const handleSearch = async (
    problem: string, 
    stores: string[], 
    maxPrice: string, 
    location: string
  ) => {
    await search(problem, stores, maxPrice, location);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleBrowserTray = () => {
    setBrowserTrayOpen(!browserTrayOpen);
  };

  // Sidebar resize logic
  const handleSidebarResize = useCallback((e: MouseEvent) => {
    if (!appMainRef.current) return;
    const rect = appMainRef.current.getBoundingClientRect();
    const newWidth = Math.max(250, Math.min(600, e.clientX - rect.left));
    setSidebarWidth(newWidth);
  }, []);

  const startSidebarResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.classList.add('resizing');
    const handleMouseMove = (e: MouseEvent) => handleSidebarResize(e);
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleSidebarResize]);

  useEffect(() => {
    if (appMainRef.current && !isMobile) {
      appMainRef.current.style.gridTemplateColumns = sidebarCollapsed 
        ? '0 1fr' 
        : `${sidebarWidth}px 1fr`;
    } else if (appMainRef.current && isMobile) {
      // Clear any inline styles on mobile to let CSS take over
      appMainRef.current.style.gridTemplateColumns = '';
    }
  }, [sidebarWidth, sidebarCollapsed, isMobile]);

  const hasBrowserData = searchResult?.categorizedProducts && searchResult?.categories;

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-brand">
          <div className="header-logo">$B</div>
          <h1>Shop Buddy</h1>
        </div>
        <p>Describe any problem and get a complete solution with integrated product recommendations!</p>
      </header>

      {/* Sidebar Toggle Button - hide on mobile when sidebar is open */}
      {!(isMobile && !sidebarCollapsed) && (
        <button 
          className={`sidebar-toggle ${sidebarCollapsed ? 'collapsed' : ''}`}
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
          style={{ left: sidebarCollapsed ? (isMobile ? 16 : 0) : (isMobile ? 16 : sidebarWidth) }}
        >
          {sidebarCollapsed ? <ChevronRight size={isMobile ? 16 : 14} /> : <ChevronLeft size={isMobile ? 16 : 14} />}
        </button>
      )}

      {/* Mobile close button when sidebar is open - only show on mobile and when sidebar is open */}
      {isMobile && !sidebarCollapsed && (
        <button 
          className="mobile-close-btn"
          onClick={toggleSidebar}
          title="Close sidebar"
        >
          <X size={window.innerWidth <= 480 ? 14 : 16} />
        </button>
      )}

      <main 
        ref={appMainRef}
        className={`App-main ${sidebarCollapsed ? 'collapsed' : ''}`}
      >
        {/* Left Column */}
        <div 
          ref={sidebarRef}
          className={`input-column ${sidebarCollapsed ? 'collapsed' : ''}`}
        >
          <SearchForm onSearch={handleSearch} loading={loading} />
          {!sidebarCollapsed && !isMobile && (
            <div 
              className={`resize-handle resize-handle-x ${isResizing ? 'resizing' : ''}`}
              onMouseDown={startSidebarResize}
            />
          )}
        </div>

        {/* Right Column */}
        <div className="results-column">
          {/* Conditionally show either Solution or Product Browser */}
          {!browserTrayOpen && (
            <div className="solution-section">
              <div className="solution-content-wrapper">
                {loading && !searchResult?.solution && (
                  <div className="loading-container">
                    <LoadingSpinner />
                    <p>Generating solution...</p>
                  </div>
                )}
                
                {!loading && !searchResult?.solution && (
                  <InstructionsPlaceholder />
                )}
                
                {searchResult?.solution && (
                  <>
                    {searchResult.searchSummary && (
                      <div className="search-summary">
                        <h3>📊 Search Summary</h3>
                        <div className="summary-stats">
                          <div className="stat-item">
                            <div className="stat-number">{searchResult.searchSummary.aiRecommendedSearches}</div>
                            <div className="stat-label">AI-Optimized Searches</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-number">{searchResult.searchSummary.categoriesFound}</div>
                            <div className="stat-label">Categories Found</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-number">{searchResult.searchSummary.productsRecommended}</div>
                            <div className="stat-label">Products Recommended</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-number">{searchResult.searchSummary.alternativesAvailable}</div>
                            <div className="stat-label">Alternatives Available</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-number">{searchResult.totalFound}</div>
                            <div className="stat-label">Total Found</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <SolutionDisplay 
                      solution={searchResult.solution} 
                      totalFound={searchResult.totalFound} 
                    />
                  </>
                )}
              </div>
              
              {hasBrowserData && !isMobile && (
                <div className="browser-tray-tab" onClick={toggleBrowserTray}>
                  📦 Products ({searchResult.totalFound})
                </div>
              )}

              {hasBrowserData && isMobile && (
                <div className="mobile-desktop-prompt">
                  💻 Go to desktop to browse all found products
                </div>
              )}
            </div>
          )}

          {/* Full-height Product Browser when open - Desktop only */}
          {browserTrayOpen && hasBrowserData && !isMobile && (
            <div className="browser-section">
              <div className="browser-header-bar">
                <div className="browser-title">
                  <h2>Product Browser</h2>
                  <span>({searchResult.totalFound} products found)</span>
                </div>
                <button className="close-browser-btn" onClick={toggleBrowserTray}>
                  ✕ Close
                </button>
              </div>
              <div className="browser-content">
                {loading && !searchResult?.categorizedProducts && (
                  <div className="loading-container">
                    <LoadingSpinner />
                    <p>Finding products...</p>
                  </div>
                )}
                {searchResult?.categorizedProducts && searchResult?.categories && (
                  <ProductBrowser
                    categorizedProducts={searchResult.categorizedProducts}
                    alternativeProducts={searchResult.alternativeProducts || []}
                    categories={searchResult.categories}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="error-overlay">
            <ErrorMessage message={error} onRetry={clearError} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
