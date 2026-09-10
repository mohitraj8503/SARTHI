const git = require('isomorphic-git');
const fs = require('fs');
const dir = '/home/mohitraj8503/Documents/SARTHI ';

async function resetMerge() {
  try {
    // isomorphic-git doesn't have a direct merge --abort, but we can checkout the branch to clear index if it's dirty
    // Or we can just read the status
    const status = await git.statusMatrix({ fs, dir });
    console.log(status.filter(row => row[1] !== row[2] || row[2] !== row[3]));
  } catch (e) {
    console.error(e);
  }
}
resetMerge();
