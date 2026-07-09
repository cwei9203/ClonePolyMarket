"use client";

import Link from "next/link";
import { useState } from "react";
import { IconLogo } from "./icons";

// 昵称 + 密码 认证表单（ADR-005：无邮箱、无手续费）。门面阶段仅前端校验演示。
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isReg = mode === "register";
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (nickname.trim().length < 2) return setErr("昵称至少 2 个字符");
    if (password.length < 6) return setErr("密码至少 6 位");
    setErr(null);
    setDone(true);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 grid size-12 place-items-center rounded-xl bg-brand text-brand-ink">
          <IconLogo className="size-7" />
        </span>
        <h1 className="text-xl font-bold text-ink">{isReg ? "创建账号" : "欢迎回来"}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {isReg ? "注册即送 10,000 积分，开始你的预测之旅" : "登录继续你的预测之旅"}
        </p>
      </div>

      {done ? (
        <div className="rounded-xl border border-yes/30 bg-yes-soft p-5 text-center">
          <p className="font-medium text-yes">
            {isReg ? "注册成功！已发放 10,000 积分。" : "登录成功！"}
          </p>
          <Link href="/" className="mt-3 inline-block font-semibold text-brand underline">
            进入市场 →
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <label className="block text-sm font-medium text-ink-secondary">昵称</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="给自己起个响亮的名字"
            className="mt-1.5 w-full rounded-lg border border-border bg-surface-sunken px-3 py-2.5 text-ink outline-none focus:border-brand"
            autoComplete="username"
          />
          {isReg && <p className="mt-1 text-xs text-ink-muted">昵称唯一，将展示在排行榜上</p>}

          <label className="mt-4 block text-sm font-medium text-ink-secondary">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位"
            className="mt-1.5 w-full rounded-lg border border-border bg-surface-sunken px-3 py-2.5 text-ink outline-none focus:border-brand"
            autoComplete={isReg ? "new-password" : "current-password"}
          />

          {err && (
            <p role="alert" className="mt-3 text-sm font-medium text-no">
              {err}
            </p>
          )}

          <button
            type="submit"
            className="mt-5 w-full cursor-pointer rounded-lg bg-brand py-3 font-semibold text-brand-ink transition-colors hover:bg-brand-hover"
          >
            {isReg ? "注册并领取积分" : "登录"}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-ink-muted">
        {isReg ? (
          <>
            已有账号？<Link href="/login" className="font-medium text-brand">直接登录</Link>
          </>
        ) : (
          <>
            还没有账号？<Link href="/register" className="font-medium text-brand">免费注册</Link>
          </>
        )}
      </p>
    </div>
  );
}
