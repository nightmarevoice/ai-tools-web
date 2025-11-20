import { useState, useCallback } from 'react';
import { ProcessedProduct } from '../types';
import { TagCombination } from '../utils/tagAnalytics';

export type ModalType = 'product' | 'category' | 'tagCombination';

export interface ModalState {
  type: ModalType;
  data: ProcessedProduct | string | TagCombination;
}

export interface NavigationStack {
  currentModal: ModalState | null;
  history: ModalState[];
  canGoBack: boolean;
  openModal: (type: ModalType, data: any) => void;
  closeModal: () => void;
  goBack: () => void;
  clearAll: () => void;
}

export const useNavigationStack = (): NavigationStack => {
  const [currentModal, setCurrentModal] = useState<ModalState | null>(null);
  const [history, setHistory] = useState<ModalState[]>([]);

  const openModal = useCallback((type: ModalType, data: any) => {
    setHistory(prev => {
      // 如果当前有弹窗，将其加入历史栈
      if (currentModal) {
        return [...prev, currentModal];
      }
      return prev;
    });
    setCurrentModal({ type, data });
  }, [currentModal]);

  const closeModal = useCallback(() => {
    setCurrentModal(null);
    setHistory([]);
  }, []);

  const goBack = useCallback(() => {
    if (history.length > 0) {
      // 从历史栈中取出上一个弹窗
      const previous = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentModal(previous);
    } else {
      // 没有历史记录，直接关闭
      setCurrentModal(null);
    }
  }, [history]);

  const clearAll = useCallback(() => {
    setCurrentModal(null);
    setHistory([]);
  }, []);

  return {
    currentModal,
    history,
    canGoBack: history.length > 0,
    openModal,
    closeModal,
    goBack,
    clearAll
  };
};
