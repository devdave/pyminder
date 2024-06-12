import APIBridge from '@src/api'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { DayActivityEntry } from '@src/types'

export interface ReportBrokerFunctions {
    getDailyReport: (searchDate: Date) => UseQueryResult<DayActivityEntry[]>
}

export const useReportBroker = (api: APIBridge): ReportBrokerFunctions => {
    const useGetDailyReport = (searchDate: Date) => {
        const ymD = `${searchDate.getFullYear()}-${searchDate.getMonth() + 1}-${searchDate.getDate()}`
        return useQuery<DayActivityEntry[]>({
            queryKey: ['report', 'day', ymD],
            queryFn: () => api.report_day(searchDate.toISOString())
        })
    }

    return {
        getDailyReport: useGetDailyReport
    }
}
