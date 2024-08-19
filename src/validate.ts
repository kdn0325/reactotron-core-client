import type {ClientOptions} from './client-options';
import type {ReactotronCore} from './reactotron-core-client';

const isCreateSocketValid = (
  createSocket: unknown,
): createSocket is ClientOptions<ReactotronCore>['createSocket'] =>
  typeof createSocket !== 'undefined' && createSocket !== null;
// @ts-ignore
const isHostValid = (host: string): boolean =>
  // @ts-ignore
  typeof host === 'string' && host && host !== '';
const isPortValid = (port: number): boolean =>
  typeof port === 'number' && port >= 1 && port <= 65535;
const onCommandValid = (fn: (cmd: string) => any) => typeof fn === 'function';

/**
 * Ensures the options are sane to run this baby.  Throw if not.  These
 * are basically sanity checks.
 */
const validate = (options: ClientOptions<ReactotronCore>) => {
  const {createSocket, host, port, onCommand} = options;

  if (!isCreateSocketValid(createSocket)) {
    throw new Error('invalid createSocket function');
  }

  // @ts-ignore
  if (!isHostValid(host)) {
    throw new Error('invalid host');
  }

  // @ts-ignore
  if (!isPortValid(port)) {
    throw new Error('invalid port');
  }

  // @ts-ignore
  if (!onCommandValid(onCommand)) {
    throw new Error('invalid onCommand handler');
  }
};

export default validate;
