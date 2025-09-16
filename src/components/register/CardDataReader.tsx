import type { CardData } from '@/lib/types';

interface CardDataReaderProps {
    cardData: CardData;
}

export function CardDataReader({ cardData }: CardDataReaderProps) {
    return (
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Card UID:</span>
                <code className="font-code font-semibold">{cardData.cardUID}</code>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Block 1 Data:</span>
                <code className="font-code">{cardData.block1Data}</code>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Block 2 Data:</span>
                <code className="font-code">{cardData.block2Data}</code>
            </div>
        </div>
    )
}
