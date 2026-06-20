import { useState } from 'react';
import { Search, Sparkles, X, Loader2 } from 'lucide-react';
import { aiService } from '../../api/aiService';

export default function NaturalSearchBar({ onSearchResults, initialQuery }) {
  const [query, setQuery] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [interpretedQuery, setInterpretedQuery] = useState(null);
  const [showEditFilters, setShowEditFilters] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setInterpretedQuery(null);

    try {
      const res = await aiService.parseSearch(query.trim());
      if (res.success && res.data) {
        setInterpretedQuery(query.trim());
        onSearchResults(res.data.filters || {}, query.trim(), res.data.listings || []);
      }
    } catch {
      // Fallback: do a simple text search
      onSearchResults({ search: query.trim() }, query.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center bg-white border-2 border-primary-200 rounded-xl overflow-hidden focus-within:border-primary-400 transition-colors shadow-sm">
          <div className="pl-4 pr-2 text-primary-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder='Try "2BHK near metro under Rs.10k" or "Fully furnished room in Mumbai with AC"'
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setInterpretedQuery(null);
            }}
            className="flex-1 px-2 py-3.5 text-sm text-gray-900 placeholder:text-muted-light focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setInterpretedQuery(null); }}
              className="p-2 text-muted-light hover:text-muted"
              aria-label="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="mr-1.5 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">AI Search</span>
          </button>
        </div>
      </form>

      {/* Interpreted query chip */}
      {interpretedQuery && (
        <div className="flex items-center gap-2 mt-2 px-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            Searching for: {interpretedQuery}
          </span>
          <button
            onClick={() => setShowEditFilters(!showEditFilters)}
            className="text-xs text-muted hover:text-primary-600 underline"
          >
            {showEditFilters ? 'Hide filters' : 'Edit filters'}
          </button>
        </div>
      )}
    </div>
  );
}
