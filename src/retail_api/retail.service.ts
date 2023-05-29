import { Injectable } from '@nestjs/common'
import { CrmType, Order, OrdersFilter, RetailPagination } from './types'
import axios, { AxiosInstance } from 'axios'
import { ConcurrencyManager } from 'axios-concurrency'
import { serialize } from '../tools'
import { plainToClass } from 'class-transformer'

@Injectable()
export class RetailService {
  private readonly axios: AxiosInstance

  constructor() {
    this.axios = axios.create({
      baseURL: `${process.env.RETAIL_URL}/api/v5`,
      timeout: 10000,
      headers: {},
    })

    this.axios.interceptors.request.use((config) => {
      // console.log(config.url)

      return config
    })
    this.axios.interceptors.response.use(
      (r) => {
        // console.log("Result:", r.data)
        return r
      },
      (r) => {
        // console.log("Error:", r.response.data)
        return r
      },
    )
  }

  async orders(filter?: OrdersFilter) {
    const params = serialize(filter, '')

    const resp = await this.axios.get(
      '/orders?' + params + `&apiKey=${process.env.RETAIL_KEY}`,
    )
    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const orders = plainToClass(Order, resp.data.orders as Array<any>)
    const pagination: RetailPagination = resp.data.pagination
    return { orders, pagination }
  }

  async findOrder(id: string): Promise<Order | null> {
    const resp = await this.axios.get(
      '/orders/' + id + `?apiKey=${process.env.RETAIL_KEY}&site=demo-magazin`,
    )
    if (!resp.data) throw new Error('RETAIL CRM ERROR')
    const data = plainToClass(Order, resp.data.order)

    return data
  }

  // async orderStatuses(): Promise<CrmType[]> {

  // }

  // async productStatuses(): Promise<CrmType[]> {

  // }

  // async deliveryTypes(): Promise<CrmType[]> {

  // }
}
