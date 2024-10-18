import Database from 'better-sqlite3';
import path from 'path';
import { existsSync } from 'fs';

import ServerLogger, { LogSeverity } from '../../util/serverLogger';
import TransformedEntry, { Entry } from '../models/entry';
import { AutoZoner } from '../models/autozoner';

class DBManager {

  static #instance: DBManager;

  public database: Database.Database | undefined;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() { }

  public static get instance(): DBManager {
    if (!DBManager.#instance) {
      DBManager.#instance = new DBManager();
    }
    return DBManager.#instance;
  }

  static initializeDatabase(): void {
    ServerLogger.log('Trying to initialize database', LogSeverity.INFO);
    if (DBManager.databaseExists()) {
      ServerLogger.log('Database does exist. Trying to connect to it', LogSeverity.INFO);
      const dbPath = process.env.CURRENT_ENV === 'development' ? './temp/data/testing_database.db' : path.join(process.resourcesPath, './hc_database.db');
      DBManager.instance.database = new Database(dbPath);
      DBManager.instance.database.pragma('journal_mode = WAL');
      ServerLogger.log('Database connected succesfully', LogSeverity.SUCCESS);
    } else {
      DBManager.createDatabase();
    }
  }

  static databaseExists(): boolean {
    const dbPath = process.env.CURRENT_ENV === 'development' ? './temp/data/testing_database.db' : path.join(process.resourcesPath, './hc_database.db');
    return existsSync(dbPath);
  }

  private static createDatabase() {
    ServerLogger.log('Database doesn\'t exist. Trying to create it', LogSeverity.INFO);
    const dbPath = process.env.CURRENT_ENV === 'development' ? './temp/data/testing_database.db' : path.join(process.resourcesPath, './hc_database.db');
    DBManager.instance.database = new Database(dbPath);
    DBManager.instance.database.pragma('journal_mode = WAL');

    // Create table

    const createAutozonersTableStatement = DBManager.instance.database.prepare(
      `CREATE TABLE IF NOT EXISTS autozoners (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ignition_id CHAR(8) NOT NULL,
                cc CHAR(4) NOT NULL,
                name VARCHAR(50) NOT NULL,
                hire_date DATE NOT NULL,
                job_code CHAR(5) NOT NULL,
                position VARCHAR(50),
                grade TINYINT NOT NULL,
                supervisor_id CHAR(8) NOT NULL,
                supervisor_name VARCHAR(50) NOT NULL,
                manager VARCHAR(50)
              );`
    );

    const createEntriesTableStatement = DBManager.instance.database.prepare(
      `CREATE TABLE IF NOT EXISTS week_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                week INT NOT NULL,
                year INT NOT NULL,
                zoner_id INT NOT NULL,
                FOREIGN KEY (zoner_id) REFERENCES autozoners(id)
              );`
    );

    const createTables = DBManager.instance.database.transaction(() => {
      createAutozonersTableStatement.run();
      createEntriesTableStatement.run();
    });

    createTables();

    ServerLogger.log('Database was created successfully', LogSeverity.SUCCESS);
  }

  public getAll(entity: number): any[] {
    const tableName = entity === 0 ? 'week_entries' : 'autozoners';
    const selectStatement = DBManager.instance.database.prepare(`SELECT * FROM ${tableName};`);
    const rows = selectStatement.all();

    if (entity === 0) {
      const resultSet: Entry[] = [];
      for (let i = 0; i < rows.length; i++) {
        const currentRow = rows[i] as any;
        const entry: Entry = {
          id: currentRow.id,
          week: currentRow.week,
          fiscalYear: currentRow.year,
          zonerId: currentRow.zoner_id
        };

        resultSet.push(entry);
      }

      return resultSet;
    }

    if (entity === 1) {
      const resultSet: AutoZoner[] = [];
      for (let i = 0; i < rows.length; i++) {
        const currentRow = rows[i] as any;
        const autozoner: AutoZoner = {
          id: currentRow.id,
          ignitionId: currentRow.ignition_id,
          cc: currentRow.cc,
          name: currentRow.name,
          hireDate: currentRow.hire_date,
          jobCode: currentRow.job_code,
          position: currentRow.position,
          grade: currentRow.grade,
          supervisorId: currentRow.supervisor_id,
          supervisorName: currentRow.supervisor_name,
          manager: currentRow.manager
        };

        resultSet.push(autozoner);
      }

      return resultSet;
    }
    return [];
  }

  public getAutozonerById(id: number) {

    const selectStatement = DBManager.instance.database.prepare('SELECT * FROM autozoners WHERE id = ?;');
    const result = selectStatement.get(id) as any;

    if (result) {
      const autozoner: AutoZoner = {
        id: result.id,
        ignitionId: result.ignition_id,
        cc: result.cc,
        name: result.name,
        hireDate: result.hire_date,
        jobCode: result.job_code,
        position: result.position,
        grade: result.grade,
        supervisorId: result.supervisor_id,
        supervisorName: result.supervisor_name,
        manager: result.manager
      };

      return autozoner;
    }

    return undefined;
  }

  public getEntryById(id: number) {
    const selectStatement = DBManager.instance.database.prepare('SELECT * FROM week_entries WHERE id = ?');
    const result = selectStatement.get(id) as any;

    if (result) {
      const entry: Entry = {
        id: result.id,
        week: result.week,
        fiscalYear: result.year,
        zonerId: result.zoner_id
      };

      return entry;
    }

    return undefined;
  }

  public getTransformedEntryByWKYear(week: number, year: number): TransformedEntry {
    const selectStatement = DBManager.instance.database.prepare('SELECT week_entries.id, week, year, a.id, a.ignition_id, a.cc, a.name, a.hire_date, a.job_code, a.position, a.grade, a.supervisor_id, a.supervisor_name, a.manager FROM week_entries LEFT JOIN autozoners AS a ON week_entries.zoner_id = a.id WHERE week = ? AND year = ?;');
    const resultSet = selectStatement.all(week, year);

    const zoners: AutoZoner[] = [];

    for (let i = 0; i < resultSet.length; i++) {
      const currentRow = resultSet[i] as any;
      const zoner: AutoZoner = {
        id: currentRow.id,
        ignitionId: `${currentRow.ignition_id}`,
        cc: currentRow.cc,
        name: currentRow.name,
        hireDate: new Date(currentRow.hire_date),
        jobCode: currentRow.job_code,
        position: currentRow.position,
        grade: currentRow.grade,
        supervisorId: currentRow.supervisor_id,
        supervisorName: currentRow.supervisor_name,
        manager: currentRow.manager
      };
      zoners.push(zoner);
    }

    const transformedEntry: TransformedEntry = {
      week: week,
      fiscalYear: year,
      zoners: [...zoners]
    };

    return transformedEntry;
  }

  public getLastTransformedEntry(): TransformedEntry {
    const selectStatement = DBManager.instance.database.prepare('SELECT week_entries.id, week, year, a.id, a.ignition_id, a.cc, a.name, a.hire_date, a.job_code, a.position, a.grade, a.supervisor_id, a.supervisor_name, a.manager FROM week_entries LEFT JOIN autozoners AS a ON week_entries.zoner_id = a.id WHERE week = (SELECT MAX(week) FROM week_entries) AND year = (SELECT MAX(year) FROM week_entries);');
    const resultSet = selectStatement.all();

    const zoners: AutoZoner[] = [];

    for (let i = 0; i < resultSet.length; i++) {
      const currentRow = resultSet[i] as any;
      const zoner: AutoZoner = {
        id: currentRow.id,
        ignitionId: `${currentRow.ignition_id}`,
        cc: currentRow.cc,
        name: currentRow.name,
        hireDate: new Date(currentRow.hire_date),
        jobCode: currentRow.job_code,
        position: currentRow.position,
        grade: currentRow.grade,
        supervisorId: currentRow.supervisor_id,
        supervisorName: currentRow.supervisor_name,
        manager: currentRow.manager
      };
      zoners.push(zoner);
    }

    const transformedEntry: TransformedEntry = {
      week: (resultSet[0] as any).week,
      fiscalYear: (resultSet[0] as any).year,
      zoners: [...zoners]
    };

    return transformedEntry;
  }

  public getAlTransformedEntries(): TransformedEntry[] {
    const selectStatement = DBManager.instance.database.prepare('SELECT week_entries.id, week, year, a.id, a.ignition_id, a.cc, a.name, a.hire_date, a.job_code, a.position, a.grade, a.supervisor_id, a.supervisor_name, a.manager FROM week_entries LEFT JOIN autozoners AS a ON week_entries.zoner_id = a.id;');
    const resultSet = selectStatement.all();

    const entries = new Map<string, TransformedEntry>();

    for (let i = 0; i < resultSet.length; i++) {
      const currentRow = resultSet[i] as any;
      
      // If there is no entry with the same week and year.
      if (!entries.has(`${currentRow.week}-${currentRow.year}`)) {
        const transformedEntry: TransformedEntry = {
          week: currentRow.week,
          fiscalYear: currentRow.year,
          zoners: []
        };
        entries.set(`${currentRow.week}-${currentRow.year}`, transformedEntry);
      } else {
        const zoner: AutoZoner = {
          id: currentRow.id,
          ignitionId: `${currentRow.ignition_id}`,
          cc: currentRow.cc,
          name: currentRow.name,
          hireDate: new Date(currentRow.hire_date),
          jobCode: currentRow.job_code,
          position: currentRow.position,
          grade: currentRow.grade,
          supervisorId: currentRow.supervisor_id,
          supervisorName: currentRow.supervisor_name,
          manager: currentRow.manager
        };
        entries.get(`${currentRow.week}-${currentRow.year}`).zoners.push(zoner);
      }
    }

    return Array.from(entries.values());
  }

  public insertAutozoner(autozoner: AutoZoner): number {
    const insertStatement = DBManager.instance.database.prepare('INSERT INTO autozoners (ignition_id, cc, name, hire_date, job_code, position, grade, supervisor_id, supervisor_name, manager) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);');
    
    const dateString = `${autozoner.hireDate.getFullYear()}-${autozoner.hireDate.getMonth() + 1}-${autozoner.hireDate.getDate()}`;

    const result = insertStatement.run(autozoner.ignitionId, autozoner.cc, autozoner.name, dateString, autozoner.jobCode, autozoner.position, autozoner.grade, autozoner.supervisorId, autozoner.supervisorName, autozoner.manager);

    return result.lastInsertRowid as number;
  }

  public insertEntry(transformedEntry: TransformedEntry): void {
    for (let i = 0; i < transformedEntry.zoners.length; i++) {
      const zoner = transformedEntry.zoners[i];
      const insertedId = DBManager.instance.insertAutozoner(zoner);

      const insertStatement = DBManager.instance.database.prepare('INSERT INTO week_entries (week, year, zoner_id) VALUES (?, ?, ?);');
      insertStatement.run(transformedEntry.week, transformedEntry.fiscalYear, insertedId);
    }
  }

  public deleteEntryByWeekAndYear(week: number, year: number): void {
    // Get correct entries, then delete the entry to satisfy the fk delete constraint and then delete the autozoner
    const selectStatement = DBManager.instance.database.prepare('SELECT * FROM week_entries WHERE week = ? AND year = ?');
    const result = selectStatement.all(week, year);

    for (let i = 0; i < result.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentEntry = result[i] as any;

      const deleteEntryStatement = DBManager.instance.database.prepare('DELETE FROM week_entries WHERE id = ?');
      deleteEntryStatement.run(currentEntry.id);

      const deleteZonerStatement = DBManager.instance.database.prepare('DELETE FROM autozoners WHERE id = ?');
      deleteZonerStatement.run(currentEntry.zoner_id);
    }
  }

  public getByParam() {
    console.log('TODO: Implement');
  }
}

export default DBManager;
