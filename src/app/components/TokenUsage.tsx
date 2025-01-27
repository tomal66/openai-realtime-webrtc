import React from 'react';

interface TokenUsageProps {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

const TokenUsage: React.FC<TokenUsageProps> = ({
  inputTokens,
  outputTokens,
  totalTokens,
}) => {
  return (
    <div className="bg-gray-100 border border-gray-200 rounded-md p-4 w-full max-w-sm shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Token Usage</h3>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Input Tokens:</span>
        <span className="font-medium">{inputTokens}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Output Tokens:</span>
        <span className="font-medium">{outputTokens}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-800 font-bold border-t border-gray-300 pt-2">
        <span>Total Tokens:</span>
        <span>{totalTokens}</span>
      </div>
    </div>
  );
};

export default TokenUsage;
