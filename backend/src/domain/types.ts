export type ColumnKey = "liked" | "learned" | "lacked";

export type Column = {
    id: string;
    key: ColumnKey;
    title: string;
    order: number;
};

export type Item = {
    id: string;
    columnId: string;
    text: string;
    votes: number;
    createdAt: string;
};

export type RoomState = {
    id: string;
    createdAt: string;
    expiresAt: string; // for TTL
    votingEnabled: boolean;
    columns: Column[];
    items: Item[];
};
