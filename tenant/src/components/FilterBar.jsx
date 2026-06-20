import { useState } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';

const roomTypes = ['single', 'double', 'flat', 'PG'];
const furnishingTypes = ['unfurnished', 'semi-furnished', 'fully-furnished'];
const amenitiesList = ['wifi', 'ac', 'parking', 'water', 'electricity', 'security', 'lift', 'gym'];

export default function FilterBar({ filters, onFilterChange, onClose }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const cleared = {};
    setLocalFilters(cleared);
    onFilterChange(cleared);
    setIsOpen(false);
  };

  const toggleAmenity = (amenity) => {
    const current = localFilters.amenities ? localFilters.amenities.split(',') : [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    handleChange('amenities', updated.join(','));
  };

  const activeCount = Object.keys(filters).length;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-muted-dark hover:bg-surface-secondary hover:border-border-dark transition-colors"
        aria-label="Toggle filters"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeCount > 0 && (
          <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">{activeCount}</span>
        )}
      </button>

      {/* Filter panel - modal on mobile, sidebar on desktop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="relative ml-auto w-full max-w-sm bg-white h-full overflow-y-auto shadow-modal">
            <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 text-muted hover:text-gray-900" aria-label="Close filters">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-muted-dark mb-1.5">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    value={localFilters.search || ''}
                    onChange={(e) => handleChange('search', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-muted-dark mb-1.5">City</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Delhi"
                  value={localFilters.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-muted-dark mb-1.5">Price Range (per month)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.minPrice || ''}
                    onChange={(e) => handleChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                  />
                  <span className="text-muted">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.maxPrice || ''}
                    onChange={(e) => handleChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                  />
                </div>
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-sm font-medium text-muted-dark mb-1.5">Room Type</label>
                <div className="flex flex-wrap gap-2">
                  {roomTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleChange('type', localFilters.type === type ? '' : type)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                        localFilters.type === type
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-muted-dark border-border hover:border-primary-300'
                      }`}
                    >
                      {type === 'PG' ? 'Paying Guest' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Furnishing */}
              <div>
                <label className="block text-sm font-medium text-muted-dark mb-1.5">Furnishing</label>
                <div className="flex flex-wrap gap-2">
                  {furnishingTypes.map((f) => (
                    <button
                      key={f}
                      onClick={() => handleChange('furnishing', localFilters.furnishing === f ? '' : f)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                        localFilters.furnishing === f
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-muted-dark border-border hover:border-primary-300'
                      }`}
                    >
                      {f.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-muted-dark mb-1.5">Amenities</label>
                <div className="grid grid-cols-2 gap-2">
                  {amenitiesList.map((amenity) => (
                    <label
                      key={amenity}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors capitalize ${
                        localFilters.amenities?.includes(amenity)
                          ? 'bg-primary-50 border-primary-200 text-primary-700'
                          : 'bg-white border-border text-muted-dark hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.amenities?.includes(amenity) || false}
                        onChange={() => toggleAmenity(amenity)}
                        className="sr-only"
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>

              {/* Gender Preference */}
              <div>
                <label className="block text-sm font-medium text-muted-dark mb-1.5">Gender Preference</label>
                <div className="flex flex-wrap gap-2">
                  {['any', 'male', 'female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => handleChange('genderPreference', localFilters.genderPreference === g ? '' : g)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                        localFilters.genderPreference === g
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-muted-dark border-border hover:border-primary-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t border-border px-5 py-4 flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-muted-dark hover:bg-surface-secondary transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
