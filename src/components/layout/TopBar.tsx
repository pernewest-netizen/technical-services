import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores';
import { Search, X, Command } from 'lucide-react';
import { searchApi } from '@/lib/api';
import { SearchResult } from '@/types';

export const TopBar: React.FC = () => {
  const { searchQuery, setSearchQuery, isSearchOpen, setSearchOpen } = useUIStore();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const res = await searchApi.global({ query, limit: 20 });
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setSearchOpen(false);
    setSearchQuery('');
    setResults([]);

    const paths: Record<string, string> = {
      template: `/templates/${result.id}`,
      product: `/products/${result.id}`,
      season: `/seasons/${result.id}`,
    };

    if (paths[result.entity_type]) {
      navigate(paths[result.entity_type]);
    }
  };

  const getEntityLabel = (type: string) => {
    const labels: Record<string, string> = {
      template: 'تصميم',
      product: 'منتج',
      season: 'مناسبة',
      category: 'قسم',
      machine: 'ماكينة',
      material: 'خامة',
    };
    return labels[type] || type;
  };

  return (
    <>
      {/* Top Bar */}
      <header className="h-16 bg-card border-b border-border flex items-center px-6 sticky top-0 z-30">
        <div className="flex-1 flex items-center gap-4">
          {/* Search Trigger */}
          <button
            onClick={() => {
              setSearchOpen(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors w-96"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">البحث في النظام...</span>
            <div className="mr-auto flex items-center gap-1">
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick Actions */}
          <button
            onClick={() => navigate('/templates/new')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            + تصميم جديد
          </button>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-2xl mx-4 bg-card rounded-xl border shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن تصميم، منتج، مناسبة، خامة، ماكينة..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex h-7 select-none items-center rounded border bg-muted px-2 font-mono text-xs">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isSearching ? (
                <div className="p-8 text-center text-muted-foreground">جاري البحث...</div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((result) => (
                    <button
                      key={`${result.entity_type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-right"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {result.thumbnail_path ? (
                          <img src={result.thumbnail_path} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Search className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{result.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {getEntityLabel(result.entity_type)}
                          </span>
                        </div>
                        {result.code && (
                          <p className="text-xs text-muted-foreground">{result.code}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim().length >= 2 ? (
                <div className="p-8 text-center text-muted-foreground">
                  لا توجد نتائج لـ "{searchQuery}"
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  ابدأ الكتابة للبحث...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
