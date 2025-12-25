import { useState, useEffect } from 'react';
import { BloodTestChart } from './components/BloodTestChart';
import { ParameterSelector } from './components/ParameterSelector';
import { AddTestModal } from './components/AddTestModal';
import { AddParameterModal } from './components/AddParameterModal';
import { Menu, BellDot, Settings, Plus } from 'lucide-react';

// Типы анализов крови
export type BloodParameter = {
  id: string;
  name: string;
  unit: string;
  normalRange: { min: number; max: number };
  color: string;
};

export type ChartDataPoint = {
  date: string;
  value: number;
  timestamp: number;
};

// Доступные параметры
const defaultBloodParameters: BloodParameter[] = [
  { id: 'hemoglobin', name: 'Гемоглобин', unit: 'г/л', normalRange: { min: 120, max: 160 }, color: '#3B82F6' },
  { id: 'erythrocytes', name: 'Эритроциты', unit: '×10¹²/л', normalRange: { min: 3.5, max: 5.5 }, color: '#EF4444' },
  { id: 'leukocytes', name: 'Лейкоциты', unit: '×10⁹/л', normalRange: { min: 4, max: 9 }, color: '#10B981' },
  { id: 'platelets', name: 'Тромбоциты', unit: '×10⁹/л', normalRange: { min: 180, max: 320 }, color: '#F59E0B' },
  { id: 'esr', name: 'СОЭ', unit: 'мм/ч', normalRange: { min: 2, max: 15 }, color: '#8B5CF6' },
  { id: 'glucose', name: 'Глюкоза', unit: 'ммоль/л', normalRange: { min: 3.3, max: 5.5 }, color: '#EC4899' },
  { id: 'cholesterol', name: 'Холестерин', unit: 'ммоль/л', normalRange: { min: 3, max: 5.2 }, color: '#14B8A6' },
];

// Мок данные для графиков
const generateMockData = (parameterId: string, parameters: BloodParameter[], months: number = 12) => {
  const data = [];
  const param = parameters.find(p => p.id === parameterId);
  if (!param) return [];

  const { min, max } = param.normalRange;
  const range = max - min;

  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (months - 1 - i));
    
    // Генерируем значение в пределах нормы с небольшими колебаниями
    const baseValue = min + range / 2;
    const variation = (Math.random() - 0.5) * range * 0.6;
    const value = +(baseValue + variation).toFixed(1);

    data.push({
      date: date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }),
      value,
      timestamp: date.getTime(),
    });
  }

  return data;
};

export default function App() {
  const [bloodParameters, setBloodParameters] = useState<BloodParameter[]>(defaultBloodParameters);
  const [selectedParameter, setSelectedParameter] = useState<BloodParameter>(defaultBloodParameters[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddParameterModalOpen, setIsAddParameterModalOpen] = useState(false);
  const [allData, setAllData] = useState<Record<string, ChartDataPoint[]>>({});

  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    // Загружаем параметры
    const savedParameters = localStorage.getItem('bloodParameters');
    if (savedParameters) {
      const parsedParams = JSON.parse(savedParameters);
      setBloodParameters(parsedParams);
      setSelectedParameter(parsedParams[0]);
    }

    // Загружаем данные
    const savedData = localStorage.getItem('bloodTestData');
    if (savedData) {
      setAllData(JSON.parse(savedData));
    } else {
      // Инициализация с моковыми данными
      const initialData: Record<string, ChartDataPoint[]> = {};
      defaultBloodParameters.forEach(param => {
        initialData[param.id] = generateMockData(param.id, defaultBloodParameters);
      });
      setAllData(initialData);
      localStorage.setItem('bloodTestData', JSON.stringify(initialData));
    }
  }, []);

  // Функция для добавления нового результата
  const handleAddTest = (parameterId: string, value: number, date: Date) => {
    const newDataPoint: ChartDataPoint = {
      date: date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }),
      value,
      timestamp: date.getTime(),
    };

    const updatedData = {
      ...allData,
      [parameterId]: [...(allData[parameterId] || []), newDataPoint].sort((a, b) => a.timestamp - b.timestamp),
    };

    setAllData(updatedData);
    localStorage.setItem('bloodTestData', JSON.stringify(updatedData));
    setIsAddModalOpen(false);
  };

  // Функция для добавления нового параметра
  const handleAddParameter = (newParameter: BloodParameter) => {
    const updatedParameters = [...bloodParameters, newParameter];
    setBloodParameters(updatedParameters);
    setSelectedParameter(newParameter);
    
    // Инициализируем пустой массив данных для нового параметра
    const updatedData = {
      ...allData,
      [newParameter.id]: [],
    };
    
    setAllData(updatedData);
    localStorage.setItem('bloodParameters', JSON.stringify(updatedParameters));
    localStorage.setItem('bloodTestData', JSON.stringify(updatedData));
    setIsAddParameterModalOpen(false);
  };

  const chartData = allData[selectedParameter.id] || [];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Статус бар iPhone */}
      <div className="px-6 pt-3 pb-2 flex items-center justify-between">
        <span className="text-sm">10:28</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-[2px]">
            <div className="w-[3px] h-2 bg-white rounded-sm"></div>
            <div className="w-[3px] h-3 bg-white rounded-sm"></div>
            <div className="w-[3px] h-4 bg-white rounded-sm"></div>
            <div className="w-[3px] h-[18px] bg-white rounded-sm"></div>
          </div>
          <svg className="w-4 h-3" viewBox="0 0 16 12" fill="white">
            <path d="M0 3a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H2a2 2 0 01-2-2V3z"/>
            <path d="M12 5v2a1 1 0 001 1h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1z"/>
          </svg>
          <div className="px-1.5 py-0.5 bg-white text-black text-[10px] font-semibold rounded">
            6G
          </div>
        </div>
      </div>

      {/* Навигационная панель */}
      <div className="px-6 py-4 flex items-center justify-between">
        <button className="p-2 -ml-2">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
            K
          </div>
          <span className="font-medium">Kimi</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2">
            <BellDot className="w-5 h-5" />
          </button>
          <button className="p-2">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Заголовок */}
      <div className="px-6 py-4">
        <h1 className="text-2xl font-semibold">Мои анализы</h1>
      </div>

      {/* Выбор параметра */}
      <div className="px-6 py-4">
        <ParameterSelector
          parameters={bloodParameters}
          selectedParameter={selectedParameter}
          onSelectParameter={setSelectedParameter}
        />
      </div>

      {/* График */}
      <div className="px-6 py-4">
        <BloodTestChart
          data={chartData}
          parameter={selectedParameter}
        />
      </div>

      {/* Информация о норме */}
      <div className="px-6 py-4">
        <div className="bg-zinc-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400">Норма</span>
            <span className="text-sm font-medium">
              {selectedParameter.normalRange.min} - {selectedParameter.normalRange.max} {selectedParameter.unit}
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full"
              style={{ 
                width: '70%',
                background: `linear-gradient(to right, ${selectedParameter.color}, ${selectedParameter.color}dd)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Последние результаты */}
      <div className="px-6 py-4">
        <h2 className="text-lg font-semibold mb-4">Последние результаты</h2>
        <div className="space-y-3">
          {chartData.slice(-3).reverse().map((item, index) => (
            <div 
              key={index}
              className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{item.value} {selectedParameter.unit}</p>
                <p className="text-sm text-zinc-400">{item.date}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                item.value >= selectedParameter.normalRange.min && 
                item.value <= selectedParameter.normalRange.max
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {item.value >= selectedParameter.normalRange.min && 
                 item.value <= selectedParameter.normalRange.max
                  ? 'Норма'
                  : 'Внимание'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Плавающая кнопка добавления */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-8 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
        style={{ zIndex: 50 }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Модальное окно добавления */}
      <AddTestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        parameters={bloodParameters}
        selectedParameter={selectedParameter}
        onAddTest={handleAddTest}
        onOpenAddParameter={() => {
          setIsAddModalOpen(false);
          setIsAddParameterModalOpen(true);
        }}
      />

      {/* Модальное окно добавления параметра */}
      <AddParameterModal
        isOpen={isAddParameterModalOpen}
        onClose={() => setIsAddParameterModalOpen(false)}
        onAddParameter={handleAddParameter}
      />
    </div>
  );
}