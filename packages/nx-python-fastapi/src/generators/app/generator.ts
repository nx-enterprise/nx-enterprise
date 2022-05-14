import {
  addProjectConfiguration,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
  joinPathFragments,
  updateJson,
} from '@nrwl/devkit';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import * as path from 'path';
import { AppGeneratorSchema } from './schema';
import { runPoetryCommand } from '../../poetry';
import {
  VSCodeExtensionsFilePath,
  recommendedExtensions,
} from '../../defaults';

interface NormalizedSchema extends AppGeneratorSchema {
  projectName: string;
  projectTitle: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  host: Tree,
  options: AppGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? names(options.directory).fileName
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectTitle = options.title ?? projectName;
  const projectRoot = joinPathFragments(
    getWorkspaceLayout(host).appsDir,
    projectDirectory
  );
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectTitle,
    projectRoot,
    projectDirectory,
    parsedTags,
    pgUser: options.pgUser ?? '',
    pgDb: options.pgDb ?? '',
    pgPassword: options.pgPassword,
  };
}

function addFiles(host: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    // Hack for copying dotfiles - use as a template in the filename
    // e.g. "__dot__eslintrc.js" => ".eslintrc.js"
    dot: '.',
    template: '',
  };
  generateFiles(
    host,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

function updateExtensionRecommendations(host: Tree) {
  if (!host.exists(VSCodeExtensionsFilePath)) {
    host.write(VSCodeExtensionsFilePath, '{ "recommendations": [] }');
  }

  updateJson(host, VSCodeExtensionsFilePath, (json) => {
    json.recommendations ??= [];
    for (const extension of recommendedExtensions) {
      if (
        Array.isArray(json.recommendations) &&
        !json.recommendations.includes(extension)
      )
        json.recommendations.push(extension);
    }
    return json;
  });
}

export default async function (host: Tree, options: AppGeneratorSchema) {
  const normalizedOptions = normalizeOptions(host, options);
  const { projectRoot } = normalizedOptions;

  addProjectConfiguration(host, normalizedOptions.projectName, {
    root: projectRoot,
    projectType: 'application',
    sourceRoot: joinPathFragments(projectRoot, 'src'),
    targets: {
      serve: {
        executor: '@nx-enterprise/nx-python-fastapi:serve',
      },
      test: {
        executor: '@nx-enterprise/nx-python-fastapi:test',
        outputs: [joinPathFragments('coverage', projectRoot)],
      },
      lint: {
        executor: '@nx-enterprise/nx-python-fastapi:lint',
      },
      format: {
        executor: '@nx-enterprise/nx-python-fastapi:format',
      },
    },
    tags: normalizedOptions.parsedTags,
  });

  addFiles(host, normalizedOptions);

  updateExtensionRecommendations(host);

  const poetryInstall = runPoetryCommand(projectRoot, 'install');
  const format = runPoetryCommand(projectRoot, 'run', 'black', 'src');

  const preStart = options.pgDb
    ? runPoetryCommand(
        joinPathFragments(projectRoot, 'src'),
        'run',
        'python',
        'pre_start.py'
      )
    : () => {
        console.log(
          'No database name, skipping initialization. Run "poetry run python pre_start.py" from the src directory'
        );
      };

  return runTasksInSerial(poetryInstall, format, preStart);
}
