// Utility functions for pregnancy tracking

export const calculatePregnancyDuration = (startDate: string | null): string | null => {
  if (!startDate) return null;
  
  const start = new Date(startDate);
  const now = new Date();
  
  // Calculate total days
  const diffTime = now.getTime() - start.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (totalDays < 0) return null;
  
  // Calculate weeks and days
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  
  // Calculate months approximation (4 weeks = 1 month)
  const months = Math.floor(weeks / 4);
  const remainingWeeks = weeks % 4;
  
  // Format output based on duration
  if (weeks === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (weeks < 4) {
    if (days === 0) {
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
    return `${weeks} week${weeks !== 1 ? 's' : ''} and ${days} day${days !== 1 ? 's' : ''}`;
  } else {
    // Show in months and weeks format
    if (remainingWeeks === 0 && days === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (days === 0) {
      return `${months} month${months !== 1 ? 's' : ''} and ${remainingWeeks} week${remainingWeeks !== 1 ? 's' : ''}`;
    } else if (remainingWeeks === 0) {
      return `${months} month${months !== 1 ? 's' : ''} and ${days} day${days !== 1 ? 's' : ''}`;
    } else {
      return `${months} month${months !== 1 ? 's' : ''}, ${remainingWeeks} week${remainingWeeks !== 1 ? 's' : ''} and ${days} day${days !== 1 ? 's' : ''}`;
    }
  }
};

export const calculateExpectedDueDate = (startDate: string | null): Date | null => {
  if (!startDate) return null;
  
  const start = new Date(startDate);
  // Pregnancy duration is typically 280 days (40 weeks)
  const dueDate = new Date(start);
  dueDate.setDate(dueDate.getDate() + 280);
  
  return dueDate;
};
