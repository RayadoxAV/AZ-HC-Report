import { createContext, useReducer } from 'react';
import MainClientLogger, { LogSeverity } from '../util/clientLogger';
import { AutoZoner, Entry } from './types';

interface MiscState {
  searchDialogVisible: boolean;
}

interface ComparatorApplicationState {
  filePath: string;
  fileName: string;
  comparatorStep: number;
  isFirstEntry: boolean;
  firstEntry: Entry;
  secondEntry: Entry;
  uploadEntry: boolean;
  changes: {
    hasBeenModified: boolean;
    firstChangedZoners: AutoZoner[];
    secondChangedZoners: AutoZoner[];
  };
  entryList: Entry[];
}

interface EntriesApplicationState {
  selectedEntry: Entry;
}

interface DebugApplicationState {
  logging: boolean;
}

interface ApplicationState {
  title: string;
  misc: MiscState;
  comparator: ComparatorApplicationState;
  entries: EntriesApplicationState;
  debug: DebugApplicationState;
}

const initialState: ApplicationState = {
  title: 'Headcount Report',
  misc: {
    searchDialogVisible: false
  },
  comparator: {
    filePath: '',
    fileName: '',
    comparatorStep: 0,
    isFirstEntry: false,
    firstEntry: undefined,
    secondEntry: undefined,
    uploadEntry: false,
    changes: {
      hasBeenModified: false,
      firstChangedZoners: [],
      secondChangedZoners: []
    },
    entryList: []
  },
  entries: {
    selectedEntry: undefined
  },
  debug: {
    logging: true
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AppContext = createContext(initialState as any);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'clean': {
      return { ...initialState };
    }

    case 'setTitle':  {
      return { ...state, title: action.title };
    }

    case 'setFilePath': {      
      const comparator = { ...state.comparator };
      return { ...state, comparator: { ...comparator, filePath: action.filePath } };
    }

    case 'setFileName': {
      const comparator = { ...state.comparator };
      return { ...state, comparator: { ...comparator, fileName: action.fileName } };
    }

    case 'setComparatorStep': {
      const comparator = { ...state.comparator };
      return { ...state, comparator: { ...comparator, comparatorStep: action.comparatorStep } };
    }

    case 'setIsFirstEntry': {
      const comparator = { ...state.comparator };
      return { ...state, comparator: { ...comparator, isFirstEntry: action.isFirstEntry } };
    }

    case 'setFirstEntry': {
      const comparator = { ...state.comparator };
      return { ...state, comparator: { ...comparator, firstEntry: action.firstEntry } };
    }

    case 'setSecondEntry': {
      const comparator = { ...state.comparator };
      return { ...state, comparator: { ...comparator, secondEntry: action.secondEntry } };
    }

    case 'setUploadEntry': {
      const comparator = { ...state.comparator };
      return { ...state, comparator: { ...comparator, uploadEntry: action.uploadEntry } };
    }

    case 'setComparatorChanges': {
      const comparator = { ...state.comparator };
      return { ...state, comparator: { ...comparator, changes: action.changes } };
    }

    case 'setEntryList': {
      const comparator = { ...state.comparator };
      return { ...state, comparator: { ...comparator, entryList: action.list } };
    }

    case 'toggleSearchDialogVisible': {
      const misc = { ...state.misc };
      return { ...state, misc: { ...misc, searchDialogVisible: !misc.searchDialogVisible } };
    }

    default: {
      MainClientLogger.log(`No reducer action defined for action '${action.type}'`, LogSeverity.WARNING);
      break;
    }
  }

  return state;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AppContextProvider(props: any) {
  const fullInitialState = {
    ...initialState
  };

  const [state, dispatch] = useReducer(reducer, fullInitialState);
  // const value = { state, dispatch };

  return (
    <AppContext.Provider value={[state, dispatch]}>{props.children}</AppContext.Provider>
  );
}

const AppContextConsumer = AppContext.Consumer;

export { AppContext, AppContextProvider, AppContextConsumer };