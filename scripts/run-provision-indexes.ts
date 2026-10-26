import { provisionAtlasSearchIndexes } from '../src/server/search/provision-indexes';

async function main() {
  try {
    await provisionAtlasSearchIndexes();
    console.log('Index provisioning check completed.');
  } catch (error) {
    console.log('MongoDB connection status:', (error as Error).message);
  }
}

main();
