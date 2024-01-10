const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const findUp = require('find-up')

let syncPackageName = process.argv[2]

if (!syncPackageName) {
  try {
    const closestPackage = findUp.sync('package.json')
    if (!closestPackage) {
      console.log(chalk.red('no package was found'))
      process.exit(1)
    }

    const closestPackageJson = require(closestPackage)
    if (closestPackageJson.name) {
      syncPackageName = closestPackageJson.name
    } else {
      console.log('Missing package name as argument')
      process.exit(1)
    }
  } catch (err) {
    console.log(chalk.red('could not read package'))
    console.error(err)
    process.exit(1)
  }
}

// Find the 'packages' directory path
const packagesPath = findUp.sync('packages', { type: 'directory' })

if (!packagesPath) {
  console.log(chalk.red('packages directory not found'))
  process.exit(1);
}

// Resolve the root path (parent of 'packages' directory)
const rootPath = path.dirname(packagesPath)

// Your 'packagesDir' variable will now point to 'monorepo/packages'
const packagesDir = packagesPath;

let syncPackageJson = null

try {
  // retrieve package name after first slash. E.g. @some-org/mypkg -> mypkg
  const pkgDirname = syncPackageName.replace(/@[0-9a-zA-Z-]+\//, '')
  syncPackageJson = require(path.resolve(packagesDir, pkgDirname, 'package.json'))
} catch (err) {
  console.log(chalk.red(`package "${syncPackageName}" was not found`))
  console.error(err)
  process.exit(1)
}

const newVersion = syncPackageJson.version

if (!newVersion) {
  console.log(chalk.red(`package "${syncPackageName}" is missing "version"`))
  process.exit(1)
}

console.log(`${syncPackageName}: ${newVersion}\n`)

const getDirectories = source => {
  return fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

const packages = getDirectories(packagesDir)
packages.forEach(pkg => {
  const filepath = path.resolve(packagesDir, pkg, 'package.json')
  const exists = fs.existsSync(filepath)
  if (!exists) {
    return
  }
  const stat = fs.statSync(filepath)
  if (!stat.isFile) {
    return
  }

  const packageJson = require(filepath)
  if (!packageJson) {
    return
  }

  if (packageJson.name === syncPackageName) {
    return
  }

  const depsKeys = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']
  for (let depKey of depsKeys) {
    if (!packageJson[depKey]) {
      continue
    }

    if (!packageJson[depKey][syncPackageName]) {
      continue
    }

    const oldVersion = packageJson[depKey][syncPackageName]
    if (oldVersion === newVersion) {
      console.log(chalk.yellow(`not modified pkg ${pkg}:`.padEnd(30, '.'), `${oldVersion}`))
      return
    }

    packageJson[depKey][syncPackageName] = newVersion
    fs.writeFileSync(filepath, `${JSON.stringify(packageJson, null, 2)}\n`)
    console.log(chalk.green(`UPDATED pkg ${pkg}:`.padEnd(30, '.'), `${oldVersion} => ${newVersion}`))
  }
})
