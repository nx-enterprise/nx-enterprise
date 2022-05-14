import { ExecutorContext } from '@nrwl/devkit';
import { LintExecutorSchema } from './schema';
import { getProjectRoot, getWorkspaceRoot } from '../../utils';
import { runPoetryCommand } from '../../poetry';

export default function runExecutor(
  options: LintExecutorSchema,
  context: ExecutorContext
) {
  console.log('Executor ran for lint', options);
  const projectRoot = getProjectRoot(context);
  const workspaceRoot = getWorkspaceRoot(context);

  try {
    const command = runPoetryCommand(
      projectRoot,
      'run',
      'flake8',
      `--config=${workspaceRoot}/.flake8`,
      'src'
    );

    if (!command) {
      return { success: false };
    }

    command();
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
