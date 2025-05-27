import React from 'react';
import './App.css';
import { useAutoSwitchComp, keySubKeys, getInitialKey, entryKeys, renderView } from './util';

const stLabel: React.CSSProperties = { padding: '0 12px' };

function App() {
  const initialKey = getInitialKey();
  const [mainKey, setMainKey] = React.useState(initialKey);
  const [subKey, setSubKey] = React.useState(initialKey);
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
    <div style={{ padding: '3px' }}>
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
    </div>
  );
}


export default App;
