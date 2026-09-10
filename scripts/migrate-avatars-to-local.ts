import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const targetDir = path.join(process.cwd(), 'public', 'uploads', 'profile-photos');
  const backupDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 1. Fetch all 10 users with Base64
  const users: any[] = await prisma.$queryRawUnsafe(`
    SELECT id, email, name, role, image, avatar_url
    FROM users
    WHERE image LIKE 'data:image%' OR avatar_url LIKE 'data:image%'
    ORDER BY (COALESCE(OCTET_LENGTH(image), 0) + COALESCE(OCTET_LENGTH(avatar_url), 0)) ASC
  `);

  console.log(`Found ${users.length} users with Base64 images.`);

  // 2. Backup all 10 users raw Base64 data
  const backupPath = path.join(backupDir, 'raw_base64_avatars_backup.json');
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, JSON.stringify(users, null, 2), 'utf8');
    console.log(`✅ Saved raw Base64 backup for all ${users.length} users to ${backupPath} (${(fs.statSync(backupPath).size / (1024 * 1024)).toFixed(2)} MB)`);
  } else {
    console.log(`ℹ️ Backup file already exists at ${backupPath}`);
  }

  // Filter users based on mode
  let targetUsers = users;
  if (isDryRun) {
    // Dry run on Saket Verma and Aakash Verma
    targetUsers = users.filter(u => u.email === 'saket7174@gmail.com' || u.email === 'youstarrocks@gmail.com');
    console.log(`\n--- RUNNING DRY RUN ON ${targetUsers.length} USERS ---`);
  } else {
    console.log(`\n--- RUNNING FULL MIGRATION ON ALL ${users.length} USERS ---`);
  }

  for (const user of targetUsers) {
    console.log(`\nProcessing user: ${user.name} (${user.email}, ${user.role})...`);
    
    // Choose primary source string (avatar_url or image that starts with data:image)
    const rawData = (user.avatar_url && user.avatar_url.startsWith('data:image')) 
      ? user.avatar_url 
      : ((user.image && user.image.startsWith('data:image')) ? user.image : null);

    if (!rawData) {
      console.log(`Skipping ${user.email} - no Base64 found`);
      continue;
    }

    // Extract mime type and base64 buffer
    const match = rawData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/s);
    if (!match) {
      console.warn(`Could not parse data URI for ${user.email}`);
      continue;
    }

    let ext = match[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext !== 'jpg' && ext !== 'png' && ext !== 'webp' && ext !== 'gif') ext = 'png';
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `profile-${user.id}.${ext}`;
    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/profile-photos/${fileName}`;
    console.log(`   Saved image file: ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);

    // Update database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        image: relativeUrl,
        avatar_url: relativeUrl
      }
    });
    console.log(`   ✅ Database updated for ${user.name}: image & avatar_url -> ${relativeUrl}`);
  }

  console.log(`\n${isDryRun ? 'DRY RUN' : 'MIGRATION'} COMPLETE!`);
}

main().catch(console.error);
