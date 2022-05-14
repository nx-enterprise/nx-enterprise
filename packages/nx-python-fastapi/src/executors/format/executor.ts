import { ExecutorContext } from '@nrwl/devkit';
import { FormatExecutorSchema } from './schema';
import { getProjectRoot } from '../../utils';
import { executePoetryCommand } from '../../poetry';

export default async function runExecutor(
  options: FormatExecutorSchema,
  context: ExecutorContext
) {
  console.log('Executor ran for format', options);
  const check = options.check ?? false;

  const projectRoot = getProjectRoot(context);

  try {
    const args = ['run', 'black', 'src'];
    if (check) {
      args.push('--check');
    }
    const success = executePoetryCommand(projectRoot, ...args);
    if (success) {
      return { success: true };
    }
  } catch (e) {
    console.log('Poetry execute error', e);
  }
  return { success: false };
}
