import ReactECharts from 'echarts-for-react';
import { Product } from '../../../../../types';
import { formatVisits } from '@/utils/dataParser';

interface Props {
  products: Product[];
}

export const ProductTrendChart: React.FC<Props> = ({ products }) => {
  // 取前5个产品
  const topProducts = products.slice(0, 5);

  const months = topProducts[0]?.trend_data.map((t) => t.month) || [];

  const series = topProducts.map((product) => ({
    name: product.app_name,
    type: 'line',
    data: product.trend_data.map((t) => t.value),
    smooth: true,
  }));

  const option = {
    title: {
      text: '产品趋势对比',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((item: any) => {
          result += `${item.marker} ${item.seriesName}: ${formatVisits(item.value)}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: topProducts.map((p) => p.app_name),
      top: 30,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      top: 80,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months,
    },
    yAxis: {
      type: 'value',
      name: '访问量',
      axisLabel: {
        formatter: (value: number) => formatVisits(value),
      },
    },
    series,
  };

  return <ReactECharts option={option} style={{ height: '400px' }} />;
};

