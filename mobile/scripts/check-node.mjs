const version = process.versions.node;
const major = Number(version.split('.')[0]);

if (Number.isNaN(major) || major < 20 || major >= 23) {
  console.error(
    `Luna29 mobile requires Node 20/22 LTS. Current Node: ${version}. Switch Node and run again.`
  );
  console.error('Example: nvm install 22 && nvm use 22');
  process.exit(1);
}

console.log(`Node ${version} is supported for Luna29 mobile.`);
