/* 
  Raymundo Paz
  September 2024
*/

import { AutoZoner } from '../data/models/autozoner';

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

export function fillManagers(zoners: AutoZoner[], ) {
  const managerIgnitionIds = ['10550553', '10550643', '10551051', '10551087', '10551566', '10550641'];
  const managerNames = new Map<string, string>();
  managerNames.set('10550553', 'Corina');
  managerNames.set('10550643', 'Marisol');
  managerNames.set('10551051', 'Laura');
  managerNames.set('10551087', 'Gema');
  managerNames.set('10551566', 'Javier');
  managerNames.set('10550641', 'Teresa');
  const zonerMap = new Map<string, string>();

  for (let i = 0; i < zoners.length; i++) {
    const currentZoner = zoners[i];
    zonerMap.set(currentZoner.ignitionId, currentZoner.supervisorId);
  }

  for (let i = 0; i < zoners.length; i++) {
    const currentZoner = zoners[i];
    currentZoner.manager = managerNames.get(getDirectSupervisor(currentZoner.ignitionId)) || null;
  }

  function getDirectSupervisor(ignitionId: string): string {
    if (managerIgnitionIds.includes(ignitionId)) {
      return null;
    }

    const supervisorId = zonerMap.get(ignitionId);
    if (!supervisorId) {
      return null;
    }

    if (managerIgnitionIds.includes(supervisorId)) {
      return supervisorId;
    } else {
      return getDirectSupervisor(supervisorId);
    }
  }
}