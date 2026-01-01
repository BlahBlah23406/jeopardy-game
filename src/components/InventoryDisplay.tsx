import { motion } from 'framer-motion';
import { Sparkles, ArrowRightLeft, RotateCcw } from 'lucide-react';
import { AdvantageCard, AdvantageCardType } from '../types';

interface InventoryDisplayProps {
    inventory: AdvantageCard[];
    onActivate: (card: AdvantageCard) => void;
    canActivate: boolean;
}

const CARD_ICONS: Record<AdvantageCardType, React.ElementType> = {
    'DOUBLE_POINTS': Sparkles,
    'STEAL_SELECTION': ArrowRightLeft,
    'RESET_REP': RotateCcw
};

const CARD_COLORS: Record<AdvantageCardType, string> = {
    'DOUBLE_POINTS': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    'STEAL_SELECTION': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    'RESET_REP': 'text-blue-400 bg-blue-400/10 border-blue-400/30'
};

const CARD_LABELS: Record<AdvantageCardType, string> = {
    'DOUBLE_POINTS': 'Double Points',
    'STEAL_SELECTION': 'Steal Turn',
    'RESET_REP': 'Reset Reps'
};

export function InventoryDisplay({ inventory, onActivate, canActivate }: InventoryDisplayProps) {
    if (inventory.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {inventory.map((card, index) => {
                const Icon = CARD_ICONS[card.type];
                return (
                    <motion.button
                        key={`${card.type}-${index}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (canActivate) onActivate(card);
                        }}
                        whileHover={canActivate ? { scale: 1.05 } : {}}
                        whileTap={canActivate ? { scale: 0.95 } : {}}
                        className={`
                            relative group flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold border
                            ${CARD_COLORS[card.type]}
                            ${canActivate ? 'cursor-pointer hover:bg-opacity-20' : 'opacity-50 cursor-not-allowed'}
                            transition-all
                        `}
                        title={canActivate ? "Click to Activate" : "Cannot activate right now"}
                    >
                        <Icon className="w-3 h-3" />
                        <span>{CARD_LABELS[card.type]}</span>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black/90 text-white text-[10px] p-2 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal text-center z-50 border border-gray-700">
                            {card.description}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}
