import { seedCourses } from '../lib/seedCourses';

async function main() {
    console.log('Starting DB Seed...');
    await seedCourses();
    console.log('DB Seed complete!');
}

main().catch(err => {
    console.error('Error during DB Seed:', err);
    process.exit(1);
});
