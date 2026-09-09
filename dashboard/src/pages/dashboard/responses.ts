type DashboardPaginationResponse = {
    total: number;
    pageSize: number;
    current: number;
};

type DashboardErrorResponse = {
    code: number;
    message: string;
};


export type {
    DashboardPaginationResponse,
    DashboardErrorResponse
};