'use client';

import { QRCodeCanvas } from 'qrcode.react';

type QRCodeDisplayProps = {
  value: string;
};

export default function QRCodeDisplay({ value }: QRCodeDisplayProps) {
  return (
    <div className="p-4 bg-white border-4 border-gray-200 rounded-lg">
      <QRCodeCanvas
        value={value}
        size={256}
        level="H" // High error correction level
        includeMargin={true}
      />
    </div>
  );
}
