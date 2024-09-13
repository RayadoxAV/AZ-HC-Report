export function getCurrentFiscalYear(): number {
  const now = new Date();

  const august = new Date(`${now.getFullYear()}/08/31`);
  let lastSaturday: Date;

  for (let i = 0; i < 8; i++) {
    const testDate = new Date(august.getTime() - (i * 86400000));

    if (testDate.getDay() === 6) {
      lastSaturday = testDate;
    }
  }

  if (now.getTime() <= lastSaturday.getTime()) {
    console.log(now, lastSaturday);
    return now.getFullYear();
  } else {
    return now.getFullYear() + 1;
  }
}

export function getDateForCell(date: string): Date {
  const [day, month, year] = date.split('/');
  return new Date(new Date(`${year}/${month}/${day}`).getTime() - 21600000);
}