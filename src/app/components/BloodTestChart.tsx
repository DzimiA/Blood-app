import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { BloodParameter, ChartDataPoint } from '../App';

interface BloodTestChartProps {
  data: ChartDataPoint[];
  parameter: BloodParameter;
}

export function BloodTestChart({ data, parameter }: BloodTestChartProps) {
  const [activePoint, setActivePoint] = useState<ChartDataPoint | null>(null);

  // Кастомный тултип
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      setActivePoint(data);
      
      return (
        <div className="bg-zinc-800 px-4 py-3 rounded-xl shadow-lg border border-zinc-700">
          <p className="text-sm text-zinc-400 mb-1">{data.date}</p>
          <p className="text-lg font-semibold" style={{ color: parameter.color }}>
            {data.value} {parameter.unit}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {data.value >= parameter.normalRange.min && data.value <= parameter.normalRange.max
              ? 'В пределах нормы'
              : 'Вне нормы'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Кастомная точка
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isActive = activePoint?.timestamp === payload.timestamp;
    
    return (
      <g>
        {isActive && (
          <circle
            cx={cx}
            cy={cy}
            r={12}
            fill={parameter.color}
            opacity={0.2}
            className="animate-pulse"
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isActive ? 6 : 4}
          fill={parameter.color}
          stroke="#000"
          strokeWidth={2}
        />
      </g>
    );
  };

  // Расчет границ для оси Y
  const values = data.map(d => d.value);
  const minValue = Math.min(...values, parameter.normalRange.min);
  const maxValue = Math.max(...values, parameter.normalRange.max);
  const padding = (maxValue - minValue) * 0.2;

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-4 backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-sm text-zinc-400 mb-1">График изменений</h3>
        <p className="text-xl font-semibold">{parameter.name}</p>
      </div>

      <div className="h-[400px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            onMouseLeave={() => setActivePoint(null)}
          >
            <defs>
              <linearGradient id={`gradient-${parameter.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={parameter.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={parameter.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            
            {/* Сетка */}
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#27272a"
              strokeOpacity={0.3}
              vertical={false}
            />
            
            {/* Оси */}
            <XAxis 
              dataKey="date" 
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#27272a' }}
            />
            <YAxis 
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#27272a' }}
              domain={[minValue - padding, maxValue + padding]}
              tickFormatter={(value) => value.toFixed(1)}
            />

            {/* Зона нормы */}
            <ReferenceLine 
              y={parameter.normalRange.max} 
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeOpacity={0.3}
              label={{ 
                value: 'Макс', 
                fill: '#10b981', 
                fontSize: 10,
                position: 'right'
              }}
            />
            <ReferenceLine 
              y={parameter.normalRange.min} 
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeOpacity={0.3}
              label={{ 
                value: 'Мин', 
                fill: '#10b981', 
                fontSize: 10,
                position: 'right'
              }}
            />

            {/* Тултип */}
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: parameter.color, strokeWidth: 1, strokeDasharray: '5 5' }}
            />

            {/* График */}
            <Area
              type="monotone"
              dataKey="value"
              stroke={parameter.color}
              strokeWidth={3}
              fill={`url(#gradient-${parameter.id})`}
              dot={<CustomDot />}
              activeDot={<CustomDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Информация об активной точке */}
      {activePoint && (
        <div className="mt-4 p-3 bg-zinc-800 rounded-xl border border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Выбранная дата:</span>
            <span className="font-medium">{activePoint.date}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-zinc-400">Значение:</span>
            <span className="font-semibold" style={{ color: parameter.color }}>
              {activePoint.value} {parameter.unit}
            </span>
          </div>
        </div>
      )}

      {/* Шкала времени */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">
          6 мес
        </button>
        <button className="px-3 py-1.5 bg-blue-600 rounded-lg text-sm">
          1 год
        </button>
        <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">
          2 года
        </button>
        <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors">
          Все
        </button>
      </div>
    </div>
  );
}