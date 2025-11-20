import ReactECharts from 'echarts-for-react';
import { OpportunityData } from '../../../../../types';

interface Props {
  data: OpportunityData[];
  onCategoryClick?: (category: string) => void;
}

export const OpportunityMatrix: React.FC<Props> = ({ data, onCategoryClick }) => {
  const chartData = data.map((opp) => [
    opp.productCount,
    opp.avgGrowthRate,
    opp.category,
  ]);

  const option = {
    title: {
      text: '长尾机会矩阵',
      subtext: '产品数量 vs 增长率',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const [count, growth, name] = params.value;
        return `${name}<br/>产品数: ${count}<br/>增长率: ${growth.toFixed(2)}%`;
      },
    },
    xAxis: {
      name: '产品数量',
      nameLocation: 'middle',
      nameGap: 30,
    },
    yAxis: {
      name: '平均增长率 (%)',
      nameLocation: 'middle',
      nameGap: 40,
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '10%',
      top: '15%',
    },
    series: [
      {
        name: '类目',
        type: 'scatter',
        symbolSize: (value: number[]) => Math.max(value[0] * 3, 20),
        data: chartData,
        itemStyle: {
          color: '#3b82f6',
          opacity: 0.6,
        },
        emphasis: {
          itemStyle: {
            color: '#2563eb',
            opacity: 1,
          },
        },
        label: {
          show: true,
          formatter: (params: any) => params.value[2],
          position: 'top',
        },
      },
    ],
  };

  const onEvents = {
    click: (params: any) => {
      if (onCategoryClick) {
        onCategoryClick(params.value[2]);
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

