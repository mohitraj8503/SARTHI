import fs from 'fs';
import path from 'path';

const projectDir = '/home/mohitraj8503/Documents/SARTHI';
const audit = JSON.parse(fs.readFileSync('/home/mohitraj8503/.gemini/antigravity/brain/fffdbd3e-9731-43d0-8f74-396f4022a183/scratch/users_audit.json', 'utf8'));

// 1. Prisma relations on model User
const schema = fs.readFileSync(path.join(projectDir, 'prisma/schema.prisma'), 'utf8');
const userModelMatch = schema.match(/model User\s+{([^}]+)}/);
const userRelations: { field: string; type: string; isList: boolean }[] = [];

if (userModelMatch) {
  const lines = userModelMatch[1].split('\n');
  for (const l of lines) {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('@@') || trimmed.startsWith('//')) continue;
    const parts = trimmed.split(/\s+/);
    const fieldName = parts[0];
    const fieldType = parts[1];
    // Check if fieldType refers to a known relation (capitalized model name)
    if (/^[A-Z]/.test(fieldType) && !['String', 'Int', 'Boolean', 'DateTime', 'Float', 'Json'].includes(fieldType.replace('[]', '').replace('?', ''))) {
      userRelations.push({
        field: fieldName,
        type: fieldType,
        isList: fieldType.endsWith('[]')
      });
    }
  }
}

// 2. Scan codebase for column usage
function getSourceFiles(dir: string, fileList: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', '.next', '.git', 'dist', 'prisma', 'scratch', 'backups'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) getSourceFiles(full, fileList);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) fileList.push(full);
  }
  return fileList;
}

const files = getSourceFiles(projectDir).map(p => ({
  path: path.relative(projectDir, p),
  content: fs.readFileSync(p, 'utf8')
}));

const columnUsage: Record<string, { totalHits: number; sampleFiles: string[] }> = {};

for (const col of audit.columns) {
  const cName = col.Field;
  // Regex to match user.cName, user?.cName, select: { cName: true }, or destructuring
  const regex = new RegExp(`(\\buser\\??\\.${cName}\\b|\\b${cName}:\\s*true|\\bcurrentUser\\??\\.${cName}\\b)`, 'g');
  let hits = 0;
  const matchedFiles: string[] = [];

  for (const f of files) {
    const m = f.content.match(regex);
    if (m) {
      hits += m.length;
      matchedFiles.push(f.path);
    }
  }

  columnUsage[cName] = {
    totalHits: hits,
    sampleFiles: matchedFiles.slice(0, 5)
  };
}

// 3. Classification of columns based on data and semantics
const classifiedColumns = audit.columnStats.map((c: any) => {
  const cName = c.column;
  const nonNull = c.overallNonNull;
  const student = c.perRole.STUDENT?.nonNull || 0;
  const instructor = c.perRole.INSTRUCTOR?.nonNull || 0;
  const admin = c.perRole.ADMIN?.nonNull || 0;
  const mentor = c.perRole.MENTOR?.nonNull || 0;
  const teacher = c.perRole.TEACHER?.nonNull || 0;

  let classification = 'COMMON';
  let reasoning = '';

  if (nonNull === 0) {
    classification = 'UNUSED / ZERO POPULATED';
    reasoning = '0 rows populated across all 158 users in MySQL';
  } else if (student > 0 && instructor === 0 && admin === 0 && mentor === 0 && teacher === 0) {
    classification = 'STUDENT-ONLY';
    reasoning = `Populated strictly in ${student} STUDENT rows; 0 in staff/admin`;
  } else if ((instructor > 0 || teacher > 0) && student === 0 && admin === 0 && mentor === 0) {
    classification = 'TEACHER-ONLY';
    reasoning = `Populated in instructor/teacher rows only`;
  } else if (mentor > 0 && student === 0 && instructor === 0 && admin === 0 && teacher === 0) {
    classification = 'MENTOR-ONLY';
    reasoning = `Populated in mentor rows only`;
  } else if (admin > 0 && student === 0 && instructor === 0 && mentor === 0 && teacher === 0) {
    classification = 'ADMIN-ONLY';
    reasoning = `Populated in admin rows only`;
  } else if (['id', 'email', 'name', 'password', 'role', 'status', 'createdAt', 'updatedAt', 'lastLogin', 'loginCount', 'onboarded', 'emailVerified', 'image', 'avatar_url', 'platformSegment'].includes(cName)) {
    classification = 'COMMON';
    reasoning = 'Core identity, authentication, or account lifecycle field';
  } else {
    classification = 'SHARED-PARTIAL';
    reasoning = 'Populated across students and some staff (e.g. college, phone, currentCourse)';
  }

  return {
    ...c,
    classification,
    reasoning,
    codeHits: columnUsage[cName]?.totalHits || 0,
    sampleFiles: columnUsage[cName]?.sampleFiles || []
  };
});

const reportData = {
  totalColumns: audit.columns.length,
  userRelationsCount: userRelations.length,
  userRelations,
  classifiedColumns
};

fs.writeFileSync(
  '/home/mohitraj8503/.gemini/antigravity/brain/fffdbd3e-9731-43d0-8f74-396f4022a183/scratch/users_codebase_analysis.json',
  JSON.stringify(reportData, null, 2)
);

console.log('Analysis complete. Total relations on User model:', userRelations.length);
