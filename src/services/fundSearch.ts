export interface FundSearchItem {
  code: string;
  pinyin: string;
  name: string;
  type: string;
}

let fundListCache: FundSearchItem[] = [];
let loading = false;
let loaded = false;

/**
 * 加载基金列表（从天天基金 fundcode_search.js）
 * 仅首次调用时网络请求，后续使用缓存
 */
async function ensureLoaded(): Promise<void> {
  if (loaded) return;
  if (loading) {
    // 等待正在进行的加载
    await new Promise<void>((resolve) => {
      const check = () => {
        if (loaded) resolve();
        else setTimeout(check, 100);
      };
      check();
    });
    return;
  }

  loading = true;
  try {
    const resp = await fetch(`/api/search/fundcode_search.js?rt=${Date.now()}`);
    const text = await resp.text();
    // 格式: var r = [["000001","HXCZHH","华夏成长混合","混合型-灵活","HUAXIA..."], ...]
    // 用 indexOf 代替正则，避免大数据量下正则匹配失败
    const startIdx = text.indexOf("[");
    const endIdx = text.lastIndexOf("]");
    if (startIdx !== -1 && endIdx > startIdx) {
      const jsonStr = text.substring(startIdx, endIdx + 1);
      const arr: string[][] = JSON.parse(jsonStr);
      fundListCache = arr.map((item) => ({
        code: item[0],
        pinyin: item[1],
        name: item[2],
        type: item[3],
      }));
      console.log(`基金列表加载完成: ${fundListCache.length} 只基金`);
    }
    loaded = true;
  } catch (err) {
    console.error("加载基金列表失败:", err);
  } finally {
    loading = false;
  }
}

/**
 * 搜索基金（支持代码、名称、拼音）
 * @param keyword 搜索关键词
 * @param limit 返回数量上限
 */
export async function searchFunds(
  keyword: string,
  limit = 20,
): Promise<FundSearchItem[]> {
  await ensureLoaded();
  if (!keyword.trim()) return [];

  const kw = keyword.trim().toUpperCase();
  const kwRaw = keyword.trim();

  interface ScoredItem {
    item: FundSearchItem;
    score: number;
  }

  const scored: ScoredItem[] = [];

  for (const item of fundListCache) {
    let score = 0;

    // 代码匹配
    if (item.code === kw) {
      score = 100; // 代码精确匹配，最高优先
    } else if (item.code.startsWith(kw)) {
      score = 80; // 代码前缀匹配
    } else if (item.code.includes(kw)) {
      score = 40; // 代码包含匹配
    }

    // 名称匹配
    if (item.name === kwRaw) {
      score = Math.max(score, 95); // 名称精确匹配
    } else if (item.name.startsWith(kwRaw)) {
      score = Math.max(score, 70); // 名称前缀匹配
    } else if (item.name.includes(kwRaw)) {
      score = Math.max(score, 50); // 名称包含匹配
    }

    // 拼音匹配
    if (item.pinyin === kw) {
      score = Math.max(score, 90); // 拼音精确匹配
    } else if (item.pinyin.startsWith(kw)) {
      score = Math.max(score, 60); // 拼音前缀匹配
    } else if (item.pinyin.includes(kw)) {
      score = Math.max(score, 30); // 拼音包含匹配
    }

    if (score > 0) {
      scored.push({ item, score });
    }
  }

  // 按相关性分数降序排列，同分按代码升序
  scored.sort(
    (a, b) => b.score - a.score || a.item.code.localeCompare(b.item.code),
  );

  return scored.slice(0, limit).map((s) => s.item);
}
