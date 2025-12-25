import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BloodParameter } from '../App';
import { motion, AnimatePresence } from 'motion/react';

interface ParameterSelectorProps {
  parameters: BloodParameter[];
  selectedParameter: BloodParameter;
  onSelectParameter: (parameter: BloodParameter) => void;
}

export function ParameterSelector({
  parameters,
  selectedParameter,
  onSelectParameter,
}: ParameterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (parameter: BloodParameter) => {
    onSelectParameter(parameter);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Кнопка выбора */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-900 rounded-2xl px-6 py-5 flex items-center justify-between hover:bg-zinc-800 transition-colors"
        style={{ height: '70px' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-1 h-10 rounded-full"
            style={{ backgroundColor: selectedParameter.color }}
          />
          <div className="text-left">
            <p className="font-semibold text-lg">{selectedParameter.name}</p>
            <p className="text-sm text-zinc-400">{selectedParameter.unit}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-zinc-400" />
        </motion.div>
      </button>

      {/* Выпадающий список */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay для закрытия */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Список параметров */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 rounded-2xl overflow-hidden z-50 shadow-xl"
            >
              {parameters.map((parameter, index) => (
                <motion.button
                  key={parameter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSelect(parameter)}
                  className={`w-full px-6 py-4 flex items-center gap-3 hover:bg-zinc-800 transition-colors ${
                    index !== parameters.length - 1 ? 'border-b border-zinc-800' : ''
                  } ${selectedParameter.id === parameter.id ? 'bg-zinc-800' : ''}`}
                >
                  <div 
                    className="w-1 h-10 rounded-full"
                    style={{ backgroundColor: parameter.color }}
                  />
                  <div className="text-left flex-1">
                    <p className="font-medium">{parameter.name}</p>
                    <p className="text-sm text-zinc-400">{parameter.unit}</p>
                  </div>
                  {selectedParameter.id === parameter.id && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: parameter.color }} />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
