import { FormatExecutorSchema } from './schema';
import executor from './executor';

const options: FormatExecutorSchema = {
  host: 'localhost',
  port: 3000,
};

describe('Build Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
