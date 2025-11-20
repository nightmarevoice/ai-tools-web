import ReactECharts from 'echarts-for-react';
import { Product } from '../../../../../types';

interface Props {
  products: Product[];
}

export const GeographicHeatMap: React.FC<Props> = ({ products }) => {
  // 聚合所有产品的地理分布数据
  const geoMap = new Map<string, number>();

  products.forEach((product) => {
    product.geographic_distribution.forEach((geo) => {
      const current = geoMap.get(geo.code) || 0;
      geoMap.set(geo.code, current + geo.percentage);
    });
  });

  const geoData = Array.from(geoMap.entries())
    .map(([code, value]) => ({ name: code, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 20);

  const option = {
    title: {
      text: '地理分布热力图',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%',
    },
    visualMap: {
      min: 0,
      max: Math.max(...geoData.map((d) => d.value)),
      text: ['高', '低'],
      realtime: false,
      calculable: true,
      inRange: {
        color: ['#e0f3ff', '#006edd'],
      },
    },
    series: [
      {
        name: '地区分布',
        type: 'map',
        map: 'world',
        roam: true,
        itemStyle: {
          areaColor: '#f3f3f3',
          borderColor: '#999',
        },
        emphasis: {
          label: {
            show: true,
          },
          itemStyle: {
            areaColor: '#ffd700',
          },
        },
        data: geoData,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '500px' }} />;
};

