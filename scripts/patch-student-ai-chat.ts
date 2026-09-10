import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, '../components/StudentAIChat.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF (\n) for search-and-replace
content = content.replace(/\r\n/g, '\n');

// 1. Replace the top auth check
const search1 = `          {/* Content Area - Conditional based on Auth */}
          {!user ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center relative"
              >
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <Sparkles className="w-12 h-12 text-emerald-500" />
              </motion.div>
              
              <div className="space-y-3">
                <h4 className="text-white font-bold text-2xl tracking-tight">Unlock SARTHI AI</h4>
                <p className="text-gray-400 text-sm leading-relaxed max-w-[280px] mx-auto">
                  Please sign in to access our AI-powered course counseling and student support.
                </p>
              </div>

              <Link href="/login" className="w-full max-w-[240px]">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-3"
                >
                  Sign In Now
                  <ArrowRight size={20} />
                </motion.button>
              </Link>

              <div className="pt-4">
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Secure Access Only</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Area - Frosted Glass Content */}`;

const replace1 = `          {/* Content Area */}
          <>
            {/* Messages Area - Frosted Glass Content */}`;

if (!content.includes(search1)) {
  console.error("Could not find block 1 in StudentAIChat.tsx");
  process.exit(1);
}

content = content.replace(search1, replace1);

// 2. Replace the bottom conditional closing brace
const search2 = `                <div className="mt-5 flex items-center justify-center gap-6 opacity-30">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
                  <p className="text-[9px] text-white font-black uppercase tracking-[0.6em] whitespace-nowrap">
                    FUTURE TECH HUB
                  </p>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
                </div>
              </div>
            </>
          )}
        </motion.div>`;

const replace2 = `                <div className="mt-5 flex items-center justify-center gap-6 opacity-30">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
                  <p className="text-[9px] text-white font-black uppercase tracking-[0.6em] whitespace-nowrap">
                    FUTURE TECH HUB
                  </p>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
                </div>
              </div>
            </>
        </motion.div>`;

if (!content.includes(search2)) {
  console.error("Could not find block 2 in StudentAIChat.tsx");
  process.exit(1);
}

content = content.replace(search2, replace2);

// Re-normalize back to Windows CRLF before writing
const finalContent = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log("Successfully patched StudentAIChat.tsx with line normalization!");
