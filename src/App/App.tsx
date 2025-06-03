import React from 'react';
import './App.css';
import { useAutoSwitchComp, keySubKeys, getInitialKey, entryKeys, renderView } from './util';

const stLabel: React.CSSProperties = { padding: '0 12px' };

function App() {
  const { initialMainKey, initialSubKey } = getInitialKey();
  const [mainKey, setMainKey] = React.useState(initialMainKey);
  const [subKey, setSubKey] = React.useState(initialSubKey);
  const [showAll, setShowAll] = React.useState(true);
  const changeMainKey: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const mainKey = e.target.value;
    setMainKey(mainKey);
    setSubKey(keySubKeys[mainKey][0]);
  }
  const changeSubKey: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const subKey = e.target.value;
    setSubKey(subKey);
  }
  const viewKeyRef = React.useRef([mainKey, subKey]);
  viewKeyRef.current = [mainKey, subKey];

  // useAutoSwitchComp(viewKeyRef, setMainKey, setSubKey);

  return (
    <div style={{ padding: '3px', position: 'relative' }}>
      <button style={{ position: 'absolute', top: '1px', right: '1px' }} onClick={() => setShowAll(!showAll)}>all</button>
      {showAll && (
        <>
          <div style={{ padding: '3px' }}>
            dir: {entryKeys.map(key => (
              <label key={key} style={stLabel}>
                <input name="main" type="radio" checked={key === mainKey} value={key} onChange={changeMainKey} />
                {key}
              </label>
            ))}
          </div>
          <div style={{ borderTop: '1px solid gray' }}>
            comp: {keySubKeys[mainKey].map((key: string) => (
              <label key={key} style={stLabel}>
                <input name="sub" type="radio" checked={key === subKey} value={key} onChange={changeSubKey} />
                {key}
              </label>
            ))}
          </div>
          {renderView(mainKey, subKey)}
        </>
      )}
    </div>
  );
}


export default App;
