import { ExecutorContext } from '@nrwl/devkit';
import { TestExecutorSchema } from './schema';
import { getProjectRoot } from '../../utils';
import { CmdStatus, runPoetryCommandAsync, waitForCommand } from '../../poetry';

export default async function* runExecutor(
  options: TestExecutorSchema,
  context: ExecutorContext
) {
  console.log('Executor ran for pytest', options);
  const projectRoot = getProjectRoot(context);

  try {
    const checkStatus = (data): CmdStatus => {
      if (/============ \d+ passed/.test(data)) {
        return CmdStatus.Done;
      } else if (
        /============ \d+ failed/.test(data) ||
        /============ \d+ errors? in/.test(data)
      ) {
        return CmdStatus.ErrorAndDone;
      }
      return CmdStatus.Continue;
    };
    const child = await runPoetryCommandAsync(
      projectRoot,
      ['run', 'pytest'],
      checkStatus
    );

    if (!child) {
      return { success: false };
    }
    yield { success: true };

    return waitForCommand(child);
  } catch (_e) {
    return { success: false };
  }
}
