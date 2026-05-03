import {Composition} from 'remotion';
import {LedgerDemo} from './LedgerDemo';

const FPS = 30;
const DURATION_SECONDS = 212.2;

export const Root = () => {
  return (
    <Composition
      id="LedgerDemo"
      component={LedgerDemo}
      durationInFrames={Math.ceil(DURATION_SECONDS * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
