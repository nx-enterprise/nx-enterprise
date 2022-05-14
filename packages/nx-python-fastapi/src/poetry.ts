import { GeneratorCallback } from '@nrwl/devkit';
import { ChildProcess } from 'child_process';
import * as shell from 'shelljs';

export enum CmdStatus {
  Done = 'done',
  Error = 'error',
  ErrorAndDone = 'error_and_done',
  Continue = 'continue',
}

function commandSetup(root: string, args: string[]): string | null {
  const cmd = `poetry ${args.join(' ')}`;
  console.info(`Running: ${cmd}`);

  if (!shell.which('poetry')) {
    console.error(`Poetry must be installed to run:\n> ${cmd}`);
    throw new Error();
  }
  if (!shell.pwd().endsWith(root)) {
    const paths = shell.pushd('-q', root);
    if (!paths || !paths.length) {
      return null;
    }
  }
  return cmd;
}

export function runPoetryCommandAsync(
  root: string,
  args: string[],
  checkStatus: (data: string) => CmdStatus
): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const cmd = commandSetup(root, args);
    if (!cmd) {
      return reject();
    }
    const child = shell.exec(cmd, { async: true });
    shell.popd('-q');
    let error = false;
    const onComplete = (e: boolean) => {
      if (e) {
        console.error('Poetry command failed, exiting');
        child.kill('SIGHUP');
        reject();
      } else {
        resolve(child);
      }
    };
    const checkOutput = (data) => {
      const status = checkStatus(data);
      switch (status) {
        case CmdStatus.Continue:
          break;
        case CmdStatus.Error:
          error = true;
          break;
        case CmdStatus.ErrorAndDone:
          onComplete(true);
          break;
        case CmdStatus.Done:
          onComplete(error);
          break;
      }
    };
    child.stderr.on('data', checkOutput);
    child.stdout.on('data', checkOutput);
  });
}

export function waitForCommand(cmd: ChildProcess, baseUrl?: string) {
  return new Promise<{ success: boolean; baseUrl?: string }>((res) => {
    cmd.on('exit', (code) => {
      res({
        success: code === 0,
        baseUrl,
      });
    });
  });
}

export function runPoetryCommand(
  root: string,
  ...args: string[]
): GeneratorCallback {
  return (): void => {
    const cmd = commandSetup(root, args);

    if (!cmd || shell.exec(cmd).code !== 0) {
      shell.popd();
      console.error(`Poetry command failed:\n> ${cmd}`);
      throw new Error();
    }
    shell.popd();
  };
}

// Run a Poetry command immediately. Useful for executors
export function executePoetryCommand(root: string, ...args: string[]): boolean {
  const cmd = commandSetup(root, args);

  if (!cmd || shell.exec(cmd).code !== 0) {
    shell.popd();
    console.error(`Poetry command failed:\n> ${cmd}`);
    return false;
  }
  shell.popd();
  return true;
}
