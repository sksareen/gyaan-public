import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import SwipeableCard from './SwipeableCard';
import { generateLearningCards } from '../services/api';

const TikTokSwipe = () => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch card data on component mount
  useEffect(() => {
    const getCards = async () => {
      try {
        const response = await generateLearningCards('general', 'beginner');
        // Assume response has a structure similar to:
        // [{ title: 'Quantum Physics', description: '...', type: 'Science' }]
        const apiCards = response.map((item) => ({
          topic: item.title,
          hook: item.description, // or generate a hook from description
          teaser: 'Swipe down to learn more.',
        }));

        setCards(apiCards);
      } catch (error) {
        console.error('Error fetching cards:', error);
      }
    };

    getCards();
  }, []);

  const handleSwipedUp = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSwipedDown = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlers = useSwipeable({
    onSwipedUp: handleSwipedUp,
    onSwipedDown: handleSwipedDown,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div {...handlers} style={{ touchAction: 'none' }}>
      {cards.length > 0 && (
        <SwipeableCard
          topic={cards[currentIndex].topic}
          hook={cards[currentIndex].hook}
          teaser={cards[currentIndex].teaser}
        />
      )}
    </div>
  );
};

export default TikTokSwipe;