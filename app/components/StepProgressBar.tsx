"use client";

import React from "react";

type Props = {
  currentStep?: number; // 0,1,2,3
};

export default function StepProgressBar({ currentStep = 0 }: Props) {
  const steps = ["タイプ選択", "カート追加", "日時選択", "確認"];

  return (
    <div className="w-full flex flex-col items-center mt-8 mb-6">
      {/* ===== スマホ用 (〜md未満) ===== */}
      {/* 横スクロールOK / はみ出しても1が隠れないよう左パディング */}
      <div
        className="
          w-full flex md:hidden
          px-4
        "
      >
        <div
          className="
            flex flex-row flex-nowrap items-center
            gap-3
            text-[13px] text-gray-600
            whitespace-nowrap
            overflow-x-auto
            scroll-smooth
            pb-2
          "
        >
          {steps.map((label, index) => {
            const reached = index <= currentStep;
            return (
              <div
                key={index}
                className="flex flex-row items-center gap-2 flex-shrink-0"
              >
                {/* 丸番号 */}
                <div
                  className={
                    "flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-semibold border flex-shrink-0 " +
                    (reached
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-200 text-gray-700 border-gray-300")
                  }
                >
                  {index + 1}
                </div>

                {/* ラベル */}
                <span
                  className={
                    "text-[13px] leading-none font-medium " +
                    (reached ? "text-gray-900" : "text-gray-500")
                  }
                >
                  {label}
                </span>

                {/* 短い線（最後以外） */}
                {index < steps.length - 1 && (
                  <div className="w-5 h-px bg-gray-300 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== PC / タブレット用 (md以上) ===== */}
      {/* センター固定 / 折り返しなし / 横スクロールなし */}
      <div
        className="
          hidden md:flex
          flex-row flex-nowrap items-center justify-center
          gap-4 lg:gap-6
          text-[13px] text-gray-600
          whitespace-nowrap
        "
      >
        {steps.map((label, index) => {
          const reached = index <= currentStep;
          return (
            <div
              key={index}
              className="flex flex-row items-center gap-2 flex-nowrap"
            >
              {/* 丸番号 */}
              <div
                className={
                  "flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-semibold border flex-shrink-0 " +
                  (reached
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-200 text-gray-700 border-gray-300")
                }
              >
                {index + 1}
              </div>

              {/* ラベル */}
              <span
                className={
                  "text-[13px] leading-none font-medium " +
                  (reached ? "text-gray-900" : "text-gray-500")
                }
              >
                {label}
              </span>

              {/* 区切り線（最後以外） */}
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-gray-300 flex-shrink-0 lg:w-10" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
