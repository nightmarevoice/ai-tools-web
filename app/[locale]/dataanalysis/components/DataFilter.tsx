import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from './Card';
import { Filter, AlertTriangle, CheckCircle } from 'lucide-react';

interface DataFilterProps {
  minVisits: number;
  onMinVisitsChange: (value: number) => void;
  totalProducts: number;
  filteredProducts: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const DataFilter: React.FC<DataFilterProps> = ({
  minVisits,
  onMinVisitsChange,
  totalProducts,
  filteredProducts,
  isExpanded,
  onToggle
}) => {
  const t = useTranslations('dataanalysis.dataFilter');
  const filteredCount = totalProducts - filteredProducts;
  const filteredPercentage = ((filteredCount / totalProducts) * 100).toFixed(1);

  const presets = [
    { label: t('noFilter'), value: 0, desc: t('noFilterDesc') },
    { label: t('filterVeryLow'), value: 500, desc: t('filterVeryLowDesc') },
    { label: t('filterLow'), value: 1000, desc: t('filterLowDesc') },
    { label: t('filterMediumLow'), value: 5000, desc: t('filterMediumLowDesc') },
    { label: t('filterHighOnly'), value: 10000, desc: t('filterHighOnlyDesc') },
  ];

  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-sm mb-6">
      {/* 折叠头部 */}
      <div 
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-accent transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Filter className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{t('title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {minVisits > 0 && (
            <div className="bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
              <span className="text-sm text-primary font-medium">
                {t('filteredCount', { count: filteredCount, percentage: filteredPercentage })}
              </span>
            </div>
          )}
          <button className="text-muted-foreground hover:text-foreground">
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="mt-4 space-y-4">
            {/* 说明 */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{t('whyFilter')}</h4>
                  <ul className="text-sm text-foreground/80 space-y-1">
                    <li>• {t('reason1')}</li>
                    <li>• {t('reason2')}</li>
                    <li>• {t('reason3')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 快速预设 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('quickSelect')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => onMinVisitsChange(preset.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      minVisits === preset.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/40 bg-card'
                    }`}
                  >
                    <div className="font-medium text-sm text-foreground">{preset.label}</div>
                    <div 
                      className="text-xs text-muted-foreground mt-1"
                      dangerouslySetInnerHTML={{ __html: preset.desc }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 自定义滑块 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('customThreshold')}: {minVisits === 0 ? t('noFilterLabel') : `${minVisits.toLocaleString()} ${t('visits')}`}
              </label>
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={minVisits}
                onChange={(e) => onMinVisitsChange(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(minVisits / 50000) * 100}%, hsl(var(--muted)) ${(minVisits / 50000) * 100}%, hsl(var(--muted)) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>10K</span>
                <span>25K</span>
                <span>50K</span>
              </div>
            </div>

            {/* 过滤效果统计 */}
            <div className="bg-muted/50 rounded-lg p-4 border">
              <h4 className="font-semibold text-foreground mb-3">{t('filterEffect')}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('originalProducts')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{filteredCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('filtered')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{filteredProducts}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('analyzing')}</div>
                </div>
              </div>
              
              {minVisits > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-foreground">
                      {t('filteredPercentage', { percentage: filteredPercentage })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 建议 */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-sm text-foreground">
                <strong>{t('suggestion')}</strong> 
                {minVisits === 0 && ` ${t('suggestion1')}`}
                {minVisits > 0 && minVisits < 1000 && ` ${t('suggestion2')}`}
                {minVisits >= 1000 && minVisits < 5000 && ` ${t('suggestion3')}`}
                {minVisits >= 5000 && ` ${t('suggestion4')}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



