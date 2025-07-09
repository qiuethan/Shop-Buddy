import React, { useState } from 'react';
import type { SearchFormProps } from '../types';
import { AVAILABLE_STORES, AVAILABLE_LOCATIONS } from '../utils/constants';
import './SearchForm.css';

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [problem, setProblem] = useState('');
  const [selectedStores, setSelectedStores] = useState<string[]>(['all']);
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('United States');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (problem.trim()) {
      onSearch(problem.trim(), selectedStores, maxPrice, location);
    }
  };

  const handleStoreToggle = (storeId: string) => {
    if (storeId === 'all') {
      setSelectedStores(['all']);
    } else {
      setSelectedStores(prev => {
        const newStores = prev.filter(s => s !== 'all');
        if (newStores.includes(storeId)) {
          const filtered = newStores.filter(s => s !== storeId);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newStores, storeId];
        }
      });
    }
  };

  return (
    <div className="search-form-container">
      <div className="search-form-header">
        <h2>Describe Your Problem</h2>
        <p>Tell us what you need help with and we'll find the perfect solution</p>
      </div>
      
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <div className="main-input-section">
            <textarea
              className="problem-input"
              placeholder="Describe your problem or what you need... (e.g., 'my laptop is running slowly')"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
          
          <div className="filters-section">
            <div className="filter-row">
              <div className="filter-item">
                <label htmlFor="maxPrice" className="filter-label">Max Price</label>
                <input
                  id="maxPrice"
                  type="text"
                  className="filter-input"
                  placeholder="$100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="filter-item">
                <label htmlFor="location" className="filter-label">Location</label>
                <select
                  id="location"
                  className="filter-select"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading}
                >
                  {AVAILABLE_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="stores-section">
            <h4>Select stores to search:</h4>
            <div className="store-buttons">
              {AVAILABLE_STORES.map((store) => (
                <button
                  key={store.id}
                  className={`store-button ${selectedStores.includes(store.id) ? 'selected' : ''}`}
                  onClick={() => handleStoreToggle(store.id)}
                  disabled={loading}
                  type="button"
                >
                  <span className="store-icon">{store.icon}</span>
                  <span className="store-name">{store.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <button 
            type="submit" 
            className="search-button"
            disabled={loading || !problem.trim()}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                Finding Solutions...
              </>
            ) : (
              <>
                Find Solutions
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm; 