import { test } from "node:test";
import assert from "node:assert/strict";
import { LingualSessionController } from "../src/fsm.js";
import type { LingualResult } from "../src/types.js";

test("LingualSessionController - monotonic generation increment and abort signal", () => {
  const fsm = new LingualSessionController();
  assert.equal(fsm.getCurrentGeneration(), 0);

  const req1 = fsm.beginRequest();
  assert.equal(req1.generation, 1);
  assert.equal(req1.signal.aborted, false);
  assert.equal(fsm.isLatest(1), true);

  // 开始第二个请求，req1 的 signal 必须被物理掐断！
  const req2 = fsm.beginRequest();
  assert.equal(req2.generation, 2);
  assert.equal(req2.signal.aborted, false);
  assert.equal(req1.signal.aborted, true, "req1 must be aborted when req2 begins");
  assert.equal(fsm.isLatest(1), false);
  assert.equal(fsm.isLatest(2), true);
});

test("LingualSessionController - rejects stale generation writes", () => {
  const fsm = new LingualSessionController();
  const req1 = fsm.beginRequest();
  const req2 = fsm.beginRequest();

  fsm.initPagination(2);

  const mockResult1: LingualResult = {
    spoken: "test 1",
    written: "test 1 written",
    sourceText: "source 1",
    annotated: "",
  };

  const mockResult2: LingualResult = {
    spoken: "test 2",
    written: "test 2 written",
    sourceText: "source 2",
    annotated: "",
  };

  // 陈旧世代写入必须返回 false，且不影响结果池
  const wrote1 = fsm.setPageResult(0, mockResult1, req1.generation);
  assert.equal(wrote1, false);

  // 最新世代写入返回 true
  const wrote2 = fsm.setPageResult(0, mockResult2, req2.generation);
  assert.equal(wrote2, true);

  assert.equal(fsm.getActiveResult()?.spoken, "test 2");
});

test("LingualSessionController - pagination cyclic navigation and snapshot", () => {
  const fsm = new LingualSessionController();
  const req = fsm.beginRequest();
  fsm.initPagination(3);

  const resA: LingualResult = { spoken: "A", written: "WA", sourceText: "SA", annotated: "" };
  const resB: LingualResult = { spoken: "B", written: "WB", sourceText: "SB", annotated: "" };
  const resC: LingualResult = { spoken: "C", written: "WC", sourceText: "SC", annotated: "" };

  fsm.setPageResult(0, resA, req.generation);
  fsm.setPageResult(1, resB, req.generation);
  fsm.setPageResult(2, resC, req.generation);

  let snap = fsm.getPaginationSnapshot();
  assert.equal(snap.pageIndex, 0);
  assert.equal(snap.totalPages, 3);
  assert.equal(snap.isMultiPage, true);
  assert.equal(fsm.getActiveResult()?.spoken, "A");

  // 下一页
  assert.equal(fsm.nextPage(), true);
  assert.equal(fsm.getActiveResult()?.spoken, "B");

  assert.equal(fsm.nextPage(), true);
  assert.equal(fsm.getActiveResult()?.spoken, "C");

  // 循环回第 1 页
  assert.equal(fsm.nextPage(), true);
  assert.equal(fsm.getActiveResult()?.spoken, "A");

  // 上一页循环到末尾
  assert.equal(fsm.prevPage(), true);
  assert.equal(fsm.getActiveResult()?.spoken, "C");
});

test("LingualSessionController - clearPagination leaves no ghost cards", () => {
  const fsm = new LingualSessionController();
  const req = fsm.beginRequest();
  fsm.initPagination(2);

  const resA: LingualResult = { spoken: "A", written: "WA", sourceText: "SA", annotated: "" };
  fsm.setPageResult(0, resA, req.generation);

  assert.equal(fsm.getReadyPages().length, 1);
  fsm.clearPagination();
  assert.equal(fsm.getReadyPages().length, 0);
});
