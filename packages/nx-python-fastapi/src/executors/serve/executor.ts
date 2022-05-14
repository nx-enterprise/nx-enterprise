import { ExecutorContext, joinPathFragments } from '@nrwl/devkit';
import { DevServerExecutorSchema } from './schema';
import { getProjectRoot } from '../../utils';
import {
  CmdStatus,
  runPoetryCommandAsync,
  waitForCommand,
  executePoetryCommand,
} from '../../poetry';

export default async function* runExecutor(
  options: DevServerExecutorSchema,
  context: ExecutorContext
) {
  console.log('Executor ran for DevServer', options);

  const projectRoot = getProjectRoot(context);
  const { host, port, migrate } = options;
  const baseUrl = `http://${host}:${port}`;

  try {
    const checkStatus = (data): CmdStatus => {
      if (data.includes('Application startup complete.')) {
        return CmdStatus.Done;
      } else if (data.includes('ERROR:')) {
        return CmdStatus.Error;
      }
      return CmdStatus.Continue;
    };
    if (migrate) {
      const dbMigrate = executePoetryCommand(
        joinPathFragments(projectRoot, 'src'),
        'run',
        'alembic',
        'upgrade',
        'head'
      );
      if (!dbMigrate) {
        return { success: false };
      }
    }
    const child = await runPoetryCommandAsync(
      joinPathFragments(projectRoot, 'src'),
      [
        'run',
        'uvicorn',
        'main:app',
        '--reload',
        '--port',
        port.toString(),
        '--host',
        host,
      ],
      checkStatus
    );

    if (!child) {
      return { success: false };
    }
    yield {
      success: true,
      baseUrl,
    };

    return waitForCommand(child);
  } catch (e) {
    console.error('Executor failed: ', e);
    return { success: false };
  }
}
