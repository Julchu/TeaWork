'use client';
import React, { FC, MouseEvent, useState } from 'react';

const items = [
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
  {
    id: 1,
    content: 'content 1',
  },
  {
    id: 2,
    content: 'content 1',
  },
  {
    id: 3,
    content: 'content 1',
  },
];

// Usage: <InfiniteScrollList itemHeight={20} containerHeight={500} />
const InfiniteScrollList: FC<{ itemHeight: number; containerHeight: number }> = ({
  itemHeight,
  containerHeight,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight), items.length - 1);
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetTop = startIndex * itemHeight;
  const handleScroll = (event: MouseEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };
  return (
    <div
      style={{ height: `${containerHeight}px`, overflowY: 'scroll', width: '500px' }}
      onScroll={handleScroll}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ position: 'absolute', top: `${offsetTop}px` }}>
          {visibleItems.map(item => (
            <div key={item.id} style={{ height: `${itemHeight}px` }}>
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfiniteScrollList;