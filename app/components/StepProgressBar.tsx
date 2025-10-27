'use client';
import React from 'react';

type Props = {
  currentStep?: number; // 0,1,2,3...
};

export default function StepProgressBar({ currentStep = 0 }: Props) {
  const steps = ['タイプ選択', 'カート追加', '日時選択', '確認・完了'];

  return (
    <div className="w-full flex flex-col items-center mt-8 mb-6">
      {/* ====== モバイル / タブレット版（縦レイアウト）
           - デフォルト表示
           - 1024px以上(lg以上)では非表示にする
      */}
      <div className="w-full max-w-sm flex flex-col gap-3 lg:hidden">
        {steps.map((label, index) => {
          const reached = index <= currentStep;
          return (
            <div key={index} className="flex items-start">
              {/* 丸い番号 */}
              <div
                className={`flex items-center justify-center
                            w-8 h-8 rounded-full text-sm font-semibold border flex-shrink-0
                            ${
                              reached
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-gray-200 text-gray-600 border-gray-300'
                            }`}
              >
                {index + 1}
              </div>

              {/* ラベルとガイドライン */}
              <div className="flex flex-col ml-3">
                <span
                  className={`text-sm font-medium ${
                    reached ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>

                {/* 縦方向のつなぎ線（最後のステップ以外だけ） */}
                {index < steps.length - 1 && (
                  <span
                    className={`mt-2 block w-12 h-[2px] ${
                      index < currentStep ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ====== PC版（横レイアウト）
           - 1024px以上(lg以上)で表示
      */}
      <div className="hidden lg:flex items-center flex-wrap justify-center gap-2">
        {steps.map((label, index) => {
          const reached = index <= currentStep;
          return (
            <div key={index} className="flex items-center">
              {/* 丸い番号 */}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold border
                ${
                  reached
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-200 text-gray-600 border-gray-300'
                }`}
              >
                {index + 1}
              </div>

              {/* ラベル */}
              <span
                className={`ml-2 mr-4 text-sm whitespace-nowrap ${
                  reached ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {label}
              </span>

              {/* 横方向のライン（最後のステップ以外だけ） */}
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-[2px] ${
                    index < currentStep ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
