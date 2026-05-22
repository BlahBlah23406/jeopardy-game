import { Category, Question } from '../types';

export const generateGameData = (customCategories?: Category[]): Category[] => {
    let categories: Category[] = [];

    if (customCategories && customCategories.length > 0) {
        categories = customCategories;
    } else {
        const CATEGORY_NAMES = ['Mario Kart', 'Mario Party', '2025 Stats', 'Japanese', 'VEX', 'Physical'];

        for (let c = 1; c <= 6; c++) {
            const questions: Question[] = [];
            for (let q = 1; q <= 5; q++) {
                questions.push({
                    id: `c${c}-q${q}`,
                    points: q * 100,
                    text: `${CATEGORY_NAMES[c - 1]} Question for ${q * 100} points`,
                    answer: `Answer for ${q * 100}`,
                    moreInfo: `More info for ${CATEGORY_NAMES[c - 1]} ${q * 100}`,
                    isAnswered: false,
                });
            }
            categories.push({
                id: `c${c}`,
                title: CATEGORY_NAMES[c - 1],
                questions,
            });
        }
    }

    // Flatten all questions to select random 4 for Double Jeopardy
    const allQuestions: Question[] = [];
    categories.forEach(cat => allQuestions.push(...cat.questions));

    // Select 4 unique random indices
    const doubleJeopardyIndices = new Set<number>();
    // Ensure we don't loop forever if few questions
    const maxDJ = Math.min(4, allQuestions.length);

    while (doubleJeopardyIndices.size < maxDJ) {
        doubleJeopardyIndices.add(Math.floor(Math.random() * allQuestions.length));
    }

    // Apply Double Jeopardy
    doubleJeopardyIndices.forEach(index => {
        allQuestions[index].isDoubleJeopardy = true;
    });

    // Advantage Card Distribution
    // Filter out Double Jeopardy questions for card placement
    const availableForCards = allQuestions.filter(q => !q.isDoubleJeopardy);
    const cardIndices = new Set<number>();

    // Select 9 unique questions for cards (or fewer if not enough questions)
    const maxCards = Math.min(9, availableForCards.length);

    while (cardIndices.size < maxCards) {
        cardIndices.add(Math.floor(Math.random() * availableForCards.length));
    }

    const cardTypes: import('../types').AdvantageCardType[] = [
        'DOUBLE_POINTS', 'DOUBLE_POINTS', 'DOUBLE_POINTS',
        'STEAL_SELECTION', 'STEAL_SELECTION', 'STEAL_SELECTION',
        'RESET_REP', 'RESET_REP', 'RESET_REP'
    ];

    let cardTypeIndex = 0;
    cardIndices.forEach(index => {
        if (cardTypeIndex < cardTypes.length) {
            availableForCards[index].rewardCard = cardTypes[cardTypeIndex];
            cardTypeIndex++;
        }
    });

    return categories;
};

export const generateFinalJeopardyQuestions = (customQuestions?: Question[]): Question[] => {
    if (customQuestions && customQuestions.length > 0) {
        const finalQuestions: Question[] = [];
        const needed = 20;

        for (let i = 0; i < needed; i++) {
            const sourceQ = customQuestions[i % customQuestions.length];
            finalQuestions.push({
                ...sourceQ,
                id: `fj-gen-${i}-${sourceQ.id}`,
                text: (i >= customQuestions.length) ? `${sourceQ.text} (Repeated)` : sourceQ.text
            });
        }
        return finalQuestions;
    }

    return [
        {
            id: 'fj-1',
            points: 2000,
            text: 'This video game character is known for his green cap and high jump.',
            answer: 'Luigi',
            isAnswered: false
        },
        {
            id: 'fj-2',
            points: 2000,
            text: 'The year the first iPhone was released.',
            answer: '2007',
            isAnswered: false
        },
        {
            id: 'fj-3',
            points: 2000,
            text: 'Capital city of Japan.',
            answer: 'Tokyo',
            isAnswered: false
        },
        {
            id: 'fj-4',
            points: 2000,
            text: 'A robotics competition platform used in high schools.',
            answer: 'VEX',
            isAnswered: false
        },
        {
            id: 'fj-5',
            points: 2000,
            text: 'The largest planet in our solar system.',
            answer: 'Jupiter',
            isAnswered: false
        },
        {
            id: 'fj-6',
            points: 2000,
            text: 'The chemical symbol for Gold.',
            answer: 'Au',
            isAnswered: false
        },
        {
            id: 'fj-7',
            points: 2000,
            text: '(Tie Breaker) The speed of light in vacuum (approximate km/s).',
            answer: '300,000',
            isAnswered: false
        }
    ];
};
