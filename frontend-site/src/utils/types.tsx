import { ReactNode } from "react"

export interface ICustomLink {
    to: string
    label: string
    icon?: ReactNode
}

export interface IDataItem {
    label: string
    value: string | number
}

export interface IFooterLink {
    label: string,
    url: string
}