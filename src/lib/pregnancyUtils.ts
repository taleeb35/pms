// Utility functions for pregnancy tracking

export const calculatePregnancyDuration = (startDate: string | null): string | null => {
  if (!startDate) return null;
  
  const start = new Date(startDate);
  const now = new Date();
  
  // Calculate total days
  const diffTime = now.getTime() - start.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (totalDays < 0) return null;
  
  // Calculate actual calendar months
  let months = 0;
  let years = now.getFullYear() - start.getFullYear();
  months = years * 12;
  months += now.getMonth() - start.getMonth();
  
  // Adjust if we haven't reached the same day in the current month
  if (now.getDate() < start.getDate()) {
    months--;
  }
  
  // Calculate remaining days
  const startDayOfMonth = start.getDate();
  const currentDay = now.getDate();
  let remainingDays = 0;
  
  if (currentDay >= startDayOfMonth) {
    remainingDays = currentDay - startDayOfMonth;
  } else {
    // Need to borrow from previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    remainingDays = prevMonth.getDate() - startDayOfMonth + currentDay;
  }
  
  // Calculate weeks from remaining days
  const weeks = Math.floor(remainingDays / 7);
  const days = remainingDays % 7;
  
  // Format output based on duration
  if (months === 0 && weeks === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (months === 0) {
    if (days === 0) {
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
    return `${weeks} week${weeks !== 1 ? 's' : ''} and ${days} day${days !== 1 ? 's' : ''}`;
  } else {
    // Show in months, weeks, and days format
    const parts = [];
    parts.push(`${months} month${months !== 1 ? 's' : ''}`);
    if (weeks > 0) {
      parts.push(`${weeks} week${weeks !== 1 ? 's' : ''}`);
    }
    if (days > 0) {
      parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    }
    
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts.join(' and ');
    return `${parts[0]}, ${parts[1]} and ${parts[2]}`;
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
