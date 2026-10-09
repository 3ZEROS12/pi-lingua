/**
 * Monotonic Session FSM & Cancellation Controller (单调会话状态机与协同掐断控制器)
 * 
 * 物理职责：
 * 1. 单调递增世代追踪 (Generation Counter)，彻底杜绝异步竞态与陈旧回调屏幕覆写；
 * 2. 物理 AbortController 协同掐断：新请求到达时，瞬间 abort 掐断上一轮未决的远程网络 Socket；
 * 3. 封装分页池 (Pagination Pool) 与历史卡片缓存，消除散落全局的可变状态；
 * 4. 0 外部依赖，纯 TypeScript 原生事件模型。
 */

import type { LingualResult } from "./types.js";

export interface SessionRequestToken {
  readonly generation: number;
  readonly signal: AbortSignal;
}

export interface PaginationSnapshot {
  readonly pageIndex: number;
  readonly totalPages: number;
  readonly readyCount: number;
  readonly isMultiPage: boolean;
}

export class LingualSessionController {
  private activeAbortController: AbortController | null = null;
  private currentGeneration = 0;

  // 分页状态管理
  private pagedResults: LingualResult[] = [];
  private currentPageIndex = 0;
  private totalExpectedPages = 1;
  private lastResult: LingualResult | null = null;

  /**
   * 启动一次新的会话请求：
   * 1. 物理中断前序正在排队或流式传输的 HTTP 请求；
   * 2. 生成单调递增的新世代号；
   * 3. 绑定全新的 AbortSignal。
   */
  public beginRequest(): SessionRequestToken {
    this.abortActive();
    this.activeAbortController = new AbortController();
    const generation = ++this.currentGeneration;
    return {
      generation,
      signal: this.activeAbortController.signal,
    };
  }

  /**
   * 物理中断当前正在活跃的网络请求
   */
  public abortActive(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }

  /**
   * 判定指定世代号是否仍为当前最新的活跃世代
   */
  public isLatest(generation: number): boolean {
    return this.currentGeneration === generation;
  }

  /**
   * 获取当前最新世代号
   */
  public getCurrentGeneration(): number {
    return this.currentGeneration;
  }

  /**
   * 初始化分页池 (当输入被切分为多个意群分块时调用)
   */
  public initPagination(totalExpectedPages: number): void {
    this.pagedResults = [];
    this.currentPageIndex = 0;
    this.totalExpectedPages = Math.max(1, totalExpectedPages);
  }

  /**
   * 存入某个切片的翻译结果 (具备世代守卫，拒绝陈旧世代脏写)
   */
  public setPageResult(chunkIndex: number, result: LingualResult, generation: number): boolean {
    if (!this.isLatest(generation)) {
      return false; // 陈旧世代，果断拒绝写入
    }
    this.pagedResults[chunkIndex] = result;
    this.lastResult = result;
    return true;
  }

  /**
   * 获取当前展示页的翻译结果
   */
  public getActiveResult(): LingualResult | null {
    const readyList = this.getReadyPages();
    if (readyList.length === 0) {
      return this.lastResult;
    }
    if (this.currentPageIndex >= readyList.length) {
      this.currentPageIndex = Math.max(0, readyList.length - 1);
    }
    return readyList[this.currentPageIndex] || null;
  }

  /**
   * 获取所有已就绪的分页结果列表
   */
  public getReadyPages(): LingualResult[] {
    return this.pagedResults.filter((item): item is LingualResult => Boolean(item));
  }

  /**
   * 获取当前分页状态快照
   */
  public getPaginationSnapshot(): PaginationSnapshot {
    const readyCount = this.getReadyPages().length;
    const totalPages = Math.max(readyCount, this.totalExpectedPages);
    return {
      pageIndex: this.currentPageIndex,
      totalPages,
      readyCount,
      isMultiPage: totalPages > 1,
    };
  }

  /**
   * 翻至下一页 (循环翻页)
   * 返回 true 表示发生了有效翻页
   */
  public nextPage(): boolean {
    const readyList = this.getReadyPages();
    if (readyList.length <= 1) return false;
    this.currentPageIndex = (this.currentPageIndex + 1) % readyList.length;
    return true;
  }

  /**
   * 翻至上一页 (循环翻页)
   * 返回 true 表示发生了有效翻页
   */
  public prevPage(): boolean {
    const readyList = this.getReadyPages();
    if (readyList.length <= 1) return false;
    this.currentPageIndex = (this.currentPageIndex - 1 + readyList.length) % readyList.length;
    return true;
  }

  /**
   * 清空分页池 (在遇到非自然语言输入、或关闭伴学时调用，杜绝幽灵卡片复活)
   */
  public clearPagination(): void {
    this.pagedResults = [];
    this.currentPageIndex = 0;
    this.totalExpectedPages = 1;
  }

  /**
   * 获取上一条记录 (用于 /lingual-last 回显)
   */
  public getLastResult(): LingualResult | null {
    return this.lastResult;
  }

  /**
   * 显式设置上一条记录
   */
  public setLastResult(result: LingualResult | null): void {
    this.lastResult = result;
  }

  /**
   * 彻底重置状态机
   */
  public reset(): void {
    this.abortActive();
    this.clearPagination();
    this.lastResult = null;
  }
}
