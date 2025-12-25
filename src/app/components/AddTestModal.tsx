import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Activity, PlusCircle } from 'lucide-react';
import { BloodParameter } from '../App';

interface AddTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: BloodParameter[];
  selectedParameter: BloodParameter;
  onAddTest: (parameterId: string, value: number, date: Date) => void;
  onOpenAddParameter?: () => void;
}

export function AddTestModal({
  isOpen,
  onClose,
  parameters,
  selectedParameter,
  onAddTest,
  onOpenAddParameter,
}: AddTestModalProps) {
  const [parameter, setParameter] = useState(selectedParameter);
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setParameter(selectedParameter);
      setValue('');
      setDate(new Date().toISOString().split('T')[0]);
      setError('');
    }
  }, [isOpen, selectedParameter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setError('Введите корректное значение');
      return;
    }

    if (!date) {
      setError('Выберите дату');
      return;
    }

    const selectedDate = new Date(date);
    if (selectedDate > new Date()) {
      setError('Дата не может быть в будущем');
      return;
    }

    onAddTest(parameter.id, numValue, selectedDate);
  };

  const isWithinNormalRange = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;
    return numValue >= parameter.normalRange.min && numValue <= parameter.normalRange.max;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-zinc-900 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Добавить результат</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Выбор параметра */}
              <div className="mb-6">
                <label className="block text-sm text-zinc-400 mb-3">Параметр анализа</label>
                <div className="space-y-2">
                  {parameters.map((param) => (
                    <button
                      key={param.id}
                      type="button"
                      onClick={() => setParameter(param)}
                      className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                        parameter.id === param.id
                          ? 'bg-zinc-800 border-2'
                          : 'bg-zinc-800/50 border-2 border-transparent hover:bg-zinc-800'
                      }`}
                      style={{
                        borderColor: parameter.id === param.id ? param.color : 'transparent',
                      }}
                    >
                      <div
                        className="w-1 h-10 rounded-full"
                        style={{ backgroundColor: param.color }}
                      />
                      <div className="text-left flex-1">
                        <p className="font-medium">{param.name}</p>
                        <p className="text-sm text-zinc-400">
                          Норма: {param.normalRange.min} - {param.normalRange.max} {param.unit}
                        </p>
                      </div>
                      {parameter.id === param.id && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: param.color }}
                        />
                      )}
                    </button>
                  ))}
                </div>
                {onOpenAddParameter && (
                  <button
                    type="button"
                    onClick={onOpenAddParameter}
                    className="w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all bg-zinc-800/50 border-2 border-transparent hover:bg-zinc-800"
                  >
                    <PlusCircle className="w-5 h-5 text-zinc-500" />
                    <p className="font-medium">Добавить новый параметр</p>
                  </button>
                )}
              </div>

              {/* Значение */}
              <div className="mb-6">
                <label className="block text-sm text-zinc-400 mb-2">
                  Значение ({parameter.unit})
                </label>
                <div className="relative">
                  <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      setError('');
                    }}
                    placeholder={`Введите значение`}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all"
                    style={{
                      focusRingColor: parameter.color,
                    }}
                  />
                </div>
                {value && isWithinNormalRange() !== null && (
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        isWithinNormalRange()
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {isWithinNormalRange() ? '✓ В пределах нормы' : '⚠ Вне нормы'}
                    </div>
                  </div>
                )}
              </div>

              {/* Дата */}
              <div className="mb-6">
                <label className="block text-sm text-zinc-400 mb-2">Дата анализа</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setError('');
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 transition-all"
                    style={{
                      colorScheme: 'dark',
                    }}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl"
                >
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95"
                  style={{
                    backgroundColor: parameter.color,
                    color: 'white',
                  }}
                >
                  Добавить
                </button>
              </div>
            </form>

            {/* Safe area для iPhone */}
            <div className="h-8" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}