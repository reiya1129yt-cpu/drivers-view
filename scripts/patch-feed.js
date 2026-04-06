import { readFileSync, writeFileSync } from "fs";

const filePath = "/vercel/share/v0-project/components/post-screen.tsx";
let src = readFileSync(filePath, "utf8");

// ── Find the broken block and replace it cleanly ─────────────────────────────
// The broken pattern: "&& (\n\n        {visiblePosts.map..." with bare <> fragments
const brokenPattern = /\{!isLoading && !swrError && visiblePosts\.length > 0 && \(\s*\n\s*\{visiblePosts\.map\(\(post: any, idx: number\) => \(\s*\n\s*<>\s*\n.*?Insert an ad card.*?\n.*?FeedAdCard.*?\n.*?post_type.*?\n.*?GasPricePostCard.*?\n.*?CarPostCard.*?\n.*?<\/>\s*\n.*?\)\)\}\s*\n\s*\)\}/s;

const fixedBlock = `{!isLoading && !swrError && visiblePosts.length > 0 && visiblePosts.map((post: any, idx: number) => (
          <React.Fragment key={String(post.id)}>
            {idx > 0 && idx % 5 === 0 && (
              <FeedAdCard adIndex={Math.floor(idx / 5) - 1} />
            )}
            {post.post_type === "gas_price"
              ? <GasPricePostCard post={post} isLoggedIn={isLoggedIn} />
              : <CarPostCard post={post} isLoggedIn={isLoggedIn} />
            }
          </React.Fragment>
        ))}`;

if (brokenPattern.test(src)) {
  src = src.replace(brokenPattern, fixedBlock);
  writeFileSync(filePath, src, "utf8");
  console.log("[v0] Patched feed block successfully via regex.");
} else {
  console.log("[v0] Regex did not match. Trying line-based approach...");

  const lines = src.split("\n");
  let startLine = -1;
  let endLine = -1;

  for (let i = 0; i < lines.length; i++) {
    // Find the broken opener: "&& (" at end of line with no map on same line
    if (
      lines[i].includes("!swrError && visiblePosts.length > 0 && (") &&
      !lines[i].includes(".map(")
    ) {
      startLine = i;
    }
    // Find the closing ")}" that closes the broken block
    if (startLine !== -1 && i > startLine && lines[i].trim() === ")}") {
      endLine = i;
      break;
    }
  }

  if (startLine !== -1 && endLine !== -1) {
    const indent = lines[startLine].match(/^(\s*)/)[1];
    const replacement = [
      `${indent}{!isLoading && !swrError && visiblePosts.length > 0 && visiblePosts.map((post: any, idx: number) => (`,
      `${indent}  <React.Fragment key={String(post.id)}>`,
      `${indent}    {idx > 0 && idx % 5 === 0 && (`,
      `${indent}      <FeedAdCard adIndex={Math.floor(idx / 5) - 1} />`,
      `${indent}    )}`,
      `${indent}    {post.post_type === "gas_price"`,
      `${indent}      ? <GasPricePostCard post={post} isLoggedIn={isLoggedIn} />`,
      `${indent}      : <CarPostCard post={post} isLoggedIn={isLoggedIn} />`,
      `${indent}    }`,
      `${indent}  </React.Fragment>`,
      `${indent}))}`,
    ];
    lines.splice(startLine, endLine - startLine + 1, ...replacement);
    writeFileSync(filePath, lines.join("\n"), "utf8");
    console.log(`[v0] Patched lines ${startLine + 1}–${endLine + 1} successfully.`);
  } else {
    // Last resort: print the lines around the suspected area so we can debug
    const idx = lines.findIndex(l => l.includes("visiblePosts.length > 0"));
    console.log("[v0] Could not find broken block. Lines around match:");
    for (let i = Math.max(0, idx - 2); i < Math.min(lines.length, idx + 20); i++) {
      console.log(`[v0] ${i + 1}: ${JSON.stringify(lines[i])}`);
    }
  }
}
