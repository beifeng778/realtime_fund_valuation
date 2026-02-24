import React, { useState, useEffect, useRef, useCallback } from "react";
import { searchFunds, type FundSearchItem } from "@/services/fundSearch";

interface FundSearchModalProps {
  visible: boolean;
  existingCodes: string[];
  onAdd: (code: string, name: string) => void;
  onClose: () => void;
}

export const FundSearchModal: React.FC<FundSearchModalProps> = ({
  visible,
  existingCodes,
  onAdd,
  onClose,
}) => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<FundSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 打开时聚焦输入框
  useEffect(() => {
    if (visible) {
      setKeyword("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  // 防抖搜索
  const doSearch = useCallback(async (kw: string) => {
    if (!kw.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    setListLoading(true);
    try {
      const items = await searchFunds(kw, 30);
      setResults(items);
    } finally {
      setSearching(false);
      setListLoading(false);
    }
  }, []);

  const handleInput = (val: string) => {
    setKeyword(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!val.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(() => doSearch(val), 300);
  };

  const handleAdd = (item: FundSearchItem) => {
    onAdd(item.code, item.name);
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🔍 添加基金</div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="search-input-wrap">
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="输入基金代码、名称或拼音搜索..."
            value={keyword}
            onChange={(e) => handleInput(e.target.value)}
          />
          {searching && <div className="search-spinner" />}
        </div>

        <div className="search-results">
          {listLoading && results.length === 0 && keyword && (
            <div className="search-empty">搜索中...</div>
          )}
          {!searching && keyword && results.length === 0 && (
            <div className="search-empty">未找到匹配基金</div>
          )}
          {!keyword && (
            <div className="search-empty search-hint">
              支持基金代码、基金名称、拼音缩写搜索
            </div>
          )}
          {results.map((item) => {
            const exists = existingCodes.includes(item.code);
            return (
              <div key={item.code} className="search-result-item">
                <div className="search-result-info">
                  <div className="search-result-name">{item.name}</div>
                  <div className="search-result-meta">
                    <span className="search-result-code">{item.code}</span>
                    <span className="search-result-type">{item.type}</span>
                  </div>
                </div>
                <button
                  className={`search-result-btn ${exists ? "search-result-btn--added" : ""}`}
                  onClick={() => !exists && handleAdd(item)}
                  disabled={exists}
                >
                  {exists ? "已添加" : "+ 添加"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
