import './styles.css';

async function main() {
  window.expect = (input: any) => {
    const log = (actual: any) => {
      console.log('input', input);
      console.log('actual', actual);
    };
    return {
      toBe(actual: any) {
        console.log(`expect(${input}).toBe(${actual})`, input === actual);
        if(!(input === actual)){ 
          console.log(`expect ${input} actual ${actual}`);
        }
      },
      toBeTruthy() {
        console.log('toBeTruthy()', !!input);
      },
      toMatchObject: log,
    };
  }
  console.log('start main');
  // await import('./pure-tests');
  await import('./loadApp18');
}

main().catch((err: any) => {
  console.error(err);
  alert(`Oops, something must he wrong! err message: ${err.message}`);
});

export const Index = 'Index';
