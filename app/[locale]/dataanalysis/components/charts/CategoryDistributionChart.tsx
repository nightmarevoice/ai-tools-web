import ReactECharts from 'echarts-for-react';
import { CategoryStats } from '../../../../../types';
import { formatVisits } from '../../../../../utils/dataParser';

interface Props {
  data: CategoryStats[];
  onCategoryClick?: (category: string) => void;
}

export const CategoryDistributionChart: React.FC<Props> = ({ data, onCategoryClick }) => {
  const topCategories = data.slice(0, 15);

  const option = {
    title: {
      text: '类目流量分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const cat = topCategories[params.dataIndex];
        return `${params.name}<br/>
          总访问量: ${formatVisits(cat.totalVisits)}<br/>
          产品数: ${cat.productCount}<br/>
          占比: ${params.percent}%`;
      },
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 20,
      bottom: 20,
    },
    series: [
      {
        name: '类目',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: topCategories.map((cat) => ({
          value: cat.totalVisits,
          name: cat.name,
        })),
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

