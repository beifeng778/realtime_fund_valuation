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
  const results: FundSearchItem[] = [];

  for (const item of fundListCache) {
    if (results.length >= limit) break;
    // 排除货币型基金（通常不看估值）
    if (item.type.includes("货币")) continue;

    if (
      item.code.includes(kw) ||
      item.name.includes(keyword.trim()) ||
      item.pinyin.includes(kw)
    ) {
      results.push(item);
    }
  }

  return results;
}
