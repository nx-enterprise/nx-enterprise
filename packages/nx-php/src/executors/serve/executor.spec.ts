import { ServeExecutorSchema } from './schema';
import executor from './executor';

jest.mock('../../utils');
import * as utils from '../../utils';

const options: ServeExecutorSchema = {
  cmd: '',
  cwd: '',
  index: '',
  arguments: [],
};

describe('Serve Executor', () => {
  beforeEach(async () => {
    // Mocks the runPhpCommand
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (utils as any).runPhpCommand = jest.fn().mockReturnValue({
      success: true,
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('can run', async () => {
    const output = await executor(options, null);
    expect(output.success).toBe(true);
  });

  it('can run with command line arguments', async () => {
    const opts = { ...options, arguments: ['first', '--second', '-third'] };
    const output = await executor(opts, null);
    expect(output.success).toBe(true);
  });
});
