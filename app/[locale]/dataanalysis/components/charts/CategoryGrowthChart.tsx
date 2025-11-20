import ReactECharts from 'echarts-for-react';
import { CategoryStats } from '../../../../../types';

interface Props {
  data: CategoryStats[];
  onCategoryClick?: (category: string) => void;
}

export const CategoryGrowthChart: React.FC<Props> = ({ data, onCategoryClick }) => {
  const topCategories = data.slice(0, 10);

  const option = {
    title: {
      text: '类目增长率排行',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>增长率: ${data.value.toFixed(2)}%<br/>产品数: ${topCategories[data.dataIndex].productCount}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: '增长率 (%)',
      axisLabel: {
        formatter: '{value}%',
      },
    },
    yAxis: {
      type: 'category',
      data: topCategories.map((cat) => cat.name),
      axisLabel: {
        width: 150,
        overflow: 'truncate',
      },
    },
    series: [
      {
        name: '增长率',
        type: 'bar',
        data: topCategories.map((cat) => ({
          value: cat.growthRate,
          itemStyle: {
            color: cat.growthRate > 0 ? '#10b981' : '#ef4444',
          },
        })),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
        },
      },
    ],
  };

  const onEvents = {
    click: (params: any) => {
      if (onCategoryClick) {
        onCategoryClick(params.name);
      }
    },
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: '500px' }}
      onEvents={onEvents}
    />
  );
};

