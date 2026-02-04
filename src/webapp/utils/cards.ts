export function getNumberActionsToShowPerRow(totalActions: number): number {
    return totalActions % 3 === 0 ? 3 : 4;
}
