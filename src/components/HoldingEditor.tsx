import React, { useState, useEffect, useRef } from "react";
import type { UserHolding, FundValuation } from "@/types";

interface HoldingEditorProps {
  holdings: UserHolding[];
  valuations: Map<string, FundValuation>;
  onUpdate: (fundCode: string, shares: number, costNav: number) => void;
  onRemove: (fundCode: string) => void;
  onAddClick: () => void;
}

export const HoldingEditor: React.FC<HoldingEditorProps> = ({
  holdings,
  valuations,
  onUpdate,
  onRemove,
  onAddClick,
}) => {
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editShares, setEditShares] = useState("");
  const [editCostNav, setEditCostNav] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCode) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [editingCode]);

  const startEdit = (h: UserHolding) => {
    setEditingCode(h.fundCode);
    setEditShares(h.shares.toString());
    setEditCostNav(h.costNav.toString());
    setConfirmDelete(null);
  };

  const saveEdit = () => {
    if (!editingCode) return;
    const shares = parseFloat(editShares);
    const costNav = parseFloat(editCostNav);
    if (isNaN(shares) || shares <= 0 || isNaN(costNav) || costNav <= 0) return;
    onUpdate(editingCode, shares, costNav);
    setEditingCode(null);
  };

  const cancelEdit = () => {
    setEditingCode(null);
  };

  const handleDelete = (code: string) => {
    if (confirmDelete === code) {
      onRemove(code);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(code);
      // 3秒后自动取消确认状态
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="holding-editor">
      <div className="holding-editor__header">
        <div className="holding-editor__title">📋 我的持仓</div>
        <button className="holding-editor__add-btn" onClick={onAddClick}>
          + 添加基金
        </button>
      </div>

      <div className="holding-editor__list">
        {holdings.length === 0 && (
          <div className="holding-editor__empty">
            暂无持仓基金，点击「添加基金」开始配置
          </div>
        )}

        {holdings.map((h) => {
          const val = valuations.get(h.fundCode);
          const isEditing = editingCode === h.fundCode;
          const name = h.fundName || val?.name || h.fundCode;

          return (
            <div
              key={h.fundCode}
              className={`holding-item ${isEditing ? "holding-item--editing" : ""}`}
            >
              <div className="holding-item__info">
                <div className="holding-item__name">{name}</div>
                <div className="holding-item__code">{h.fundCode}</div>
              </div>

              {isEditing ? (
                <div className="holding-item__edit-form">
                  <div className="holding-item__field">
                    <label>持有份额</label>
                    <input
                      ref={inputRef}
                      type="number"
                      value={editShares}
                      onChange={(e) => setEditShares(e.target.value)}
                      min="0"
                      step="100"
                    />
                  </div>
                  <div className="holding-item__field">
                    <label>成本净值</label>
                    <input
                      type="number"
                      value={editCostNav}
                      onChange={(e) => setEditCostNav(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="holding-item__actions">
                    <button className="btn-save" onClick={saveEdit}>
                      ✓ 保存
                    </button>
                    <button className="btn-cancel" onClick={cancelEdit}>
                      ✕ 取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="holding-item__data">
                  <div className="holding-item__detail">
                    <span className="holding-item__label">份额</span>
                    <span className="holding-item__value">
                      {h.shares.toLocaleString()}
                    </span>
                  </div>
                  <div className="holding-item__detail">
                    <span className="holding-item__label">成本</span>
                    <span className="holding-item__value">
                      {h.costNav.toFixed(4)}
                    </span>
                  </div>
                  <div className="holding-item__btns">
                    <button
                      className="btn-edit"
                      onClick={() => startEdit(h)}
                      title="编辑"
                    >
                      ✏️
                    </button>
                    <button
                      className={`btn-delete ${confirmDelete === h.fundCode ? "btn-delete--confirm" : ""}`}
                      onClick={() => handleDelete(h.fundCode)}
                      title="删除"
                    >
                      {confirmDelete === h.fundCode ? "确认?" : "🗑️"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
