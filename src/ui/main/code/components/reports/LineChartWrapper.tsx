import { LineChart, Line, XAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

import './Charts.css';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { Entry } from '../../data/types';
import { AppContext } from '../../data/ApplicationState';

function getLevelName(levelName: string) {
  let name = '';
  switch (levelName) {
    case 'zonerCountLevel11':
      name = 'Grade 11';
      break;

    case 'zonerCountLevel12':
      name = 'Grade 12';
      break;

    case 'zonerCountLevel13':
      name = 'Grade 13';
      break;

    case 'zonerCountLevel14':
      name = 'Grade 14';
      break;

    case 'zonerCountLevel15':
      name = 'Grade 15';
      break;

    case 'zonerCountLevel16':
      name = 'Grade 16';
      break;

    case 'zonerCountLevel17':
      name = 'Grade 17';
      break;

    case 'zonerCountLevel18':
      name = 'Grade 18';
      break;

    case 'hc':
      name = 'Total headcount';
      break;

    default:
      break;
  }

  return name;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customLegend = (props: any) => {
  const { payload } = props;

  return (
    <div className="custom-legend">
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload.map((legend: any, index: number) => (
          <span className="legend" key={index}>
            <i className="icon" style={{ backgroundColor: legend.color }}></i>
            <span className="text">{getLevelName(legend.dataKey)}</span>
          </span>
        ))
      }
    </div>
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = (props: any) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <span className="label">{payload[0].payload.name}</span>
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payload.map((line: any, index: number) => (
            <div className="line" key={index}>
              <span className="color-indicator" style={{ backgroundColor: line.color }}></span>
              <span className="title">{getLevelName(line.dataKey)}</span>
              <span className="value">{line.value}</span>
            </div>
          ))
        }
      </div>
    );
  }

  return null;
}

interface LineChartWrapperProps {
  index?: number;
  hcGeneralWeekly: any;
  hcByCCWeekly: any
}

const LineChartWrapper: React.FC<LineChartWrapperProps> = ({ index, hcGeneralWeekly, hcByCCWeekly }) => {

  const [appState] = useContext(AppContext);

  const [currentChartType, setCurrentChartType] = useState('0');

  const [currentCostCenter, setCurrentCostCenter] = useState(0);
  const [selectedGrades, setSelectedGrades] = useState([false, false, false, false, false, false, false, false]);

  const [_, setEntryList] = useState([] as Entry[]);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const [hcByCCWeekly, setHcByCCWeekly] = useState([] as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const [hcGeneralWeekly, setHcGeneralWeekly] = useState([] as any);

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

    setEntryList(tempList);
    // generateCCInfoWeekly(tempList);
    // generateGeneralBehaviorWeekly(tempList);
  }, [appState.comparator.entryList]);

  // function generateGeneralBehaviorWeekly(entryList: Entry[]): void {
  //   if (entryList.length === 0) {
  //     return;
  //   }

  //   const weeklyInfo = [];

  //   for (let i = 0; i < entryList.length; i++) {
  //     const currentEntry = entryList[i];
  //     const zonerCount = currentEntry.zoners.length;

  //     weeklyInfo.push(
  //       {
  //         week: `WK${currentEntry.week}`,
  //         hc: zonerCount
  //       }
  //     );
  //   }

  //   setHcGeneralWeekly(weeklyInfo);
  // }

  // function generateCCInfoWeekly(entryList: Entry[]): void {
  //   if (entryList.length === 0) {
  //     return;
  //   }
  //   const ccInfoWeekly = [];

  //   // NOTE: This will just group zoners inside the same cc as is shown in the object below this function.

  //   const costCenters = ['8288', '8264', '8098', '8027'];

  //   for (let i = 0; i < costCenters.length; i++) {
  //     const currentCC = costCenters[i];

  //     const ccInfo = [];

  //     for (let j = 0; j < entryList.length; j++) {
  //       const currentEntry = entryList[j];

  //       let grade11Count = 0;
  //       let grade12Count = 0;
  //       let grade13Count = 0;
  //       let grade14Count = 0;
  //       let grade15Count = 0;
  //       let grade16Count = 0;
  //       let grade17Count = 0;
  //       let grade18Count = 0;

  //       for (let k = 0; k < currentEntry.zoners.length; k++) {
  //         const currentZoner = currentEntry.zoners[k];
  //         if (currentZoner.cc === currentCC) {
  //           switch (currentZoner.grade) {
  //             case 11:
  //               grade11Count += 1;
  //               break;
  //             case 12:
  //               grade12Count += 1;
  //               break;
  //             case 13:
  //               grade13Count += 1;
  //               break;
  //             case 14:
  //               grade14Count += 1;
  //               break;
  //             case 15:
  //               grade15Count += 1;
  //               break;
  //             case 16:
  //               grade16Count += 1;
  //               break;
  //             case 17:
  //               grade17Count += 1;
  //               break;
  //             case 18:
  //               grade18Count += 1;
  //               break;
  //             default:
  //               console.log('Huh');
  //               break;
  //           }
  //         }
  //       }

  //       const week = {
  //         week: `WK${currentEntry.week}`,
  //         zonerCountLevel11: grade11Count,
  //         zonerCountLevel12: grade12Count,
  //         zonerCountLevel13: grade13Count,
  //         zonerCountLevel14: grade14Count,
  //         zonerCountLevel15: grade15Count,
  //         zonerCountLevel16: grade16Count,
  //         zonerCountLevel17: grade17Count,
  //         zonerCountLevel18: grade18Count,
  //       };

  //       ccInfo.push(week);
  //     }

  //     ccInfoWeekly.push(ccInfo);
  //   }

  //   setHcByCCWeekly(ccInfoWeekly);
  // }

  function handleChartTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    setCurrentChartType(event.target.value);
  }

  function handleGradeSelection(index: number): void {

    const tempSelectedGrades = [...selectedGrades];
    tempSelectedGrades[index] = !tempSelectedGrades[index];
    setSelectedGrades([...tempSelectedGrades]);
  }


  return (
    <div className="line-chart-wrapper fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="header">
        <div className="title-container">
          <select id="chart-type-select" name="chart-type-select" className="chart-title" value={currentChartType} onChange={handleChartTypeChange}>
            <option value="0">General behavior</option>
            <option value="1">Behavior by grade and CC</option>
          </select>
          <span className="description">Headcount behavior for FY{2025} so far.</span>
        </div>
        <div className="select-group">
          <label htmlFor="costCenterSelect">Cost center</label>
          <select name="costCenterSelect" id="costCenterSelect" value={currentCostCenter} onChange={(event: ChangeEvent<HTMLSelectElement>) => { setCurrentCostCenter(Number.parseInt(event.target.value)) }}>
            <option value="0">8288</option>
            <option value="1">8264</option>
            <option value="2">8098</option>
            <option value="3">8027</option>
          </select>
        </div>
        <div className="select-group">
          <label htmlFor="timePeriodSelect">Time period</label>
          <select name="timePeriodSelect" id="timePeriodSelect">
            <option value="">Weekly</option>
            <option value="">Period</option>
            <option value="">Quarter</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontFamily: 'Roboto', fontWeight: '500', fontSize: '0.875rem' }}>Hola</span>
          <div className="toggle-button-group">
            <button className={`${selectedGrades[0] ? 'active' : ''}`} onClick={() => { handleGradeSelection(0); }}>11</button>
            <button className={`${selectedGrades[1] ? 'active' : ''}`} onClick={() => { handleGradeSelection(1); }}>12</button>
            <button className={`${selectedGrades[2] ? 'active' : ''}`} onClick={() => { handleGradeSelection(2); }}>13</button>
            <button className={`${selectedGrades[3] ? 'active' : ''}`} onClick={() => { handleGradeSelection(3); }}>14</button>
            <button className={`${selectedGrades[4] ? 'active' : ''}`} onClick={() => { handleGradeSelection(4); }}>15</button>
            <button className={`${selectedGrades[5] ? 'active' : ''}`} onClick={() => { handleGradeSelection(5); }}>16</button>
            <button className={`${selectedGrades[6] ? 'active' : ''}`} onClick={() => { handleGradeSelection(6); }}>17</button>
            <button className={`${selectedGrades[7] ? 'active' : ''}`} onClick={() => { handleGradeSelection(7); }}>18</button>
          </div>
        </div>
      </div>
      <ResponsiveContainer>
        <LineChart className="chart" data={currentChartType === '0' ? hcGeneralWeekly : hcByCCWeekly[currentCostCenter]} margin={{ left: 18, right: 18, top: 18 }}>
          {
            currentChartType === '0' ? (
              <Line type="monotone" dataKey="hc" stroke="#dc2626" fill="#dc2626" />
            ) : (
              <>
                {
                  selectedGrades[0] ? <Line type="monotone" dataKey="zonerCountLevel11" stroke="#dc2626" strokeWidth={2} fill="#dc2626" animationDuration={300} /> : null
                }
                {
                  selectedGrades[1] ? <Line type="monotone" dataKey="zonerCountLevel12" stroke="#ea580c" strokeWidth={2} fill="#ea580c" animationDuration={300} /> : null
                }
                {
                  selectedGrades[2] ? <Line type="monotone" dataKey="zonerCountLevel13" stroke="#facc15" strokeWidth={2} fill="#facc15" animationDuration={300} /> : null
                }
                {
                  selectedGrades[3] ? <Line type="monotone" dataKey="zonerCountLevel14" stroke="#65a30d" strokeWidth={2} fill="#65a30d" animationDuration={300} /> : null
                }
                {
                  selectedGrades[4] ? <Line type="monotone" dataKey="zonerCountLevel15" stroke="#0d9488" strokeWidth={2} fill="#0d9488" animationDuration={300} /> : null
                }
                {
                  selectedGrades[5] ? <Line type="monotone" dataKey="zonerCountLevel16" stroke="#2563eb" strokeWidth={2} fill="#2563eb" animationDuration={300} /> : null
                }
                {
                  selectedGrades[6] ? <Line type="monotone" dataKey="zonerCountLevel17" stroke="#9333ea" strokeWidth={2} fill="#9333ea" animationDuration={300} /> : null
                }
                {
                  selectedGrades[7] ? <Line type="monotone" dataKey="zonerCountLevel18" stroke="#db2777" strokeWidth={2} fill="#db2777" animationDuration={300} /> : null
                }
              </>
            )
          }
          <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
          <CartesianGrid vertical={false} />
          <Tooltip cursor={false} content={<CustomTooltip />} />
          <Legend height={32} content={customLegend} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChartWrapper;