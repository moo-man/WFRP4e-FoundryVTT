const path = require('path');
const fs = require('fs-extra');

function foundryConfig(systemId) {
  const configPath = path.resolve(process.cwd(), 'foundryconfig.json');
  let config;

  if (fs.existsSync(configPath)) {
      config = fs.readJSONSync(configPath);
  }

  let foundryPath
  if (config.foundryDataPath)
    foundryPath = path.join(config.foundryDataPath, systemId)
  else
    foundryPath = path.resolve(__dirname, 'build')

  console.log("Foundry Path: " + foundryPath)
  return foundryPath
}

exports.systemPath = foundryConfig()