import { useContext, useEffect, useState } from 'react';
import LineChartWrapper from './LineChartWrapper';
import './Reports.css';
import { Entry } from '../../data/types';
import { AppContext, AppContextConsumer } from '../../data/ApplicationState';



const Reports = () => {

  const [appState] = useContext(AppContext);

  const [hcByCCWeekly, setHcByCCWeekly] = useState([]);
  const [hcGeneralWeekly, setHcGeneralWeekly] = useState([]);

  useEffect(() => {
    const tempList: Entry[] = [...appState.comparator.entryList];

    tempList.sort((a: Entry, b: Entry) => {
      if (a.fiscalYear > b.fiscalYear) {
        return -1;
      } else if (a.fiscalYear < b.fiscalYear) {
        return 1;
      } else {
        return 0;
      }
    });

    generateGeneralBehaviorWeekly(tempList);
    generateCCInfoWeekly(tempList);
  }, [appState.comparator.entryList]);

  function generateGeneralBehaviorWeekly(entryList: Entry[]): void {
    if (entryList.length === 0) {
      return;
    }

    const weeklyInfo = [];

    for (let i = 0; i < entryList.length; i++) {
      const currentEntry = entryList[i];
      const zonerCount = currentEntry.zoners.length;

      weeklyInfo.push(
        {
          week: `WK${currentEntry.week}`,
          hc: zonerCount
        }
      );
    }

    setHcGeneralWeekly(weeklyInfo);
  }

  function generateCCInfoWeekly(entryList: Entry[]): void {
    if (entryList.length === 0) {
      return;
    }
    const ccInfoWeekly = [];

    // NOTE: This will just group zoners inside the same cc as is shown in the object below this function.

    const costCenters = ['8288', '8264', '8098', '8027'];

    for (let i = 0; i < costCenters.length; i++) {
      const currentCC = costCenters[i];

      const ccInfo = [];

      for (let j = 0; j < entryList.length; j++) {
        const currentEntry = entryList[j];

        let grade11Count = 0;
        let grade12Count = 0;
        let grade13Count = 0;
        let grade14Count = 0;
        let grade15Count = 0;
        let grade16Count = 0;
        let grade17Count = 0;
        let grade18Count = 0;

        for (let k = 0; k < currentEntry.zoners.length; k++) {
          const currentZoner = currentEntry.zoners[k];
          if (currentZoner.cc === currentCC) {
            switch (currentZoner.grade) {
              case 11:
                grade11Count += 1;
                break;
              case 12:
                grade12Count += 1;
                break;
              case 13:
                grade13Count += 1;
                break;
              case 14:
                grade14Count += 1;
                break;
              case 15:
                grade15Count += 1;
                break;
              case 16:
                grade16Count += 1;
                break;
              case 17:
                grade17Count += 1;
                break;
              case 18:
                grade18Count += 1;
                break;
              default:
                console.log('Huh');
                break;
            }
          }
        }

        const week = {
          week: `WK${currentEntry.week}`,
          zonerCountLevel11: grade11Count,
          zonerCountLevel12: grade12Count,
          zonerCountLevel13: grade13Count,
          zonerCountLevel14: grade14Count,
          zonerCountLevel15: grade15Count,
          zonerCountLevel16: grade16Count,
          zonerCountLevel17: grade17Count,
          zonerCountLevel18: grade18Count,
        };

        ccInfo.push(week);
      }

      ccInfoWeekly.push(ccInfo);
    }

    setHcByCCWeekly(ccInfoWeekly);
  }

  function getCountPerGradeAndCCForLastWeek(grade: number, cc: string): number {
    if (hcByCCWeekly.length === 0) {
      return -1;
    }

    let costCenterInfo: any = undefined;

    switch (cc) {
      case '8288':
        costCenterInfo = hcByCCWeekly[0];
        break;
      case '8264':
        costCenterInfo = hcByCCWeekly[1];
        break;
      case '8098':
        costCenterInfo = hcByCCWeekly[2];
        break;
      case '8027':
        costCenterInfo = hcByCCWeekly[3];
        break;

      default:
        break;
    }

    let total = 0;

    switch (grade) {
      case 11:
        total = costCenterInfo[costCenterInfo.length - 1].zonerCountLevel11;
        break;
      case 12:
        total = costCenterInfo[costCenterInfo.length - 1].zonerCountLevel12;
        break;
      case 13:
        total = costCenterInfo[costCenterInfo.length - 1].zonerCountLevel13;
        break;
      case 14:
        total = costCenterInfo[costCenterInfo.length - 1].zonerCountLevel14;
        break;
      case 15:
        total = costCenterInfo[costCenterInfo.length - 1].zonerCountLevel15;
        break;
      case 16:
        total = costCenterInfo[costCenterInfo.length - 1].zonerCountLevel16;
        break;
      case 17:
        total = costCenterInfo[costCenterInfo.length - 1].zonerCountLevel17;
        break;
      case 18:
        total = costCenterInfo[costCenterInfo.length - 1].zonerCountLevel18;
        break;

      default:
        break;

    }

    // const total = costCenterInfo[costCenterInfo.length - 1].zonerCountLevel11;
    return total;
  }

  function getTotalForCCAndLastWeek(cc: string): number {
    if (hcByCCWeekly.length === 0) {
      return -1;
    }

    let costCenterInfo: any = undefined;
    switch (cc) {
      case '8288':
        costCenterInfo = hcByCCWeekly[0];
        break;
      case '8264':
        costCenterInfo = hcByCCWeekly[1];
        break;
      case '8098':
        costCenterInfo = hcByCCWeekly[2];
        break;
      case '8027':
        costCenterInfo = hcByCCWeekly[3];
        break;

      default:
        break;
    }

    const week = costCenterInfo[costCenterInfo.length - 1];
    let total: number = week.zonerCountLevel11;
    total += week.zonerCountLevel12;
    total += week.zonerCountLevel13;
    total += week.zonerCountLevel14;
    total += week.zonerCountLevel15;
    total += week.zonerCountLevel16;
    total += week.zonerCountLevel17;
    total += week.zonerCountLevel18;

    return total;
  }

  function getTotalGradeCountForAllCCs(grade: number): number {
    if (hcByCCWeekly.length === 0) {
      return -1;
    }

    let total: number = 0;

    for (let i = 0; i < hcByCCWeekly.length; i++) {
      const currentCC = hcByCCWeekly[i];

      const week = currentCC[currentCC.length - 1];

      switch (grade) {
        case 11:
          total += week.zonerCountLevel11;
          break;
        case 12:
          total += week.zonerCountLevel12;
          break;
        case 13:
          total += week.zonerCountLevel13;
          break;
        case 14:
          total += week.zonerCountLevel14;
          break;
        case 15:
          total += week.zonerCountLevel15;
          break;
        case 16:
          total += week.zonerCountLevel16;
          break;
        case 17:
          total += week.zonerCountLevel17;
          break;
        case 18:
          total += week.zonerCountLevel18;
          break;

        default:
          break;
      }
    }
    return total;
  }

  function checkIfBelowOrAbove(current: number, target: number): string {
    let className = '';
    if (current < target) {
      className = 'below';
    } else if (current > target) {
      className = 'above';
    } else {
      className = '';
    }

    return className;
  }

  return (
    <div className="reports-container">
      <LineChartWrapper index={0} hcGeneralWeekly={hcGeneralWeekly} hcByCCWeekly={hcByCCWeekly} />
      <table className="hc-table" style={{ gridArea: 'table-1' }}>
        <thead>
          <tr>
            <th>CC</th>
            <th>Current HC</th>
            <th>Planned HC</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>8288</td>
            <td>{getTotalForCCAndLastWeek('8288')}</td>
            <td>199</td>
          </tr>
          <tr>
            <td>11</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8288'), 52)}>{getCountPerGradeAndCCForLastWeek(11, '8288')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8288'), 52)}>52</td>
          </tr>
          <tr>
            <td>12</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(12, '8288'), 64)}>{getCountPerGradeAndCCForLastWeek(12, '8288')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(12, '8288'), 64)}>64</td>
          </tr>
          <tr>
            <td>13</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(13, '8288'), 38)}>{getCountPerGradeAndCCForLastWeek(13, '8288')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(13, '8288'), 38)}>38</td>
          </tr>
          <tr>
            <td>14</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(14, '8288'), 23)}>{getCountPerGradeAndCCForLastWeek(14, '8288')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(14, '8288'), 23)}>23</td>
          </tr>
          <tr>
            <td>15</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(15, '8288'), 15)}>{getCountPerGradeAndCCForLastWeek(15, '8288')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(15, '8288'), 15)}>15</td>
          </tr>
          <tr>
            <td>16</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(16, '8288'), 3)}>{getCountPerGradeAndCCForLastWeek(16, '8288')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(16, '8288'), 3)}>3</td>
          </tr>
          <tr>
            <td>17</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(17, '8288'), 3)}>{getCountPerGradeAndCCForLastWeek(17, '8288')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(17, '8288'), 3)}>3</td>
          </tr>
          <tr>
            <td>18</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(18, '8288') + 1, 1)}>{getCountPerGradeAndCCForLastWeek(18, '8288') + 1}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(18, '8288') + 1, 1)}>1</td>
          </tr>
        </tbody>
      </table>
      <table className="hc-table" style={{ gridArea: 'table-2' }}>
        <thead>
          <tr>
            <th>CC</th>
            <th>Current HC</th>
            <th>Planned HC</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>8264</td>
            <td >{getTotalForCCAndLastWeek('8264')}</td>
            <td >37</td>
          </tr>
          <tr>
            <td>11</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8264'), 8)}>{getCountPerGradeAndCCForLastWeek(11, '8264')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8264'), 8)}>8</td>
          </tr>
          <tr>
            <td>12</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(12, '8264'), 9)}>{getCountPerGradeAndCCForLastWeek(12, '8264')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(12, '8264'), 9)}>9</td>
          </tr>
          <tr>
            <td>13</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(13, '8264'), 12)}>{getCountPerGradeAndCCForLastWeek(13, '8264')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(13, '8264'), 12)}>12</td>
          </tr>
          <tr>
            <td>14</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(14, '8264'), 8)}>{getCountPerGradeAndCCForLastWeek(14, '8264')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(14, '8264'), 8)}>8</td>
          </tr>
          <tr>
            <td>15</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(15, '8264'), 0)}>{getCountPerGradeAndCCForLastWeek(15, '8264')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(15, '8264'), 0)}>0</td>
          </tr>
          <tr>
            <td>16</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(16, '8264'), 0)}>{getCountPerGradeAndCCForLastWeek(16, '8264')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(16, '8264'), 0)}>0</td>
          </tr>
          <tr>
            <td>17</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(17, '8264'), 0)}>{getCountPerGradeAndCCForLastWeek(17, '8264')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(17, '8264'), 0)}>0</td>
          </tr>
          <tr>
            <td>18</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(18, '8264'), 0)}>{getCountPerGradeAndCCForLastWeek(18, '8264')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(18, '8264'), 0)}>0</td>
          </tr>
        </tbody>
      </table>
      <table className="hc-table" style={{ gridArea: 'table-3' }}>
        <thead>
          <tr>
            <th>CC</th>
            <th>Current HC</th>
            <th>Planned HC</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>8098</td>
            <td>{getTotalForCCAndLastWeek('8098')}</td>
            <td>9</td>
          </tr>
          <tr>
            <td>11</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8098'), 4)}>{getCountPerGradeAndCCForLastWeek(11, '8098')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8098'), 4)}>4</td>
          </tr>
          <tr>
            <td>12</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(12, '8098'), 3)}>{getCountPerGradeAndCCForLastWeek(12, '8098')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(12, '8098'), 3)}>3</td>
          </tr>
          <tr>
            <td>13</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(13, '8098'), 1)}>{getCountPerGradeAndCCForLastWeek(13, '8098')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(13, '8098'), 1)}>1</td>
          </tr>
          <tr>
            <td>14</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(14, '8098'), 1)}>{getCountPerGradeAndCCForLastWeek(14, '8098')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(14, '8098'), 1)}>1</td>
          </tr>
          <tr>
            <td>15</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(15, '8098'), 0)}>{getCountPerGradeAndCCForLastWeek(15, '8098')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(15, '8098'), 0)}>0</td>
          </tr>
          <tr>
            <td>16</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(16, '8098'), 0)}>{getCountPerGradeAndCCForLastWeek(16, '8098')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(16, '8098'), 0)}>0</td>
          </tr>
          <tr>
            <td>17</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(17, '8098'), 0)}>{getCountPerGradeAndCCForLastWeek(17, '8098')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(17, '8098'), 0)}>0</td>
          </tr>
          <tr>
            <td>18</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(18, '8098'), 0)}>{getCountPerGradeAndCCForLastWeek(18, '8098')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(18, '8098'), 0)}>0</td>
          </tr>
        </tbody>
      </table>
      <table className="hc-table" style={{ gridArea: 'table-4' }}>
        <thead>
          <tr>
            <th>CC</th>
            <th>Current HC</th>
            <th>Planned HC</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>8027</td>
            <td>{getTotalForCCAndLastWeek('8027')}</td>
            <td>1</td>
          </tr>
          <tr>
            <td>11</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8027'), 0)}>{getCountPerGradeAndCCForLastWeek(11, '8027')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8027'), 0)}>0</td>
          </tr>
          <tr>
            <td>12</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(12, '8027'), 0)}>{getCountPerGradeAndCCForLastWeek(12, '8027')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(12, '8027'), 0)}>0</td>
          </tr>
          <tr>
            <td>13</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(13, '8027'), 1)}>{getCountPerGradeAndCCForLastWeek(13, '8027')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(13, '8027'), 1)}>1</td>
          </tr>
          <tr>
            <td>14</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(14, '8027'), 0)}>{getCountPerGradeAndCCForLastWeek(14, '8027')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(14, '8027'), 0)}>0</td>
          </tr>
          <tr>
            <td>15</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(15, '8027'), 0)}>{getCountPerGradeAndCCForLastWeek(15, '8027')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(15, '8027'), 0)}>0</td>
          </tr>
          <tr>
            <td>16</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(16, '8027'), 0)}>{getCountPerGradeAndCCForLastWeek(16, '8027')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(16, '8027'), 0)}>0</td>
          </tr>
          <tr>
            <td>17</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(17, '8027'), 0)}>{getCountPerGradeAndCCForLastWeek(17, '8027')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(17, '8027'), 0)}>0</td>
          </tr>
          <tr>
            <td>18</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(18, '8027'), 0)}>{getCountPerGradeAndCCForLastWeek(18, '8027')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(18, '8027'), 0)}>0</td>
          </tr>
        </tbody>
      </table>
      <table className="hc-table" style={{ gridArea: 'table-5' }}>
        <thead>
          <tr>
            <th colSpan={3}>HC Grade 11 & 12 W/O BR Temp</th>
          </tr>
          <tr className="secondary-row">
            <th>Grade</th>
            <th>Current HC</th>
            <th>Planned HC</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ fontWeight: '500' }}>11</td>
            <td className={checkIfBelowOrAbove(getTotalGradeCountForAllCCs(11), 64)} style={{ fontWeight: '400' }}>{getTotalGradeCountForAllCCs(11)}</td>
            <td className={checkIfBelowOrAbove(getTotalGradeCountForAllCCs(11), 64)} style={{ fontWeight: '400' }}>64</td>
          </tr>
          <tr>
            <td style={{ fontWeight: '500' }}>12</td>
            <td className={checkIfBelowOrAbove(getTotalGradeCountForAllCCs(12), 76)}>{getTotalGradeCountForAllCCs(12)}</td>
            <td className={checkIfBelowOrAbove(getTotalGradeCountForAllCCs(12), 76)}>76</td>
          </tr>
          <tr>
            <td style={{ fontWeight: '500' }}>11 & 12</td>
            <td className={checkIfBelowOrAbove(getTotalGradeCountForAllCCs(11) + getTotalGradeCountForAllCCs(12), 140)}>{getTotalGradeCountForAllCCs(11) + getTotalGradeCountForAllCCs(12)}</td>
            <td className={checkIfBelowOrAbove(getTotalGradeCountForAllCCs(11) + getTotalGradeCountForAllCCs(12), 140)}>140</td>
          </tr>
          <tr>
            <td style={{ fontWeight: '500', color: '#868686' }}>8098</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8098') + getCountPerGradeAndCCForLastWeek(12, '8098'), 6)}>{getCountPerGradeAndCCForLastWeek(11, '8098') + getCountPerGradeAndCCForLastWeek(12, '8098')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8098') + getCountPerGradeAndCCForLastWeek(12, '8098'), 6)}>7</td>
          </tr>
          <tr>
            <td style={{ fontWeight: '500', color: '#868686' }}>8027</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8027') + getCountPerGradeAndCCForLastWeek(12, '8027'), 0)}>{getCountPerGradeAndCCForLastWeek(11, '8027') + getCountPerGradeAndCCForLastWeek(12, '8027')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8027') + getCountPerGradeAndCCForLastWeek(12, '8027'), 0)}>0</td>
          </tr>
          <tr>
            <td style={{ fontWeight: '500', color: '#868686' }}>8264</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8264') + getCountPerGradeAndCCForLastWeek(12, '8264'), 17)}>{getCountPerGradeAndCCForLastWeek(11, '8264') + getCountPerGradeAndCCForLastWeek(12, '8264')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8264') + getCountPerGradeAndCCForLastWeek(12, '8264'), 17)}>17</td>
          </tr>
          <tr>
            <td style={{ fontWeight: '500', color: '#868686' }}>8288</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8288') + getCountPerGradeAndCCForLastWeek(12, '8288'), 116)}>{getCountPerGradeAndCCForLastWeek(11, '8288') + getCountPerGradeAndCCForLastWeek(12, '8288')}</td>
            <td className={checkIfBelowOrAbove(getCountPerGradeAndCCForLastWeek(11, '8288') + getCountPerGradeAndCCForLastWeek(12, '8288'), 116)}>116</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
