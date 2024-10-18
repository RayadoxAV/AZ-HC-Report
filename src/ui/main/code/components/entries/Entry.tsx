import { MouseEvent, MouseEventHandler } from 'react';

interface EntryProps {
  week: number;
  year: number;
  autozonerCount: number;
  onClick?: (week: number, year: number) => void;
  onDelete?: (week: number, year: number) => void;
  listIndex?: number;
}

const Entry: React.FC<EntryProps> = ({ week, year, autozonerCount, onClick, onDelete, listIndex }) => {

  function handleClickEvent(event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>): void {
    if (event.currentTarget === event.target) {
      if (onClick) {
        onClick(week, year);
      }
    }
  }

  function handleDeleteEvent(): void {
    if (onDelete) {
      onDelete(week, year);
    }
  }

  return (
    <div className="entry fade-in-up" onClick={handleClickEvent} style={{ animationDelay: `${(listIndex || 0) * 50}ms` }}>
      <div className="pair" style={{ gridArea: 'pair-1' }}>
        <span className="name">Week</span>
        <span className="value">{week}</span>
      </div>
      <div className="pair" style={{ gridArea: 'pair-2' }}>
        <span className="name">Year</span>
        <span className="value">{year}</span>
      </div>
      <div className="pair" style={{ gridArea: 'pair-3' }}>
        <span className="name">AutoZoners</span>
        <span className="value">{autozonerCount}</span>
      </div>
      <button style={{ gridArea: 'button' }} onClick={handleDeleteEvent}>
        <img src="./assets/icons/delete.svg" alt="Delete" />
      </button>
    </div>
  );
}

export default Entry;