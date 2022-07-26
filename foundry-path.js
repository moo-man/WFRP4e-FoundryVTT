const path = require('path');
const fs = require('fs-extra');

function foundryConfig(systemId) {
  const configPath = path.resolve(process.cwd(), 'foundryconfig.json');
  let config;

  if (fs.existsSync(configPath)) {
      config = fs.readJSONSync(configPath);
  }

  let foundryPath
  if (process.env.NODE_ENV == "production")
  {
    foundryPath = "./build"
  }
  else if (config?.path)
  {
    foundryPath = path.join(config.path, "systems", systemId)
  }

  console.log("Foundry Path: " + foundryPath)
  return foundryPath
}

exports.systemPath = foundryConfig