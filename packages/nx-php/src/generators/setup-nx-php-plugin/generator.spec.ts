import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import {
  Tree,
  readWorkspaceConfiguration,
  updateWorkspaceConfiguration,
} from '@nrwl/devkit';

import generator from './generator';

describe('setup-nx-php-plugin generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(appTree);
    const config = readWorkspaceConfiguration(appTree);
    expect(config.plugins).toBeDefined();
    expect(config.plugins.length).toBe(1);
    expect(config.plugins[0]).toBe('@nx-enterprise/nx-php');
  });

  it('should merge correctly', async () => {
    let config = readWorkspaceConfiguration(appTree);
    config.plugins = ['fake-plugin'];
    updateWorkspaceConfiguration(appTree, config);

    await generator(appTree);
    config = readWorkspaceConfiguration(appTree);
    expect(config.plugins).toBeDefined();
    expect(config.plugins.length).toBe(2);
    expect(config.plugins[1]).toBe('@nx-enterprise/nx-php');
  });

  it('should do nothing when already defined', async () => {
    let config = readWorkspaceConfiguration(appTree);
    config.plugins = ['@nx-enterprise/nx-php'];
    updateWorkspaceConfiguration(appTree, config);

    await generator(appTree);
    config = readWorkspaceConfiguration(appTree);
    expect(config.plugins).toBeDefined();
    expect(config.plugins.length).toBe(1);
    expect(config.plugins[0]).toBe('@nx-enterprise/nx-php');
  });
});
